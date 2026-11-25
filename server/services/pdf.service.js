import PDFDocument from 'pdfkit';

export function generateReceiptPDF({ payment, application, student, course, branch }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.rect(0, 0, doc.page.width, 90).fill('#1e3a8a');
    doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('ADMISSION PORTAL', 50, 28);
    doc.fontSize(10).font('Helvetica').text('Official Fee Payment Receipt', 50, 54);

    doc.fillColor('#1e293b');
    let y = 115;

    doc.fontSize(11).font('Helvetica-Bold').text(`Receipt No: ${payment.receiptNumber}`, 50, y);
    doc.font('Helvetica').text(`Date: ${new Date(payment.verifiedAt || payment.createdAt).toLocaleDateString('en-IN')}`, 380, y);

    y += 28;
    doc.moveTo(50, y).lineTo(545, y).stroke('#cbd5e1');
    y += 18;

    const addRow = (label, value) => {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#64748b').text(label, 50, y, { width: 170 });
      doc.font('Helvetica').fontSize(10).fillColor('#0f172a').text(value || '—', 220, y);
      y += 22;
    };

    addRow('Student Name', student?.name);
    addRow('Email', student?.email);
    addRow('Application Number', application?.applicationNumber);
    addRow('Course & Branch', `${course?.name || ''} — ${branch?.name || ''}`);
    addRow('Razorpay Order ID', payment.razorpayOrderId);
    addRow('Razorpay Payment ID', payment.razorpayPaymentId);
    addRow('Payment Status', 'VERIFIED & PAID');

    y += 10;
    doc.moveTo(50, y).lineTo(545, y).stroke('#cbd5e1');
    y += 20;

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#1e3a8a').text('Total Amount Paid', 50, y);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#0d9488').text(`INR ${Number(payment.amount).toLocaleString('en-IN')}`, 380, y);

    y += 50;
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(
      'This is a computer-generated receipt issued after backend payment signature verification. No physical signature is required.',
      50,
      y,
      { width: 495, align: 'center' }
    );

    doc.end();
  });
}

