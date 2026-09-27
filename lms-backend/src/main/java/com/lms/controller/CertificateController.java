package com.lms.controller;

import com.lms.entity.User;
import com.lms.service.CertificateService;
import com.lms.util.CurrentUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;
    private final CurrentUserUtil currentUserUtil;

    /**
     * GET /api/certificates/{courseId}
     * Downloads a PDF certificate. Only accessible to enrolled students at 100% progress.
     */
    @GetMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        User student = currentUserUtil.getUser(authentication);
        byte[] pdf = certificateService.generateCertificate(student, courseId);

        String filename = "certificate-" + courseId + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
