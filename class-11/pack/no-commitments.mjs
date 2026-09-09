// no-commitments.mjs -- the outbound commitment filter.
//
// Clara takes messages. She does not commit.
//
// This is pattern matching and IT WILL MISS THINGS. That is stated here rather than
// buried, because a filter presented as complete is worse than no filter: it moves the
// question from "is this safe?" to "the filter passed it, so it must be".
//
// It exists anyway, for one reason. The same rule is in the system prompt, where it is a
// request the model can be talked out of by a caller who is persistent, or charming, or
// simply asking in a way that makes agreeing feel helpful. A check on the way out is not
// a request.
//
// When it fires it does NOT edit the sentence. Editing a commitment out of a sentence
// leaves a sentence that sounds like a commitment with a word missing. It replaces the
// whole reply.

export const TAKE_A_MESSAGE =
  "That's not something I can agree to on this call, but I'll take a message and make " +
  "sure the right person sees it. What would you like me to pass along?";

// English and Spanish. A filter that only covers English is a filter with a documented
// bypass, in a brand whose callers switch language mid-sentence as the normal case.
const PATTERNS = [
  // --- price and discount ---
  { id: 'price-en', re: /\b(?:i(?:'ll| will| can)?\s+(?:do|offer|give)\s+(?:it|that|you)\b.*\bfor\b|the price (?:is|will be)|we can go (?:down|as low as)|(?:i|we) can discount)/i },
  { id: 'price-es', re: /\b(?:te (?:lo|la) dejo en|el precio (?:es|ser[ií]a)|te (?:puedo )?hacer un descuento|podemos baj[ae]r)/i },

  // --- booking and dates ---
  { id: 'book-en', re: /\b(?:i(?:'ve| have)? (?:booked|scheduled)|(?:you'?re|your appointment is) (?:booked|scheduled|confirmed)|i'?ll (?:book|schedule|put you (?:down|in))|(?:let'?s|we'?ll) (?:say|make it) \w+day)/i },
  { id: 'book-es', re: /\b(?:te (?:lo )?agend[oé]|queda (?:agendado|confirmado)|te (?:reservo|apunto)|nos vemos el \w+)/i },

  // --- delivery and completion ---
  { id: 'deliver-en', re: /\b(?:it(?:'ll| will) be (?:ready|done|delivered|finished)|we(?:'ll| will) have it (?:ready|done|to you)|(?:ready|done|delivered) by \w+|within \d+ (?:days?|weeks?|hours?))/i },
  { id: 'deliver-es', re: /\b(?:(?:estar[aá]|lo tendr[eé]|lo tenemos) list[oa]|te lo (?:entrego|env[ií]o|mando) (?:el|para|en)|en \d+ (?:d[ií]as?|semanas?|horas?))/i },

  // --- scope ---
  { id: 'scope-en', re: /\b(?:yes,? we(?:'ll| will| can) (?:do|handle|cover|include)|that(?:'s| is) included|no (?:extra )?charge for)/i },
  { id: 'scope-es', re: /\b(?:s[ií],? (?:lo|eso) (?:hacemos|cubrimos|incluimos)|(?:est[aá]|va) inclu[ií]do|sin (?:costo|cargo) (?:extra|adicional))/i },

  // --- guarantees ---
  { id: 'guarantee-en', re: /\b(?:i (?:guarantee|promise)|we guarantee|you have my word|guaranteed\b)/i },
  { id: 'guarantee-es', re: /\b(?:(?:te|se) lo (?:garantizo|prometo)|garantizado\b|tienes mi palabra)/i },
];

/**
 * @param {string} text what the model wants to say
 * @returns {{ text: string, filtered: boolean, matched: string|null }}
 */
export function filterOutbound(text) {
  const input = String(text ?? '');
  for (const p of PATTERNS) {
    if (p.re.test(input)) {
      return { text: TAKE_A_MESSAGE, filtered: true, matched: p.id };
    }
  }
  return { text: input, filtered: false, matched: null };
}

export { PATTERNS };
