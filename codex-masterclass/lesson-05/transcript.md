# Lesson 5: CSV analysis and producing useful reports

Narrated by Clara Moretti, the AI assistant at Orbix Automation Solutions. Written by Hector Diaz. Northstar Workshops is fictional; all examples are synthetic.

## 01 · Turn a CSV into a useful decision report

Clara again, the AI assistant at Orbix, with lesson five of Hector's class. A CSV is a plain-text table that many business tools can export. It can hold registrations, orders, survey responses, or content results. The challenge is not simply asking an agent to summarize it. The challenge is defining what each row means, calculating the right measures, and producing a report that supports a sensible decision.

This lesson uses workshop-data.csv, a supplied fixture containing twelve synthetic registrations for fictional Northstar Workshops. No row represents a real person or customer transaction. We will calculate attendance, ticket collections after refunds, and satisfaction while preserving the original file.

The report will help an owner identify what to investigate next. It will not prove why one workshop performed differently or predict future revenue. We will use the same verification habit from the research lesson: connect each important statement to evidence. Here the evidence is a set of source rows and explicit calculation rules. By the end, you will have a short report that another person can reproduce and review.

## 02 · Read the schema and row meaning

Start with the unit of observation: one row represents one registration for one workshop. It does not represent a unique community member, because the fixture contains no member identifier. You therefore cannot calculate unique-member participation or repeat attendance from these columns.

The schema includes registration_id, workshop_id, workshop_title, session_date, registration_status, attended, ticket_price_usd, refund_usd, satisfaction_score, and data_type. The final field labels every row synthetic. Status is confirmed or cancelled. Attended is zero or one. Satisfaction is an optional score from one through five.

For this exercise, ticket_price_usd represents the amount initially collected for that registration, including registrations later refunded. Refund_usd records the amount returned. This definition is essential: in another export, a column called price might represent a list price rather than collected cash. Never assume the meaning from a name alone. Ask for a data dictionary or state a provisional interpretation before calculating money. Our fixture supplies the interpretation explicitly so the arithmetic can be reproduced without guessing about billing behavior or accounting categories.

## 03 · Profile quality before analysis

Before calculating results, ask the agent to profile the file. It should find twelve rows, twelve unique registration identifiers, and three workshop identifiers. Every data_type value should be synthetic. Confirm that numeric fields parse correctly and that the expected categories appear without unexpected variations.

Check logical relationships as well as types. A cancelled registration should not be counted as an attendee in this fixture. Refunds should be nonnegative and no larger than the initially collected amount. A recorded satisfaction score should fall between one and five and belong to an attended registration.

The supplied file contains blanks in satisfaction_score. Those blanks are intentional, not corrupt rows. Several belong to people who did not attend, and one belongs to an attendee who provided no rating. Keep those distinctions visible. Do not replace all blanks with zero, because zero is outside the rating scale and would misrepresent missing responses. Preserve the source CSV and put any transformations in a separate working result, with the rules documented for the reviewer.

## 04 · Define metrics before computing them

A metric needs a numerator, a denominator, and a scope. For this lab, attendance rate means attended registrations divided by confirmed registrations. Cancelled registrations stay in the source file but are excluded from that denominator. This is an exercise definition, not a universal rule for every business.

Net ticket collections means the sum of initially collected amounts minus the sum of refunds across all rows. Call it net collections, not profit. The file contains no delivery costs, payment fees, taxes, or other expenses, so it cannot support a profit calculation.

Satisfaction means the average of nonblank scores from attended registrations. We will also report response coverage: rated attendees divided by all attendees. Without coverage, a rating can look more representative than it is. For Northstar, each definition connects the measure to the available columns. Write these rules before asking for calculations so the agent cannot quietly choose a different denominator or treat missing values as observed responses merely to produce a cleaner-looking report for the owner.

## 05 · Copy a reproducible analysis brief

The copyable prompt asks the agent to inspect workshop-data.csv, apply the lab's metric definitions, and create two outputs: a readable report and a workshop-level summary table. It also asks for the calculations or script needed to reproduce the results.

Make sure the file is actually available in your active workspace. If you copy it into another folder, update the path in your prompt. The lesson's original fixture sits beside its lesson JSON; your course package may provide another copy for convenience.

The analysis should use available calculation tools rather than relying only on a narrative estimate. If the environment cannot execute calculations, state that limitation and verify the small fixture manually. Do not claim a script ran when it did not. A useful handoff includes the saved paths, the metric definitions, and the checks performed. These details let you distinguish an attractive summary from a result whose numbers can be traced back to the source and recalculated when the underlying data changes in a later assignment.

## 06 · Verify the attendance calculation

The fixture contains twelve registrations: ten confirmed and two cancelled. Eight confirmed registrations attended. Using the agreed definition, overall attendance is eight divided by ten, which equals eighty percent.

The workshop-level rates are three of four for Workshop Promise Lab, two of three for Outline Builder, and three of three for Practice Session. Those are seventy-five percent, approximately sixty-six point six seven percent, and one hundred percent. Keep the underlying counts beside the percentages because these are very small groups.

Do not take the simple average of the three displayed rates and call it overall attendance. Each workshop has a different number of confirmed registrations. The overall measure should pool the numerators and denominators: eight attendees over ten confirmed registrations. That produces eighty percent, whereas the unweighted average is about eighty point five six percent. This small difference illustrates a larger reporting risk. When group sizes differ, averaging percentages can answer a different question from the one your report claims to answer for the business.

## 07 · Reconcile collections and refunds

