# Public Features

The application includes features designed for public visibility, primarily serving marketing and general information purposes on the landing page (`index.html`).

## Testimonials
The testimonials feature allows the tuition center to showcase positive feedback from past or present students.

1.  **Management:** Teachers have the authority to manage testimonials. They can input the student's name, their testimonial text, subject, passing year, and optionally link media (like images or videos) via a `media_url` and `media_type`. This data is stored in the `testimonials` table.
2.  **Storage Integration:** The system uses a dedicated Supabase Storage bucket named `testimonials` to host any associated media files uploaded by teachers.
3.  **Public Display:** Testimonials are explicitly meant to be public facing. The `testimonials` table has a policy allowing public read access, and the corresponding storage bucket is also configured for public access. This allows the landing page to seamlessly fetch and display these testimonials without requiring users to be authenticated.

## Landing Page Integrations
The `index.html` file serves as the public face of the application. It dynamically fetches and displays information from the public-facing tables to engage prospective students and parents:

-   **Board Results Showcase:** The landing page presents the top achievements stored in the `board_results` table, demonstrating the academic success of the tuition center's students.
-   **Testimonials Display:** It highlights the feedback and experiences shared by students, stored in the `testimonials` table, to build trust.
-   **Public Information:** While core features like schedules or materials require login, the landing page acts as the entry point, providing general tuition information and links to the `login.html` portal.
