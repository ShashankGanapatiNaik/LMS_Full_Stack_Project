package com.lms.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import com.lms.repository.EnrollmentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CourseService courseService;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Generates a PDF certificate for a student who has completed a course (100% progress).
     */
    public byte[] generateCertificate(User student, Long courseId) {
        Course course = courseService.getCourseById(courseId);

        Enrollment enrollment = enrollmentRepository
                .findByStudentAndCourse(student, course)
                .orElseThrow(() -> new EntityNotFoundException("You are not enrolled in this course."));

        if (enrollment.getProgressPercent() < 100) {
            throw new IllegalStateException("You must complete 100% of the course to receive a certificate.");
        }

        try {
            return buildPdf(student, course, enrollment);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate certificate PDF: " + e.getMessage(), e);
        }
    }

    private byte[] buildPdf(User student, Course course, Enrollment enrollment) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf, PageSize.A4.rotate()); // landscape
        doc.setMargins(50, 60, 50, 60);

        PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
        PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        PdfFont italic = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

        DeviceRgb indigo = new DeviceRgb(99, 102, 241);
        DeviceRgb purple = new DeviceRgb(139, 92, 246);
        DeviceRgb darkBg = new DeviceRgb(15, 15, 35);
        DeviceRgb lightGray = new DeviceRgb(200, 200, 220);
        DeviceRgb goldColor = new DeviceRgb(251, 191, 36);

        float pageWidth = PageSize.A4.rotate().getWidth() - 120;

        // ── Outer decorative border ──────────────────────────────
        Table border = new Table(1).setWidth(UnitValue.createPercentValue(100));
        Cell borderCell = new Cell()
                .setBorder(new SolidBorder(indigo, 4))
                .setPadding(24)
                .setBackgroundColor(new DeviceRgb(248, 248, 255));

        // ── LOGO / Header label ──────────────────────────────────
        Paragraph lmsLabel = new Paragraph("🎓 LearnSphere LMS")
                .setFont(bold).setFontSize(13)
                .setFontColor(indigo)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);

        Paragraph certOfCompletion = new Paragraph("CERTIFICATE OF COMPLETION")
                .setFont(bold).setFontSize(10)
                .setFontColor(lightGray)
                .setTextAlignment(TextAlignment.CENTER)
                .setCharacterSpacing(4)
                .setMarginBottom(16);

        // ── Divider ─────────────────────────────────────────────
        LineSeparator divider = new LineSeparator(new SolidLine(1.5f));

        // ── Main headline ────────────────────────────────────────
        Paragraph headline = new Paragraph("This is to certify that")
                .setFont(italic).setFontSize(14)
                .setFontColor(new DeviceRgb(80, 80, 110))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(18).setMarginBottom(4);

        // ── Student name ─────────────────────────────────────────
        Paragraph studentName = new Paragraph(student.getFullName())
                .setFont(bold).setFontSize(34)
                .setFontColor(darkBg)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);

        // ── Underline decoration ─────────────────────────────────
        LineSeparator nameUnderline = new LineSeparator(new SolidLine(1f));

        // ── Has completed ────────────────────────────────────────
        Paragraph hasCompleted = new Paragraph("has successfully completed the course")
                .setFont(italic).setFontSize(14)
                .setFontColor(new DeviceRgb(80, 80, 110))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10).setMarginBottom(4);

        // ── Course title ─────────────────────────────────────────
        Paragraph courseTitle = new Paragraph(course.getTitle())
                .setFont(bold).setFontSize(26)
                .setFontColor(indigo)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(8);

        // ── Instructor & date row ────────────────────────────────
        String instructorName = course.getInstructor() != null
                ? course.getInstructor().getFullName()
                : "LearnSphere Instructor";
        String completionDate = LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));

        Table metaRow = new Table(new float[]{1, 1})
                .setWidth(UnitValue.createPercentValue(80))
                .setHorizontalAlignment(HorizontalAlignment.CENTER)
                .setMarginTop(18);

        Cell instrCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("Instructor").setFont(regular).setFontSize(9).setFontColor(lightGray).setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph(instructorName).setFont(bold).setFontSize(13).setFontColor(darkBg).setTextAlignment(TextAlignment.CENTER));

        Cell dateCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("Issued On").setFont(regular).setFontSize(9).setFontColor(lightGray).setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph(completionDate).setFont(bold).setFontSize(13).setFontColor(darkBg).setTextAlignment(TextAlignment.CENTER));

        metaRow.addCell(instrCell);
        metaRow.addCell(dateCell);

        // ── Gold seal line ───────────────────────────────────────
        Paragraph seal = new Paragraph("★  Verified Achievement  ★")
                .setFont(bold).setFontSize(11)
                .setFontColor(goldColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(16);

        // Assemble into border cell
        borderCell.add(lmsLabel)
                .add(certOfCompletion)
                .add(divider)
                .add(headline)
                .add(studentName)
                .add(nameUnderline)
                .add(hasCompleted)
                .add(courseTitle)
                .add(metaRow)
                .add(seal);

        border.addCell(borderCell);
        doc.add(border);

        doc.close();
        return baos.toByteArray();
    }
}
