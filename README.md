# LMS Backend (Spring Boot + MySQL + JWT)

A REST API for a Learning Management System: course & material management,
enrollment, assignments, submissions/grading, and progress tracking.

## Stack
- Java 17, Spring Boot 3.3
- Spring Web, Spring Data JPA + Hibernate
- Spring Security + JJWT (stateless JWT auth)
- MySQL 8

## 1. Configure the database
Create a MySQL database (or let Hibernate auto-create it) and update
`src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lms_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: root
    password: root
```

Also change `app.jwt.secret` to a long random string before deploying anywhere
real — the placeholder in the repo is for local dev only.

## 2. Run the backend
```bash
cd lms-backend
mvn spring-boot:run
```
The API starts on `http://localhost:8080`. Hibernate will create/update all
tables automatically (`ddl-auto: update`).

## 3. Roles & Auth
Three roles: `ADMIN`, `INSTRUCTOR`, `STUDENT`. Register via
`POST /api/auth/register` with a `role` field (defaults to `STUDENT` if
omitted). Every protected endpoint expects:
```
Authorization: Bearer <jwt>
```
Tokens are returned from `/api/auth/register` and `/api/auth/login` and are
valid for 24 hours (configurable in `application.yml`).

## 4. Core endpoints

| Area | Endpoint | Access |
|---|---|---|
| Auth | `POST /api/auth/register`, `/login` | Public |
| Courses | `GET /api/courses/public` | Public (published only) |
| Courses | `POST /api/courses` | Instructor/Admin |
| Courses | `PATCH /api/courses/{id}/publish?published=true` | Instructor/Admin |
| Materials | `POST /api/courses/{id}/materials` | Instructor/Admin |
| Enrollment | `POST /api/enrollments/{courseId}` | Student |
| Assignments | `POST /api/courses/{id}/assignments` | Instructor/Admin |
| Submissions | `POST /api/assignments/{id}/submissions` | Student |
| Grading | `PATCH /api/submissions/{id}/grade` | Instructor/Admin |
| Progress | `GET /api/progress/me` | Student |

## 5. Testing with Postman
Import `LMS_Postman_Collection.json` into Postman. Workflow:
1. Run **Register Instructor** and **Register Student** (or just Login if
   they already exist) — copy each returned `token`.
2. Set the collection variables `instructorToken` and `studentToken`.
3. Create a course as the instructor, note its `id`, set the `courseId`
   variable, then publish it.
4. Enroll as the student, create an assignment as the instructor, submit as
   the student, grade as the instructor, then check `/progress/me`.

## 6. Project layout
```
src/main/java/com/lms/
  entity/       JPA entities (User, Course, LearningMaterial, Enrollment, Assignment, Submission)
  repository/   Spring Data JPA repositories
  service/      Business logic
  controller/   REST controllers
  security/     JwtUtil, JwtAuthFilter
  config/       SecurityConfig (CORS, stateless sessions, role rules)
  dto/          Request/response payloads
  exception/    Centralized error handling
  util/         CurrentUserUtil (resolves the logged-in User from the JWT)
```

## Notes / next steps for production
- Replace the placeholder JWT secret and externalize DB credentials (env vars).
- Add refresh-token rotation if you need sessions longer than the access
  token's lifetime (a `refresh-expiration-ms` property is already reserved).
- Add file storage (S3 or similar) for real assignment/material uploads —
  currently `fileUrl`/`contentUrlOrText` are plain strings.
- Add pagination to list endpoints once course/assignment counts grow.



# LMS Backend (Spring Boot + MySQL + JWT)

A REST API for a Learning Management System: course & material management,
enrollment, assignments, submissions/grading, and progress tracking.

## Stack
- Java 17, Spring Boot 3.3
- Spring Web, Spring Data JPA + Hibernate
- Spring Security + JJWT (stateless JWT auth)
- MySQL 8

## 1. Configure the database
Create a MySQL database (or let Hibernate auto-create it) and update
`src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lms_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: root
    password: root
```

Also change `app.jwt.secret` to a long random string before deploying anywhere
real — the placeholder in the repo is for local dev only.

## 2. Run the backend
```bash
cd lms-backend
mvn spring-boot:run
```
The API starts on `http://localhost:8080`. Hibernate will create/update all
tables automatically (`ddl-auto: update`).

## 3. Roles & Auth
Three roles: `ADMIN`, `INSTRUCTOR`, `STUDENT`. Register via
`POST /api/auth/register` with a `role` field (defaults to `STUDENT` if
omitted). Every protected endpoint expects:
```
Authorization: Bearer <jwt>
```
Tokens are returned from `/api/auth/register` and `/api/auth/login` and are
valid for 24 hours (configurable in `application.yml`).

## 4. Core endpoints

| Area | Endpoint | Access |
|---|---|---|
| Auth | `POST /api/auth/register`, `/login` | Public |
| Courses | `GET /api/courses/public` | Public (published only) |
| Courses | `POST /api/courses` | Instructor/Admin |
| Courses | `PATCH /api/courses/{id}/publish?published=true` | Instructor/Admin |
| Materials | `POST /api/courses/{id}/materials` | Instructor/Admin |
| Enrollment | `POST /api/enrollments/{courseId}` | Student |
| Assignments | `POST /api/courses/{id}/assignments` | Instructor/Admin |
| Submissions | `POST /api/assignments/{id}/submissions` | Student |
| Grading | `PATCH /api/submissions/{id}/grade` | Instructor/Admin |
| Progress | `GET /api/progress/me` | Student |

## 5. Testing with Postman
Import `LMS_Postman_Collection.json` into Postman. Workflow:
1. Run **Register Instructor** and **Register Student** (or just Login if
   they already exist) — copy each returned `token`.
2. Set the collection variables `instructorToken` and `studentToken`.
3. Create a course as the instructor, note its `id`, set the `courseId`
   variable, then publish it.
4. Enroll as the student, create an assignment as the instructor, submit as
   the student, grade as the instructor, then check `/progress/me`.

## 6. Project layout
```
src/main/java/com/lms/
  entity/       JPA entities (User, Course, LearningMaterial, Enrollment, Assignment, Submission)
  repository/   Spring Data JPA repositories
  service/      Business logic
  controller/   REST controllers
  security/     JwtUtil, JwtAuthFilter
  config/       SecurityConfig (CORS, stateless sessions, role rules)
  dto/          Request/response payloads
  exception/    Centralized error handling
  util/         CurrentUserUtil (resolves the logged-in User from the JWT)
```

## Notes / next steps for production
- Replace the placeholder JWT secret and externalize DB credentials (env vars).
- Add refresh-token rotation if you need sessions longer than the access
  token's lifetime (a `refresh-expiration-ms` property is already reserved).
- Add file storage (S3 or similar) for real assignment/material uploads —
  currently `fileUrl`/`contentUrlOrText` are plain strings.
- Add pagination to list endpoints once course/assignment counts grow.
