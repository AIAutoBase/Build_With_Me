# Lesson 07: Debug, review, test, and control changes — quiz

## 1. With capacity 20 and confirmed seats 12, how many remain?

A. 20
B. 12
C. 8
D. 32

## 2. With zero confirmed, which boundary result is correct?

A. 0 and 20 fit; 21 does not
B. Only 0 fits
C. 21 fits
D. 0 is invalid

## 3. A test cannot import its module. What should happen first?

A. Delete the test
B. Change expected capacity
C. Declare the repair complete
D. Check working directory and module setup

## 4. What does a worktree provide?

A. Automatic conflict resolution
B. A separate checkout sharing repository history
C. Independent external accounts
D. Guaranteed passing tests

## 5. A permission request blocks one dependency command. What is appropriate?

A. Grant all access permanently
B. Reset the project
C. Evaluate that command and its required scope
D. Disable all checks

## Answer key

1. **C — 8**. Remaining seats equal 20 minus 12.

2. **A — 0 and 20 fit; 21 does not**. The contract accepts nonnegative requests up to remaining capacity.

3. **D — Check working directory and module setup**. An import failure is not yet evidence of a business-rule defect.

4. **B — A separate checkout sharing repository history**. Separate working files help isolation, while integration still needs review.

5. **C — Evaluate that command and its required scope**. Permission should address the specific necessary action.

