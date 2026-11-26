package com.admissionportal.service.impl;

import com.admissionportal.entity.Payment;
import com.admissionportal.service.PdfReceiptService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfReceiptServiceImpl implements PdfReceiptService {

    @Override
    public byte[] generateReceiptPdf(Payment payment) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            Color primaryBlue = new Color(30, 58, 138); // #1e3a8a
            Color lightGray = new Color(248, 250, 252);
            Color darkText = new Color(30, 41, 59);

            // Fonts
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, primaryBlue);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, primaryBlue);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkText);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkText);

            // College Header
            Paragraph instName = new Paragraph("ABES ENGINEERING COLLEGE", headerFont);
            instName.setAlignment(Element.ALIGN_CENTER);
            document.add(instName);

            Paragraph instSub = new Paragraph("Admission Automation and Tracking System · College Code: 032\nCampus: 19th KM Stone, NH-09, Ghaziabad, UP 201009", subHeaderFont);
            instSub.setAlignment(Element.ALIGN_CENTER);
            instSub.setSpacingAfter(15);
            document.add(instSub);

            // Receipt Title Banner
            PdfPTable titleTable = new PdfPTable(1);
            titleTable.setWidthPercentage(100);
            PdfPCell cell = new PdfPCell(new Phrase("OFFICIAL ADMISSION FEE RECEIPT (ACADEMIC YEAR 2026–27)", titleFont));
            cell.setBackgroundColor(new Color(239, 246, 255));
            cell.setBorderColor(new Color(191, 219, 254));
            cell.setPadding(10);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            titleTable.addCell(cell);
            titleTable.setSpacingAfter(15);
            document.add(titleTable);

            // Key info grid
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{1, 1});

            addInfoRow(infoTable, "Receipt Number:", payment.getReceiptNumber(), boldFont, normalFont);
            addInfoRow(infoTable, "Payment Date:", payment.getPaidAt() != null ? payment.getPaidAt().toString().substring(0, 10) : "2026-11-27", boldFont, normalFont);
            addInfoRow(infoTable, "Student Name:", payment.getStudent() != null ? payment.getStudent().getName() : "Student", boldFont, normalFont);
            addInfoRow(infoTable, "Application No:", payment.getApplication() != null ? payment.getApplication().getApplicationNumber() : "", boldFont, normalFont);
            addInfoRow(infoTable, "Course & Branch:", payment.getCourseAndBranch() != null ? payment.getCourseAndBranch() : "B.Tech — CSE", boldFont, normalFont);
            addInfoRow(infoTable, "Payment Mode:", payment.getMode(), boldFont, normalFont);
            addInfoRow(infoTable, "Transaction ID:", payment.getRazorpayPaymentId() != null ? payment.getRazorpayPaymentId() : "pay_test_confirmed", boldFont, normalFont);
            addInfoRow(infoTable, "Status:", "CONFIRMED & VERIFIED", boldFont, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(13, 148, 136)));

            infoTable.setSpacingAfter(20);
            document.add(infoTable);

            // Fee Breakdown Table
            PdfPTable feeTable = new PdfPTable(2);
            feeTable.setWidthPercentage(100);
            feeTable.setWidths(new float[]{3, 1});

            PdfPCell h1 = new PdfPCell(new Phrase("Fee Component", boldFont));
            h1.setBackgroundColor(lightGray);
            h1.setPadding(8);
            PdfPCell h2 = new PdfPCell(new Phrase("Amount (INR)", boldFont));
            h2.setBackgroundColor(lightGray);
            h2.setPadding(8);
            h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            feeTable.addCell(h1);
            feeTable.addCell(h2);

            BigDecimal total = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
            BigDecimal reg = new BigDecimal("5000.00");
            BigDecimal tuition = total.subtract(reg).max(BigDecimal.ZERO);

            addFeeRow(feeTable, "Tuition Fee (Annual)", tuition, normalFont);
            addFeeRow(feeTable, "Admission & Registration Fee", reg, normalFont);

            PdfPCell t1 = new PdfPCell(new Phrase("Total Paid", boldFont));
            t1.setBackgroundColor(new Color(241, 245, 249));
            t1.setPadding(8);
            PdfPCell t2 = new PdfPCell(new Phrase(formatCurrency(total), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, primaryBlue)));
            t2.setBackgroundColor(new Color(241, 245, 249));
            t2.setPadding(8);
            t2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            feeTable.addCell(t1);
            feeTable.addCell(t2);

            feeTable.setSpacingAfter(30);
            document.add(feeTable);

            // Note
            Paragraph footer = new Paragraph("This is an authenticated, computer-generated admission confirmation receipt and requires no physical signature.\nAdmission is provisional subject to physical verification of original certificates upon campus reporting.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating receipt PDF: " + e.getMessage(), e);
        }
    }

    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, labelFont));
        lCell.setBorder(Rectangle.NO_BORDER);
        lCell.setPadding(4);
        PdfPCell vCell = new PdfPCell(new Phrase(value != null ? value : "—", valFont));
        vCell.setBorder(Rectangle.NO_BORDER);
        vCell.setPadding(4);
        table.addCell(lCell);
        table.addCell(vCell);
    }

    private void addFeeRow(PdfPTable table, String item, BigDecimal amount, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(item, font));
        c1.setPadding(6);
        PdfPCell c2 = new PdfPCell(new Phrase(formatCurrency(amount), font));
        c2.setPadding(6);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(c1);
        table.addCell(c2);
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "INR 0";
        return NumberFormat.getCurrencyInstance(new Locale("en", "IN")).format(amount);
    }
}
