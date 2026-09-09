// guard.mjs -- the reference guard for "The Brain That Runs a Company", Class 9.
//
// THIS FILE RUNS NOTHING. It has no spawn, no exec, no child_process import, and it
// never will. Its only job is to answer one question: may this command run?
//
// It ships in the pack so that `check-guard.mjs` can prove refusals on your machine
// BEFORE class, while nothing on your box is yet able to execute anything from a
// browser. In class you write your own (build prompt 04) and point the checker at it:
//
//     node check-guard.mjs --guard /path/to/your/cockpit/guard.mjs
//
// Nine rules. Each refusal names the rule that fired, because a refusal you cannot
// look up is a locked door rather than a teacher.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// Rule 1. We are not parsing a shell. We are refusing to be one.
//
// Everything below this line assumes argv[0] is the program and the rest are literal
// arguments. That assumption is only true if no shell ever sees the string. Refusing
// these characters is what makes the other eight rules mean anything -- with `;` or
// `$(` available, an allowlist of fifteen commands is an allowlist of every command.
const METACHARACTERS = /[;|&$`><\n\r]|\$\(|\$\{/;

const RULES = {
  1: 'shell metacharacter',
  2: 'empty command',
  3: 'command is not on the allowlist',
  4: 'subcommand is not allowed for this command',
  5: 'flag is not allowed for this command',
  6: 'this command changes things and the cockpit is in READ mode',
  7: 'path resolves outside the pinned root',
  8: '.env is refused by name',
  9: 'too many arguments',
};

function loadAllowlist(file) {
  const raw = fs.readFileSync(file ?? path.join(HERE, 'allowlist.json'), 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed.commands || typeof parsed.commands !== 'object') {
    throw new Error('allowlist.json has no "commands" object');
  }
  return parsed.commands;
}

// Split on whitespace, respecting single and double quotes. Deliberately simple: it
// does not handle escapes, because a string containing a backslash-escape is a string
// that wanted a shell, and rule 1 already said no.
function tokenize(input) {
  const out = [];
  let cur = '';
  let quote = null;
  let has = false;
  for (const ch of input) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
      has = true;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (/\s/.test(ch)) {
      if (has) { out.push(cur); cur = ''; has = false; }
    } else {
      cur += ch;
      has = true;
    }
  }
  if (has) out.push(cur);
  return out;
}

function refuse(rule, detail) {
  return {
    verdict: 'REFUSED',
    rule,
    reason: detail ? `${RULES[rule]}: ${detail}` : RULES[rule],
    argv: null,
  };
}

/**
 * Build a guard pinned to one root directory.
 *
 * There is no default root and there is no fallback to process.cwd(). A guard whose
 * root is "wherever the process happens to be" is a guard that protects a different
 * folder depending on how the server was started.
 */
export function makeGuard({ root, allowlistFile } = {}) {
  if (!root) {
    throw new Error(
      'guard: no root given. Set COCKPIT_ROOT to the brain folder. There is no default, ' +
      'on purpose -- a guard pinned to process.cwd() protects a different folder ' +
      'depending on how the server was started.'
    );
  }
  const realRoot = fs.realpathSync(root);
  const allow = loadAllowlist(allowlistFile);

  function insideRoot(arg) {
    // Resolve against the root, then follow symlinks for whatever part of the path
    // actually exists. Comparing resolved paths is what catches `../`, symlinks and
    // absolute paths in a single check -- string-matching on "../" catches none of them.
    let resolved = path.resolve(realRoot, arg);
    let probe = resolved;
    while (probe !== path.dirname(probe)) {
      if (fs.existsSync(probe)) {
        const real = fs.realpathSync(probe);
        resolved = path.join(real, path.relative(probe, resolved));
        break;
      }
      probe = path.dirname(probe);
    }
    return resolved === realRoot || resolved.startsWith(realRoot + path.sep);
  }

  function isEnvFile(arg) {
    const base = path.basename(path.resolve(realRoot, arg));
    return base === '.env' || base.startsWith('.env.');
  }

  function check(rawInput, mode) {
    const input = String(rawInput ?? '');

    // Rule 1 -- before anything else, and before tokenizing.
    if (METACHARACTERS.test(input)) {
      const m = input.match(METACHARACTERS);
      return refuse(1, `found ${JSON.stringify(m[0])}`);
    }

    const argv = tokenize(input);
    if (argv.length === 0) return refuse(2);

    const cmd = argv[0];
    const entry = allow[cmd];
    if (!entry) return refuse(3, cmd);

    if (entry.maxArgs != null && argv.length - 1 > entry.maxArgs) {
      return refuse(9, `${argv.length - 1} given, ${entry.maxArgs} allowed`);
    }

    // Rule 4 -- subcommands. argv[1] is consumed here and is not a path.
    let firstOperand = 1;
    if (entry.subcommands) {
      const sub = argv[1];
      if (!sub || !entry.subcommands.includes(sub)) {
        return refuse(4, `${cmd} ${sub ?? '(none)'}`);
      }
      firstOperand = 2;
    }

    // Rule 5 -- flags.
    const allowFlags = entry.allowFlags ?? [];
    for (let i = firstOperand; i < argv.length; i++) {
      const a = argv[i];
      if (a.startsWith('-') && !allowFlags.includes(a)) {
        return refuse(5, `${cmd} does not allow ${a}`);
      }
    }

    // Rule 6 -- mode. The client's mode is a request; this is the authorisation.
    if (entry.mode === 'WRITE' && mode !== 'WRITE') {
      return refuse(6, cmd);
    }

    // Rules 8 then 7, on every operand that is not a flag.
    for (let i = firstOperand; i < argv.length; i++) {
      const a = argv[i];
      if (a.startsWith('-')) continue;
      if (isEnvFile(a)) return refuse(8, a);
      if (!insideRoot(a)) return refuse(7, a);
    }

    return { verdict: 'ALLOWED', rule: null, reason: null, argv };
  }

  return { check, root: realRoot, rules: RULES };
}

export { RULES };
