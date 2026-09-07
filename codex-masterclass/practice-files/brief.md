# Northstar Workshops brief

Synthetic teaching scenario. Northstar Workshops helps first-time workshop creators plan a practical session.

## Confirmed facts

- Weekly planning session: Tuesday.
- First member actions: introduce yourself and draft a one-sentence workshop idea.
- Capacity for the example workshop: 20 seats.
- The practice capacity checker begins with 8 confirmed seats.
- The remaining 12 seats are a calculation for the example, not a live inventory.

## Unknown facts

The exact meeting time, time zone, price, host biography, meeting link, and venue are unknown. Omit them or mark them as unconfirmed. Do not invent testimonials, income promises, customer counts, or performance statistics.

## Page brief

Build a single responsive HTML page that introduces the workshop, explains who it serves, lists the two preparation actions, and offers a practice email form. Include three proposed learning outcomes: define the workshop audience, draft a simple outline, and choose a next step. These are learning objectives for the fictional exercise, not promised business results. Use this proposed agenda without invented timings: introductions, workshop idea review, outline practice, and next steps. Use semantic headings and visible form labels. Clearly identify the page as a fictional practice example.

The main action should reach the practice email form. Reject empty or invalid email input. Valid synthetic input should produce an explicit simulation message without sending or storing the address. The extra capacity checker below is an optional follow-on exercise.

The number of requested seats must be a whole number of at least 1. Requests above the remaining capacity must fail. A valid request should display how many seats would remain. It must not submit information to a server or claim a real reservation exists. Each check is independent and does not change the initial 8 confirmed seats.

## Acceptance checks

At 20 capacity and 8 confirmed, a request for 1 leaves 11, a request for 12 leaves 0, and a request for 13 fails. Empty input, 0, negative values, and fractional values fail. The page remains usable at a 360px viewport and with only the keyboard. No external assets or services are required.

## Suggested prompt

Read brief.md and landing-page-starter.html. Implement the page described in the brief. Keep all files local and use no dependencies or external services. Preserve the confirmed facts and identify unknown facts. Test the capacity boundaries and explain which checks you actually performed. Produce the completed HTML file and a short handoff listing any remaining limitations.
