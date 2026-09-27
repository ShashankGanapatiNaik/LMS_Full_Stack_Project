package com.lms.config;

import com.lms.entity.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LearningMaterialRepository materialRepository;
    private final AssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // ─── Seed Users ───
        User instructor = userRepository.findByEmail("instructor@lms.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("John Instructor")
                        .email("instructor@lms.com")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.INSTRUCTOR)
                        .enabled(true)
                        .build())
        );

        User instructor2 = userRepository.findByEmail("instructor2@lms.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Sarah Teacher")
                        .email("instructor2@lms.com")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.INSTRUCTOR)
                        .enabled(true)
                        .build())
        );

        User student = userRepository.findByEmail("student@lms.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Alex Student")
                        .email("student@lms.com")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.STUDENT)
                        .enabled(true)
                        .build())
        );

        userRepository.findByEmail("admin@lms.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("System Admin")
                        .email("admin@lms.com")
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.ADMIN)
                        .enabled(true)
                        .build())
        );

        // ─── Seed Courses & Rich Content ───
        if (courseRepository.count() == 0) {
            // Course 1 — Spring Boot
            Course course1 = courseRepository.save(Course.builder()
                    .title("Fullstack Java & Spring Boot Masterclass")
                    .description("Learn enterprise backend development with Spring Boot 3, Spring Security, JPA, MySQL, and REST APIs. Covers JWT authentication, role-based access control, and production-ready patterns.")
                    .instructor(instructor)
                    .published(true)
                    .build());

            materialRepository.save(LearningMaterial.builder().course(course1).title("Introduction to Spring Boot 3")
                    .type(LearningMaterial.MaterialType.VIDEO).contentUrlOrText("https://www.youtube.com/watch?v=9SGDpanrc8U").orderIndex(1).build());
            materialRepository.save(LearningMaterial.builder().course(course1).title("Setting Up Your Development Environment")
                    .type(LearningMaterial.MaterialType.NOTES).contentUrlOrText("Install JDK 17+, IntelliJ IDEA (Community or Ultimate), Maven, and MySQL 8. Clone the starter project from GitHub. Run `mvn spring-boot:run` to verify setup.").orderIndex(2).build());
            materialRepository.save(LearningMaterial.builder().course(course1).title("Spring Security & JWT Deep Dive")
                    .type(LearningMaterial.MaterialType.DOCUMENT).contentUrlOrText("https://docs.spring.io/spring-security/reference/index.html").orderIndex(3).build());
            materialRepository.save(LearningMaterial.builder().course(course1).title("REST API Design Best Practices")
                    .type(LearningMaterial.MaterialType.LINK).contentUrlOrText("https://restfulapi.net/rest-api-design-tutorial-with-example/").orderIndex(4).build());

            Assignment a1 = assignmentRepository.save(Assignment.builder().course(course1)
                    .title("Build a CRUD REST API").instructions("Create a RESTful CRUD API for a Book entity with Spring Boot and JPA. Include validation, error handling, and pagination. Submit your GitHub repo link.")
                    .dueDate(LocalDateTime.now().plusDays(14)).maxScore(100).build());

            assignmentRepository.save(Assignment.builder().course(course1)
                    .title("Implement JWT Authentication").instructions("Add JWT-based authentication to your Book API. Students should be able to register, login, and access protected endpoints. Include role-based access (ADMIN vs USER).")
                    .dueDate(LocalDateTime.now().plusDays(21)).maxScore(100).build());

            // Course 2 — React
            Course course2 = courseRepository.save(Course.builder()
                    .title("React.js & Modern Web Development")
                    .description("Master modern frontend UI development with React 18, Hooks, Context API, React Router, Tailwind CSS, and Axios. Build real-world projects from scratch.")
                    .instructor(instructor)
                    .published(true)
                    .build());

            materialRepository.save(LearningMaterial.builder().course(course2).title("React 18 Crash Course")
                    .type(LearningMaterial.MaterialType.VIDEO).contentUrlOrText("https://www.youtube.com/watch?v=N3AkSS5hXMA").orderIndex(1).build());
            materialRepository.save(LearningMaterial.builder().course(course2).title("Understanding React Hooks")
                    .type(LearningMaterial.MaterialType.NOTES).contentUrlOrText("useState: manages local component state.\nuseEffect: performs side effects (API calls, subscriptions).\nuseCallback: memoizes callbacks to prevent unnecessary re-renders.\nuseMemo: memoizes expensive computed values.\nuseContext: consumes React context without prop drilling.").orderIndex(2).build());
            materialRepository.save(LearningMaterial.builder().course(course2).title("Tailwind CSS Documentation")
                    .type(LearningMaterial.MaterialType.LINK).contentUrlOrText("https://tailwindcss.com/docs").orderIndex(3).build());

            assignmentRepository.save(Assignment.builder().course(course2)
                    .title("Build a Shopping Cart UI").instructions("Create a responsive shopping cart application with React. Must include: product listing, add/remove from cart, quantity adjustment, and total price calculation. Use useState and useContext. Deploy to Vercel or Netlify and share the link.")
                    .dueDate(LocalDateTime.now().plusDays(10)).maxScore(100).build());

            // Course 3 — Database
            Course course3 = courseRepository.save(Course.builder()
                    .title("Database Architecture & SQL Mastery")
                    .description("Understand relational database design, normalization (1NF-3NF), indexing strategies, complex joins, subqueries, stored procedures, and query optimization with MySQL.")
                    .instructor(instructor)
                    .published(true)
                    .build());

            materialRepository.save(LearningMaterial.builder().course(course3).title("SQL Fundamentals — Full Course")
                    .type(LearningMaterial.MaterialType.VIDEO).contentUrlOrText("https://www.youtube.com/watch?v=HXV3zeQKqGY").orderIndex(1).build());
            materialRepository.save(LearningMaterial.builder().course(course3).title("Database Normalization Cheat Sheet")
                    .type(LearningMaterial.MaterialType.NOTES).contentUrlOrText("1NF: Eliminate duplicate columns, create separate tables for related data.\n2NF: Remove partial dependencies — all non-key attributes must depend on the full primary key.\n3NF: Remove transitive dependencies — non-key attributes must not depend on other non-key attributes.\nBCNF: Every determinant must be a candidate key.").orderIndex(2).build());

            assignmentRepository.save(Assignment.builder().course(course3)
                    .title("Design an E-Commerce Database Schema").instructions("Design a normalized (3NF) relational database schema for an e-commerce platform. Include tables for: Users, Products, Categories, Orders, OrderItems, Payments. Write SQL CREATE TABLE statements with proper constraints (PK, FK, UNIQUE, NOT NULL). Submit as a .sql file with sample INSERT statements.")
                    .dueDate(LocalDateTime.now().plusDays(12)).maxScore(100).build());

            // Course 4 — System Design
            Course course4 = courseRepository.save(Course.builder()
                    .title("System Design for Developers")
                    .description("Learn how to design scalable distributed systems: load balancing, caching, message queues, microservices, database sharding, and more. Prep for technical interviews at top companies.")
                    .instructor(instructor)
                    .published(true)
                    .build());

            materialRepository.save(LearningMaterial.builder().course(course4).title("Introduction to System Design")
                    .type(LearningMaterial.MaterialType.VIDEO).contentUrlOrText("https://www.youtube.com/watch?v=UzLMhqg3_Wc").orderIndex(1).build());
            materialRepository.save(LearningMaterial.builder().course(course4).title("CAP Theorem Explained")
                    .type(LearningMaterial.MaterialType.NOTES).contentUrlOrText("CAP Theorem states that a distributed system can only guarantee two of three properties:\n• Consistency: Every read returns the most recent write\n• Availability: Every request receives a response (not guaranteed to be the latest)\n• Partition Tolerance: System continues despite network partitions\n\nExamples:\n- CP: MongoDB, HBase, Zookeeper\n- AP: Cassandra, CouchDB, DynamoDB\n- CA: Traditional RDBMS (not practical for distributed systems)").orderIndex(2).build());
            materialRepository.save(LearningMaterial.builder().course(course4).title("Grokking System Design Interview")
                    .type(LearningMaterial.MaterialType.LINK).contentUrlOrText("https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers").orderIndex(3).build());

            assignmentRepository.save(Assignment.builder().course(course4)
                    .title("Design a URL Shortener like bit.ly").instructions("Design a scalable URL shortening service. Include: architecture diagram (can be ASCII or described), database schema, API design, caching strategy (what to cache, TTL), how to handle 100M+ URLs. Address: uniqueness of short codes, analytics tracking, and rate limiting. Submit a PDF or Google Doc.")
                    .dueDate(LocalDateTime.now().plusDays(16)).maxScore(100).build());
        }

        // ─── Auto-enroll all students into all published courses ───
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<Course> publishedCourses = courseRepository.findByPublishedTrue();

        for (User st : students) {
            for (Course course : publishedCourses) {
                if (!enrollmentRepository.existsByStudentAndCourse(st, course)) {
                    enrollmentRepository.save(Enrollment.builder()
                            .student(st)
                            .course(course)
                            .progressPercent(0.0)
                            .build());
                }
            }
        }
    }
}
