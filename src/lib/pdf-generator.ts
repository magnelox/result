import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface GradeCardPdfData {
  studentName: string;
  regNumber: string;
  rollNumber: string;
  programmeName: string;
  academicSession: string;
  examSession: string;
  examType: string;
  viewType?: string; // MARKS or GRADE_CARD
  batch: string;
  semester: string;
  sgpa: number;
  resultStatus: string;
  declarationDate: string;
  courses: Array<{
    code: string;
    title: string;
    credits: number;
    internalMarks?: number;
    externalMarks?: number;
    totalMarks?: number;
    remarks?: string;
    assignmentGrade?: string;
    endTermGrade?: string;
    finalGrade: string;
    gradePoint: number;
    status: string;
  }>;
}

/**
 * Generates an official SSU Grade Card PDF using PDFKit
 * Saved to storage/grade-cards/<filename>.pdf
 */
export async function generateGradeCardPdf(
  data: GradeCardPdfData,
  outputPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      const navy = '#002147';
      const darkGray = '#222222';
      const borderGray = '#CCCCCC';
      const lightBg = '#F8F9FA';

      // --- HEADER ---
      doc
        .fillColor(navy)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('SRI SRI UNIVERSITY', { align: 'center' });

      doc.moveDown(0.2);
      doc
        .fillColor('#555555')
        .fontSize(9)
        .font('Helvetica')
        .text('DIRECTORATE OF OPEN & DISTANCE LEARNING (ODL)', { align: 'center' })
        .text('Bidyadharpur, Arilo, Cuttack, Odisha 754006', { align: 'center' });

      doc.moveDown(0.4);
      doc
        .fillColor(navy)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('SEMESTER GRADE CARD', { align: 'center' });

      doc.moveDown(0.6);

      // Outer Box around Student Info Grid
      const infoTop = doc.y;
      const pageWidth = 595.28 - 72;
      const infoBoxHeight = 85;

      doc
        .rect(36, infoTop, pageWidth, infoBoxHeight)
        .lineWidth(1)
        .strokeColor(borderGray)
        .stroke();

      doc.fontSize(9).fillColor(darkGray);

      const col1X = 46;
      const col2X = 310;
      let yPos = infoTop + 10;
      const rowHeight = 16;

      // Row 1
      doc.font('Helvetica-Bold').text('Programme:', col1X, yPos);
      doc.font('Helvetica').text(data.programmeName, col1X + 85, yPos);

      doc.font('Helvetica-Bold').text('Roll No.:', col2X, yPos);
      doc.font('Helvetica').text(data.rollNumber, col2X + 85, yPos);

      // Row 2
      yPos += rowHeight;
      doc.font('Helvetica-Bold').text('Name:', col1X, yPos);
      doc.font('Helvetica').text(data.studentName.toUpperCase(), col1X + 85, yPos);

      doc.font('Helvetica-Bold').text('Registration No.:', col2X, yPos);
      doc.font('Helvetica').text(data.regNumber, col2X + 85, yPos);

      // Row 3
      yPos += rowHeight;
      doc.font('Helvetica-Bold').text('Exam Session:', col1X, yPos);
      doc.font('Helvetica').text(data.examSession, col1X + 85, yPos);

      doc.font('Helvetica-Bold').text('Academic Session:', col2X, yPos);
      doc.font('Helvetica').text(data.academicSession, col2X + 85, yPos);

      // Row 4
      yPos += rowHeight;
      doc.font('Helvetica-Bold').text('Exam Type:', col1X, yPos);
      doc.font('Helvetica').text(data.examType, col1X + 85, yPos);

      doc.font('Helvetica-Bold').text('Batch:', col2X, yPos);
      doc.font('Helvetica').text(data.batch, col2X + 85, yPos);

      doc.y = infoTop + infoBoxHeight + 15;

      // Semester Heading
      doc
        .fillColor(navy)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`SEMESTER – ${data.semester.toUpperCase()}`, { align: 'left' });

      doc.moveDown(0.4);

      // --- COURSE TABLE ---
      const tableTop = doc.y;
      const tableWidth = pageWidth;

      const isMarks = data.viewType === 'MARKS';

      const cols = isMarks
        ? [
            { name: 'Course Code', width: 75, align: 'left' },
            { name: 'Course Title', width: 165, align: 'left' },
            { name: 'Credits', width: 40, align: 'center' },
            { name: 'Internal', width: 50, align: 'center' },
            { name: 'External', width: 50, align: 'center' },
            { name: 'Total', width: 45, align: 'center' },
            { name: 'Grade', width: 45, align: 'center' },
            { name: 'GP', width: 35, align: 'center' },
          ]
        : [
            { name: 'Course Code', width: 80, align: 'left' },
            { name: 'Course Title', width: 175, align: 'left' },
            { name: 'Credits', width: 45, align: 'center' },
            { name: 'Assignment', width: 65, align: 'center' },
            { name: 'End-Term', width: 60, align: 'center' },
            { name: 'Final Grade', width: 60, align: 'center' },
            { name: 'Grade Pt', width: 45, align: 'center' },
          ];

      doc.rect(36, tableTop, tableWidth, 22).fillColor(lightBg).fill();
      doc.rect(36, tableTop, tableWidth, 22).strokeColor(navy).lineWidth(1).stroke();

      let currentX = 36;
      doc.fillColor(navy).fontSize(8.5).font('Helvetica-Bold');

      cols.forEach((col) => {
        doc.text(col.name, currentX + 3, tableTop + 6, {
          width: col.width - 6,
          align: col.align as any,
        });
        currentX += col.width;
      });

      let rowY = tableTop + 22;
      const tableRowHeight = 20;

      data.courses.forEach((c, idx) => {
        if (idx % 2 === 1) {
          doc.rect(36, rowY, tableWidth, tableRowHeight).fillColor('#FCFDFD').fill();
        }

        doc
          .rect(36, rowY, tableWidth, tableRowHeight)
          .strokeColor(borderGray)
          .lineWidth(0.5)
          .stroke();

        doc.fillColor(darkGray).fontSize(8.5).font('Helvetica');

        let cx = 36;
        if (isMarks) {
          doc.text(c.code, cx + 3, rowY + 5, { width: cols[0].width - 6, align: 'left' }); cx += cols[0].width;
          doc.text(c.title, cx + 3, rowY + 5, { width: cols[1].width - 6, align: 'left', lineBreak: false }); cx += cols[1].width;
          doc.text(c.credits.toFixed(1), cx + 3, rowY + 5, { width: cols[2].width - 6, align: 'center' }); cx += cols[2].width;
          doc.text(c.internalMarks !== undefined ? String(c.internalMarks) : '—', cx + 3, rowY + 5, { width: cols[3].width - 6, align: 'center' }); cx += cols[3].width;
          doc.text(c.externalMarks !== undefined ? String(c.externalMarks) : '—', cx + 3, rowY + 5, { width: cols[4].width - 6, align: 'center' }); cx += cols[4].width;
          doc.text(c.totalMarks !== undefined ? String(c.totalMarks) : '—', cx + 3, rowY + 5, { width: cols[5].width - 6, align: 'center' }); cx += cols[5].width;
          doc.font('Helvetica-Bold').text(c.finalGrade, cx + 3, rowY + 5, { width: cols[6].width - 6, align: 'center' }); cx += cols[6].width;
          doc.font('Helvetica').text(c.gradePoint.toFixed(1), cx + 3, rowY + 5, { width: cols[7].width - 6, align: 'center' });
        } else {
          doc.text(c.code, cx + 3, rowY + 5, { width: cols[0].width - 6, align: 'left' }); cx += cols[0].width;
          doc.text(c.title, cx + 3, rowY + 5, { width: cols[1].width - 6, align: 'left', lineBreak: false }); cx += cols[1].width;
          doc.text(c.credits.toFixed(1), cx + 3, rowY + 5, { width: cols[2].width - 6, align: 'center' }); cx += cols[2].width;
          doc.text(c.assignmentGrade || 'A', cx + 3, rowY + 5, { width: cols[3].width - 6, align: 'center' }); cx += cols[3].width;
          doc.text(c.endTermGrade || 'A', cx + 3, rowY + 5, { width: cols[4].width - 6, align: 'center' }); cx += cols[4].width;
          doc.font('Helvetica-Bold').text(c.finalGrade, cx + 3, rowY + 5, { width: cols[5].width - 6, align: 'center' }); cx += cols[5].width;
          doc.font('Helvetica').text(c.gradePoint.toFixed(1), cx + 3, rowY + 5, { width: cols[6].width - 6, align: 'center' });
        }

        rowY += tableRowHeight;
      });

      doc.y = rowY + 12;

      // --- RESULT SUMMARY BOX ---
      const summaryTop = doc.y;
      const summaryHeight = 35;

      doc.rect(36, summaryTop, tableWidth, summaryHeight).fillColor('#F4F6F9').fill();
      doc.rect(36, summaryTop, tableWidth, summaryHeight).strokeColor(navy).lineWidth(1).stroke();

      doc.fillColor(navy).fontSize(11).font('Helvetica-Bold');
      doc.text(`SGPA :  ${data.sgpa.toFixed(2)}`, 50, summaryTop + 11);

      const isPass = data.resultStatus.toUpperCase() === 'PASS';
      const statusColor = isPass ? '#15803D' : '#B91C1C';

      doc.fillColor(darkGray).fontSize(11).font('Helvetica-Bold');
      doc.text('Semester Result: ', 320, summaryTop + 11);
      doc.fillColor(statusColor).text(data.resultStatus.toUpperCase(), 415, summaryTop + 11);

      doc.y = summaryTop + summaryHeight + 15;

      // Result Declaration Date
      doc
        .fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(`Result Declaration Date: `, 36, doc.y, { continued: true })
        .font('Helvetica')
        .text(data.declarationDate);

      doc.moveDown(0.8);

      // --- GRADE SCALE REFERENCE & NOTE ---
      doc.fillColor(navy).fontSize(9).font('Helvetica-Bold').text('GRADE SCALE REFERENCE');
      doc.moveDown(0.2);

      const scaleTop = doc.y;
      const scaleBoxWidth = tableWidth;
      const scaleBoxHeight = 45;

      doc.rect(36, scaleTop, scaleBoxWidth, scaleBoxHeight).strokeColor(borderGray).lineWidth(0.5).stroke();
      doc.fontSize(7.5).fillColor(darkGray);

      doc.font('Helvetica-Bold').text('Marks / Point Range:', 42, scaleTop + 6);
      doc.font('Helvetica').text('9.00-10.00  |  8.00<9.00  |  7.00<8.00  |  6.00<7.00  |  5.50<6.00  |  5.00<5.50  |  4.00<5.00  |  <4.00', 145, scaleTop + 6);

      doc.font('Helvetica-Bold').text('Grade Symbol:', 42, scaleTop + 18);
      doc.font('Helvetica-Bold').text('     O              A+            A            B+            B            C            D           F', 145, scaleTop + 18);

      doc.font('Helvetica-Bold').text('Special Statuses:', 42, scaleTop + 30);
      doc.font('Helvetica').text('AB: Absent  |  NS: Not Submitted  |  IA: Incomplete Assessment  |  RW: Result Withheld', 145, scaleTop + 30);

      doc.y = scaleTop + scaleBoxHeight + 12;

      // Official Disclaimer
      doc
        .fillColor('#666666')
        .fontSize(7.5)
        .font('Helvetica-Oblique')
        .text(
          'Note: This Grade Card is issued by Sri Sri University ODL Examination Authority. SGPA indicates Semester Grade Point Average. Official transcripts may be requested directly from the University Controller of Examinations office.',
          36,
          doc.y,
          { width: tableWidth, align: 'justify' }
        );

      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
