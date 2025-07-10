### 📄 Software Requirements Specification (SRS)

## ✍️ Blog App – Personal Publishing Platform

### 1. Purpose

To enable users to write, publish, edit, and delete blog posts in a structured, secure environment.

### 2. Scope

The app provides authenticated users with a private blogging interface, complete with rich text formatting, category tagging, and CRUD operations.

### 3. Functional Requirements

* User authentication
* Create/edit/delete blog posts
* Rich text editor integration
* Optional post categories or tags
* View published posts in sorted format

### 4. Non-Functional Requirements

* Secure login with email/password
* Responsive UI on all devices
* Support for drafts and real-time editing
* Database validation and form sanitation

### 5. Tech Stack

* Frontend: React or Next.js, TailwindCSS
* Backend: Firebase Auth, Firestore or MongoDB
* Editor: React Quill or similar WYSIWYG tool

### 6. Assumptions

* Users can only manage their own posts
* All actions are authenticated and validated

### 7. Future Enhancements

* Comment system with moderation
* Markdown and rich-media support
* SEO-friendly URL structure and post metadata

### 8. Entity Relationship Diagram (ERD)

```
[User]
 └── id (PK)
 └── email
 └── password

[Post]
 └── id (PK)
 └── title
 └── content
 └── created_at
 └── updated_at
 └── user_id (FK → User.id)

[Category]
 └── id (PK)
 └── name

[PostCategory]
 └── post_id (FK → Post.id)
 └── category_id (FK → Category.id)
```

### 9. System Architecture Diagram (Description)

* **Frontend**: Built with React/Next.js and TailwindCSS, provides a responsive interface for authenticated users to manage blogs.
* **Authentication**: Managed using Firebase Auth.
* **Backend/Database**: Firestore or MongoDB stores users, blog posts, and categories with structured access control.
* **Data Flow**: Users send content to the backend via secured routes; responses are rendered with real-time updates.
