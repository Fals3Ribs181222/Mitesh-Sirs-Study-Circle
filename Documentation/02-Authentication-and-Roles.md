# Authentication and Roles

The application utilizes Supabase Authentication for secure user management.

## User Lifecycle
1.  **Sign Up:** Users can sign up via `login.html`.
2.  **Profile Creation:** A PostgreSQL database trigger (`on_auth_user_created`) automatically intercepts new user creation on `auth.users` and creates a corresponding record in the `public.profiles` table. This populates necessary initial data like name, username (derived from email if not provided), and sets a default role.

## Roles
The system operates on a Role-Based Access Control (RBAC) model with two primary roles:

### 1. Student (Default)
This is the default role assigned to any new user upon signup.
-   **Capabilities:**
    -   View their profile.
    -   View public announcements, files, tests, and marks.
    -   View schedules for batches they are enrolled in.
    -   View their own attendance.
-   **Access Level:** Primarily read-only access to system data, restricted to their specific context.

### 2. Teacher
This role must be designated explicitly (typically by another administrator or manual database intervention initially).
-   **Capabilities:**
    -   Full management access over `profiles`.
    -   Create and manage `announcements`, `files`, `tests`, and `marks`.
    -   Manage `batches`, enroll students into batches (`batch_students`).
    -   Schedule regular and extra `classes`.
    -   Record and manage `attendance`.
    -   Manage `batch_transfers` (cross-batch attendance).
    -   Manage public `board_results` and `testimonials`.
    -   Upload to storage buckets (`materials`, `testimonials`).
-   **Access Level:** Administrative.

## Security implementation (RLS)
The database structure heavily relies on PostgreSQL Row Level Security (RLS). Policies restrict access based on the `auth.uid()` and the user's role defined in the `profiles` table. A helper function `public.is_teacher()` is frequently used in these policies to determine if the currently authenticated user has the necessary elevated permissions to perform data mutations (INSERT, UPDATE, DELETE).
