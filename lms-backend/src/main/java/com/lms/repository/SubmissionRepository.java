package com.lms.repository;

import com.lms.entity.Assignment;
import com.lms.entity.Submission;
import com.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignment(Assignment assignment);
    List<Submission> findByStudent(User student);
    Optional<Submission> findByAssignmentAndStudent(Assignment assignment, User student);

    @Modifying
    @Query("DELETE FROM Submission s WHERE s.assignment IN :assignments")
    void deleteByAssignmentIn(@Param("assignments") List<Assignment> assignments);
}
