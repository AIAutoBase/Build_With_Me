# Read this first -- one thing in this pack is unproven

**The draft half of this class rests on something nobody has tested yet.**

`prompts/P2-draft.md` writes a reply into your Drafts folder using an IMAP `APPEND`.
That is the right approach -- it needs no new account, no consent screen, and it reuses
the mailbox credentials you have had since Class 2.

**But at the time this pack was built, `APPEND` had not been run against a real mail
server by us.** Not once.

## What that means for you

It may work perfectly on your provider. It may also fail, for reasons that are known and
listed in `TROUBLESHOOT.md`:

- your Drafts folder is called something other than `Drafts`
- your server rejects `APPEND` on this account
- the `\Draft` flag is not set, so the message lands as *received mail*
- the payload has to be a full RFC 5322 message, not a body string

## So do the probe first

`assets/verify.sh` -- shipped here as `verify.sh` -- probes it for real. It connects,
finds your drafts folder, appends a throwaway message, confirms it landed, and deletes it
again.

**Run that before you build anything in P2.** Eight nodes against an untested assumption
is a bad afternoon.

If `APPEND` is rejected on your account, `docs/UPGRADE-gmail-api.md` is your path.

## What is NOT affected

`prompts/P1-digest.md` -- the whole clock half of the class -- does not touch IMAP
writing at all. **P1 is complete and stands on its own.** If P2 turns out not to work on
your provider, you still have a working morning digest, which was always the more useful
of the two.

`VERIFY.md`, `TROUBLESHOOT.md` and both upgrade docs are current and correct.
