# Lesson 5 reference report

All rows in `../workshop-data.csv` are synthetic. The row unit is one registration, not one unique community member.

Validation finds 12 unique registration IDs, 10 confirmed registrations, 2 cancelled registrations, and 8 attendance flags. The missing satisfaction scores remain missing.

| Metric | Definition | Result |
|---|---|---:|
| Attendance rate | 8 attended / 10 confirmed | 80% |
| Collected amounts | Sum of ticket_price_usd across all rows | $480 |
| Refunds | Sum of refund_usd across all rows | $80 |
| Net collections | $480 - $80 | $400 |
| Mean observed attendee satisfaction | Score sum 30 / 7 observed attendee scores | 4.29 / 5 |
| Score coverage | 7 observed attendee scores / 8 attendees | 87.5% |

| Workshop | Registrations | Confirmed | Attended | Collected | Refunded | Net |
|---|---:|---:|---:|---:|---:|---:|
| W01 | 4 | 4 | 3 | $160 | $0 | $160 |
| W02 | 4 | 3 | 2 | $200 | $50 | $150 |
| W03 | 4 | 3 | 3 | $120 | $30 | $90 |
| Total | 12 | 10 | 8 | $480 | $80 | $400 |

The totals reconcile. Net collections are not profit: no operating costs are supplied. Registration IDs do not establish a count of unique people. Missing satisfaction scores are not zero scores. The sample is too small and synthetic to support a claim that one workshop format caused better attendance.

A reasonable practice next step is to define a consistent way to collect an optional post-session score and document its coverage. Treat this as a proposed improvement, not a conclusion about real members.

Reproduce the calculations from this folder:

```text
python analyze_workshops.py ../workshop-data.csv workshop-summary.csv
```

The script preserves the raw CSV and writes the requested grouped summary.
