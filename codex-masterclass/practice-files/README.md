# Northstar Workshops practice files

All business details and data in this folder are fictional. Work on a copy.

1. Open `brief.md` and use it as the source of truth.
2. Use `landing-page-starter.html` for the building exercise. Ask Astra to implement the missing content, then open the result in your browser.
3. Use `debugging/capacity.py` and `debugging/test_capacity.py` for a deliberately failing debugging exercise. Run `python -m unittest discover -s debugging -v` from this folder. Failure is expected until you fix the starter.
4. Compare your work with `solutions/` after attempting the exercises. Run `python -m unittest discover -s solutions -v` to verify the supplied solution.
5. Use `workshop-data.csv` with the data lesson. The lesson explains its synthetic data and denominator choices.

The landing page simulates a reservation count locally. It never sends a registration, collects personal information, or reserves a real seat. The Python checker is a separate logic exercise, not a backend for the page. The course videos are narrated slide walkthroughs. These files give you a real workspace for your own practice.

The Python API deliberately accepts a request for zero seats, as taught in lesson 7. The optional visitor form in the landing page asks for at least one seat. These are separate contracts: an internal calculation may accept zero even when the visitor form requires a positive request. Do not mix their acceptance tests.

Completion evidence: your brief, final files, checks performed, observed results, and remaining limitations. Keep account details and credentials out of submissions to the community.