Now check the money columns using every registration, including cancellations. Four Workshop Promise Lab registrations each initially collected forty dollars, totaling one hundred sixty dollars with no refunds. Four Outline Builder registrations each collected fifty dollars, totaling two hundred dollars, with one fifty-dollar refund.

Four Practice Session registrations each collected thirty dollars, totaling one hundred twenty dollars, with one thirty-dollar refund. Across the fixture, initially collected amounts total four hundred eighty dollars and refunds total eighty dollars. Net ticket collections therefore equal four hundred dollars.

The grouped net values are one hundred sixty, one hundred fifty, and ninety dollars. Their sum must match the overall net total. This reconciliation is a useful independent check because it compares the same measure calculated through two paths. Keep the terminology precise. Four hundred dollars is not profit, and the fixture provides no basis for calculating a profit margin. It is an illustrative cash calculation under the supplied column definitions, with expenses and other adjustments explicitly outside the dataset and this exercise.

## 08 · Handle missing satisfaction honestly

Seven of the eight attendees supplied a satisfaction score. The observed scores are five, four, four, three, five, four, and five. They sum to thirty. Divide thirty by seven to obtain approximately four point two nine on the five-point scale.

Response coverage is seven divided by eight, or eighty-seven point five percent. That number tells the reader how much of the attendee group the rating represents. The missing attendee response is unknown; it is not a zero and not automatically equal to the group average.

Workshop Promise Lab has two ratings from three attendees, averaging four point five. Outline Builder has two ratings from two attendees, averaging three point five. Practice Session has three ratings from three attendees, averaging approximately four point six seven. These are descriptive results from tiny synthetic groups. Report the counts and coverage rather than ranking workshop quality with false confidence. A lower observed score suggests a question to investigate; it does not establish the cause or prove that changing the curriculum will improve future results.

## 09 · Correct the common analysis failures

Suppose the first report says attendance was sixty-six point six seven percent because it divided eight attendees by all twelve registrations. The arithmetic is correct for that fraction, but it violates our agreed attendance definition. Correct the denominator to ten confirmed registrations and label the metric clearly.

Another failure is filling blank ratings with zero. That turns nonresponses into negative observations and includes nonattendees in a measure intended to describe attendee feedback. Restore the missing values and calculate the mean only from observed attendee scores, then report response coverage separately.

A third failure is saying Outline Builder caused lower engagement because its rate is lowest. The file does not explain why anyone missed a session, and the groups are too small to support a strong general conclusion. Request a descriptive statement and a follow-up question instead. Good correction identifies the precise analytical error, states the proper rule, and reruns affected totals. Changing the wording alone cannot repair a table whose underlying filtering or calculation remains wrong after the revision.

## 10 · Write a report that supports action

A useful report starts with the results the owner needs to understand: eighty percent attendance, four hundred dollars in net ticket collections, and a four point two nine observed satisfaction average with seven of eight attendees responding. Immediately identify the data as synthetic.

Then include a compact workshop table and a method note. The table should show confirmed registrations, attendees, attendance rate, collected amounts, refunds, net collections, rating count, mean rating, and response coverage. A reviewer can then move from the headline to the supporting groups without guessing how the numbers were produced.

Finish with a proportionate next step. For Northstar, the illustrative recommendation is to inspect Outline Builder's session feedback and registration process before changing the offer. Its small group has the lowest observed attendance and satisfaction, but the CSV does not reveal a cause. State that limitation beside the recommendation. Avoid adding a decorative chart unless it helps the decision. For three workshops and small counts, a clearly labeled table often communicates the evidence more accurately and efficiently.

## 11 · Exercise: reproduce the fixture results

Run the analysis on the supplied workshop-data.csv fixture. Preserve the original and create a readable report plus a workshop-level CSV summary. Include the script, formulas, or calculation steps needed to reproduce the output in your submission.

Your checks should establish twelve unique registrations, ten confirmed registrations, two cancellations, eight attendees, and seven observed attendee ratings. Confirm eighty percent attendance, four hundred eighty dollars initially collected, eighty dollars refunded, and four hundred dollars in net collections. The observed satisfaction average should round to four point two nine, with eighty-seven point five percent response coverage.

Show that the grouped counts and monetary totals reconcile to the overall values. For satisfaction, use pooled observed scores rather than averaging the workshop means. Add one cautious next action and explain why the file cannot establish causation or profit. You are being evaluated on data interpretation and reproducibility, not on the visual complexity of the report. A plain, accurate table with explicit rules is a successful submission when every important number can be traced to the fixture.

## 12 · Recap: useful analysis is reproducible

You have now taken a small CSV through a complete analytical workflow. You defined the row meaning, checked data quality, agreed on metric formulas, calculated results, reconciled grouped totals, and translated the evidence into a short report.

For Northstar, the same twelve rows support several different questions, but only when the definitions are clear. Attendance excludes cancelled registrations under our lab rule. Net collections includes initially collected amounts and refunds across all rows. Satisfaction uses observed attendee ratings and reports the missing-response boundary. Confusing those scopes creates believable numbers that answer the wrong questions.

Carry this habit into your own creator business. Before trusting a report, ask what each row represents, which records were included, how missing values were handled, and whether another person could reproduce the headline figures. Astra can help coordinate the steps when the necessary tools are available, but your acceptance criteria still define useful work. The final result should make the next decision clearer while preserving what the data does and does not establish. This is Clara, narrating for Hector Diaz and AI Auto Base. See you in lesson 6.
