# Class Scheduling and Attendance

This module manages the timing of sessions and tracks student participation.

## Class Scheduling
Teachers organize instructional time by scheduling classes linked to specific batches.

1.  **Regular Classes:** These constitute the typical weekly schedule for a batch. They are defined by the `day_of_week` (0-6) and specific start/end times.
2.  **Extra Classes:** These are one-off sessions scheduled for a specific date (`class_date`), separate from the regular weekly rhythm.

## Attendance Tracking
The system facilitates detailed recording of student attendance for all scheduled classes.

1.  **Recording:** Teachers mark attendance status (`present`, `absent`, or `late`) for students enrolled in the batch associated with the class. This creates records in the `attendance` table.
2.  **Cross-Batch Attendance Integration:** When a student is temporarily transferred to a different batch (using the `batch_transfers` feature), they appear on the attendance roster for that guest batch, allowing teachers to mark their attendance in that specific context.
3.  **Viewing:** Both teachers and students can view attendance records, restricted by their respective RLS policies.
