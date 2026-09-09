// call-scope.mjs -- the reference phone call handler, reduced to the part that matters.
//
// This file makes no network call, places no call and answers no webhook. It exists so
// that `check-call-scope.mjs` has something real to read before class, and so that the
// four assertions it makes are assertions about working code rather than about prose.
//
// In class you write your own handler (build prompts 05 and 12) and point the checker at
// it:
//
//     node check-call-scope.mjs --handler ../brain/phone/handler.mjs
//
// The shipped version is the shape yours has to keep, not the code you ship.

import { filterOutbound } from './no-commitments.mjs';

// ---------------------------------------------------------------------------------
// The zone list for phone callers.
//
// Whoever is on this channel is UNAUTHENTICATED. Caller ID is not authentication: it is
// trivially spoofed, and even when it is honest it identifies a handset rather than a
// person.
//
// This is a hardcoded constant on purpose. It is not read from the environment, not from
// a config file, not from the database, and there is no dashboard control that changes
// it. Widening it is a code change that shows up in a diff and in git history.
//
// A configurable value would have a default. Somebody sets it to all four at 2am to test
// something, and it stays that way, and nothing ever reports a problem -- because from
// every direction except a caller asking the right question, a widened scope behaves
// identically to a correct one.
// ---------------------------------------------------------------------------------
export const PHONE_ZONES = Object.freeze(['general', 'business']);

// The two zones deliberately absent are `personal` and `clients`. The Class 10 search
// function has no way to express "all zones" -- it throws without an explicit list -- so
// there is no convenient wrong answer available at this call site.

/**
 * Handle one turn of a call or one inbound text.
 *
 * `deps` carries the pieces the host injects: searchFiles (from Class 10), searchMemory
 * (from Class 3), and askModel. Injecting them is what lets the checker and the tests
 * reach this function without a database, a phone line or a model.
 */
export async function handleTurn({ callerText, channel }, deps) {
  const { searchFiles, searchMemory, askModel } = deps;

  // Both searches are scoped. Neither is ever called without an explicit zone list.
  const documents = await searchFiles({
    query: callerText,
    zones: PHONE_ZONES,
    limit: 5,
  });

  const memories = await searchMemory({
    query: callerText,
    zones: PHONE_ZONES,
    limit: 5,
  });

  // If nothing in the reachable zones answers the question, Clara says something true
  // rather than "I don't know". Note what did NOT happen here: we did not search the
  // restricted zones and then decline to use the result. The restricted documents were
  // never loaded into this process, so there is nothing here to leak under any prompt.
  if (documents.length === 0 && memories.length === 0) {
    return {
      text: OUT_OF_SCOPE,
      outcome: 'out-of-scope',
      filtered: false,
      zonesUsed: PHONE_ZONES,
    };
  }

  const draft = await askModel({
    callerText,
    documents,
    memories,
    channel,
    system: SYSTEM_PROMPT,
  });

  // The commitment filter runs HERE: after the model, before anything is spoken or sent.
  //
  // The system prompt also tells the model not to commit to anything. That rule drifts
  // under conversational pressure; this one does not, because it is not a rule the model
  // is asked to follow. It is a check on the way out.
  const { text, filtered } = filterOutbound(draft);

  return {
    text,
    outcome: filtered ? 'filtered' : 'answered',
    filtered,
    zonesUsed: PHONE_ZONES,
  };
}

const OUT_OF_SCOPE =
  "I can't get to that from the phone - that one's in a part of the brain this number " +
  "doesn't reach. I can take a message.";

const SYSTEM_PROMPT = [
  'You are Clara, an AI assistant answering a phone call. You are not a person and you',
  'never claim to be one.',
  '',
  'Answer in two sentences or fewer. Nobody listens to a paragraph on a phone call.',
  '',
  'You take messages. You do not commit. You do not agree a price, confirm a date, book',
  'an appointment, promise a delivery time, accept a scope of work, or guarantee',
  'anything. If asked for any of those, say you will take a message.',
  '',
  'Answer only from the documents and memories provided. If they do not answer the',
  'question, say so plainly and offer to take a message.',
].join('\n');

export { OUT_OF_SCOPE, SYSTEM_PROMPT };
