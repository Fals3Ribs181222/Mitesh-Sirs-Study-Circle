# Data Seeding Tools

During development and testing of features like the AI Report Card Generator, it's essential to have realistic mock data populated in the Supabase database. 

We have created three separate, lightweight HTML utility files that interact directly with the Supabase JavaScript API to clear out old dummy data and safely generate fresh, standardized test data while respecting rate limits.

## Overview of Seed Files

| File | Purpose | Order of Execution |
|---|---|---|
| `seed-students.html` | Generates 15 dummy students | **1st** |
| `seed-tests.html` | Generates 15 dummy test records scheduled by the logged-in teacher | **2nd** |
| `seed-marks.html` | Assigns randomized marks to the dummy students for the dummy tests | **3rd** |
| `seed-phone.html` | Assigns a specific phone number (e.g. 9769767219) to all students for WhatsApp testing | **Optional / 4th** |

---

## 1. `seed-students.html`

**Purpose**: Sets up the foundational student profiles required for marks and reports.

**Logic**:
1. Locates all existing students connected to the teacher's profile.
2. Identifies and deletes any students explicitly marked with `"Dummy Student"` in their data.
3. Generates 15 new dummy students with standardized names (e.g., `Dummy Student 1`, `Dummy Student 2`).
4. Assigns them to the **12th** grade with **Accounts, Commerce** as their subjects.
5. Injects a slight delay (`setTimeout`) between Supabase insertions to avoid tripping API rate limits.

---

## 2. `seed-tests.html`

**Purpose**: Creates academic assessments to which marks can be attached.

**Logic**:
1. Fetches all tests where `scheduled_by` matches the currently logged-in teacher.
2. Finds and deletes existing tests containing `"Dummy Test"` in their title.
3. Creates **15 new Dummy Tests**, alternating subjects between `Accounts` and `Commerce`.
4. Sets the `grade` uniformly to **12th** to match the generated students.
5. Randomizes recent dates and enforces a `max_marks` of **50** for each test.
6. Crucially attaches the active Teacher's `user.id` to the `scheduled_by` column so the tests appear correctly in the Teacher's academic dashboard.

---

## 3. `seed-marks.html`

**Purpose**: Bridges the gap between students and tests, synthesizing realistic academic performance data.

**Logic**:
1. Fetches all dummy students and dummy tests created by the previous scripts.
2. Identifies all existing marks associated with both these dummy students and dummy tests, and deletes them to start fresh.
3. Iterates through every test, and for each test, generates a mark for every single dummy student.
4. Generates a randomized `marks_obtained` array between **50% and 100%** of the `max_marks` capacity (e.g., between 25 and 50 marks out of 50).
5. Excludes the `updated_at` schema row to avoid violating Supabase column constraints during insertion.

---

## How to Run the Seed Scripts

Because these scripts rely heavily on the Teacher's active Supabase session (specifically capturing the `teacherSession.user.id` and enforcing RLS policies), **they must be run in a browser where a Teacher is actively logged into the application.**

### Execution Steps
1. Run your local server (e.g., `npx serve -l 8080`).
2. Open `http://localhost:8080/login.html` and log in as a Teacher.
3. Once logged in (you should be on `teacher_dashboard.html`), open a new tab in the **same browser**.
4. Navigate sequentially to the seed files:
   - Go to `http://localhost:8080/seed-students.html`. Once it finishes and confirms success on the screen, proceed.
   - Go to `http://localhost:8080/seed-tests.html`. Once finished, proceed.
   - Go to `http://localhost:8080/seed-marks.html`. Let it finish executing.
5. Once all three scripts complete successfully, navigate back to your `teacher_dashboard.html` tab.
6. Refresh the page to see your newly generated dummy data populated across your Student lists and Academic tests.
