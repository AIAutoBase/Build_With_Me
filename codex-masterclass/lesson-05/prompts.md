# Lesson 05 prompt templates

## 13. Reproducible CSV analysis

Analyze synthetic workshop-data.csv; preserve it. Profile IDs, statuses, ranges, and blanks. Attendance=attended/confirmed; net collections=sum(ticket_price_usd)-sum(refund_usd); satisfaction=mean observed attendee scores. Report rating coverage. Save report.md and workshop-summary.csv; include reproducible calculations and checks.

## 14. Correct analysis definitions

Recalculate attendance using confirmed registrations only. Keep blank ratings missing; average observed attendee scores and report coverage. Remove causal claims unsupported by these rows. Regenerate affected tables and show the corrected numerators and denominators.

## 15. Report acceptance audit

Audit the synthetic Northstar report against workshop-data.csv. Recompute row counts, confirmed attendance, collected amounts, refunds, net collections, observed rating means, and rating coverage. Reconcile grouped totals. Check terminology and unsupported causal claims. Report failures with evidence; preserve the source.

