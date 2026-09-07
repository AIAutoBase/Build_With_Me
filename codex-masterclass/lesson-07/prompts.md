# Lesson 07 prompt templates

## 19. Reproduce and diagnose

Read guidance and the capacity checker. Reproduce the reported defect before editing. Capacity=20, remaining=capacity-confirmed_seats. Record inputs, expected and observed results, and the test command. Identify the cause without changing unrelated files.

## 20. Focused repair

Repair the checker using its documented API. Validate integer confirmed_seats in 0..20 and nonnegative integer seats_requested; reject bools and fractions. Zero requested is valid. Cover confirmed=0 with requests 0,20,21 and confirmed=12 with requests 8,9. Run focused and required checks. Preserve unrelated edits.

## 21. Review and handoff

Review the final capacity patch and actual test results. Explain each changed file, the root cause, and remaining limits. Inspect Git status and diff if available; preserve others' edits. Report the verified version. Do not push, merge, publish, or make destructive resets.

