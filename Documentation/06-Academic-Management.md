# Academic Management

The academic management features allow teachers to assess student progress and manage official results.

## Tests and Marks
This module handles internal assessments conducted within the tuition center.

1.  **Test Creation:** Teachers schedule tests, defining parameters such as title, grade, subject, date, and the maximum possible marks. This information is stored in the `tests` table.
2.  **Marks Entry:** Following a test, teachers record the marks obtained by each participating student. These records are stored in the `marks` table, linking the specific test to the individual student profile.
3.  **Viewing Results:** Students can view their own marks for completed tests through their dashboard. RLS policies ensure that students can only see their own academic records.

## Board Results
This feature is designed for managing and displaying official external examination results (e.g., final school or state board exams).

1.  **Management:** Teachers can input and manage board results, recording the student's name, subject, marks obtained, maximum marks, and passing year. These are stored independently from internal test marks in the `board_results` table.
2.  **Public Visibility:** Board results are configured to be publicly viewable (`Public board results are viewable by everyone` policy on `board_results`), allowing them to be displayed on the application's landing page as a showcase of student achievement.
