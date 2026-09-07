# Synthetic capstone analysis

Source: `../capstone-data.csv`. These are three invented historical workshop sessions used in Lesson 10. They are separate from the Lesson 5 dataset.

All three workshop identifiers are unique. Numeric fields are whole numbers, capacity is positive, confirmed seats do not exceed capacity, and attended counts do not exceed confirmed seats. No fields are missing.

| Measure | Calculation | Result |
|---|---|---:|
| Total capacity | 20 + 20 + 20 | 60 seats |
| Confirmed seats | 16 + 12 + 20 | 48 seats |
| Attended | 12 + 9 + 15 | 36 attendees |
| Attendance rate | 36 / 48 | 75% |
| Confirmation occupancy | 48 / 60 | 80% |
| Confirmed seats without attendance | 48 - 36 | 12 seats |

The sample describes these fictional sessions only. It does not establish why someone attended, measure page conversion, or forecast future demand. Aggregate rates use aggregate counts. If a denominator is zero in a different dataset, report the rate as undefined.

Reproduce the analysis with `python analyze_capstone.py ../capstone-data.csv` from this solutions folder.
