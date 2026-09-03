# The practice documents

> **Why this file is `.txt` and not `.md`.** The ingest workflow picks up `*.md` from this
> folder. This file is the answer key — ingest it and a question about your deductible can
> retrieve *this table* instead of the policy, cite `README.md` as its source, and look
> like it worked. A `.txt` extension keeps it out of the glob. Don't rename it.

Four documents with the shape of real business paperwork and entirely invented details.
Nothing here belongs to a real company, a real policy or a real person.

Everyone in the class works from these, so the numbers on your screen match the numbers
in the videos. When yours don't match, that's a signal — not a coincidence.

| File | What it is | The kind of thing it answers |
|---|---|---|
| `warehouse-lease.md` | 36-month commercial lease, Unit 12B | rent, escalation, deposit, notice periods |
| `insurance-policy.md` | General liability policy, Northgate Mutual | limits, deductible, exclusions, claim window |
| `equipment-warranty.md` | Dishwasher warranty, Vulcan VX-900 | parts vs labor coverage, what voids it |
| `invoice-supplyco.md` | Roofing materials invoice, Net 30 | totals, tax, terms, late charges |

They belong to the same fictional business — **Ridgeline Contracting LLC** — on purpose.
A real memory holds documents that talk about each other, and questions that cross two
documents are where this stops being a search box.

---

## Answer key

Use these to check your build. If your system gives a different figure, something in your
pipeline is wrong — most likely the wrong chunk was retrieved, or the question and the
documents were embedded with different models.

| Question | Answer | From |
|---|---|---|
| What is my property damage deductible? | $2,500 per occurrence | `insurance-policy.md` |
| How much is rent and when does it go up? | $3,850/month, +3% annually | `warehouse-lease.md` |
| Is labor covered on the dishwasher after 18 months? | No — labor is 12 months only, even when the part is still covered | `equipment-warranty.md` |
| How much notice do I need to renew the lease? | Not less than 120 days before expiration | `warehouse-lease.md` |
| How much is the security deposit? | $7,700, two months of base rent | `warehouse-lease.md` |
| What is the total on the SupplyCo invoice? | $6,673.76 | `invoice-supplyco.md` |
| What's the each-occurrence limit? | $1,000,000 | `insurance-policy.md` |

## Questions it must refuse

These matter more than the ones above.

| Question | Why it must refuse |
|---|---|
| What is my employee health plan copay? | **The dangerous one.** Plausible business paperwork, sounds like it should be in there, and isn't. This is the one that catches a system willing to guess. |
| Who won the 2024 World Series? | Obviously outside the documents. Tests whether outside knowledge leaks in from the model's own training. |
| What is my dog's name? | Nothing in the corpus is remotely close, so retrieval scores near zero. Tests the threshold rather than the model. |

Expected response, word for word:

```json
{ "answered": false, "answer": "I don't have that in your documents.", "sources": [] }
```

## Two questions worth trying once it works

Neither is answerable from a single chunk, which is the point.

**"Am I covered if a roof I installed leaks?"** — the policy excludes faulty workmanship
on the insured's own completed work. A good answer finds that exclusion. A lazy one sees
"products and completed operations aggregate: $1,000,000" and tells you that you're
covered for a million dollars.

**"When is the invoice due and what happens if I'm late?"** — Net 30, due 1 September
2026, 1.5% monthly finance charge. Two facts, one document, different sections.

---

*Invented details, real shape. Practise here before you point this at anything of yours.*
