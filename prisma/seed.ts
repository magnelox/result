import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { generateGradeCardPdf } from '../src/lib/pdf-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sri Sri University database seed...');

  // 1. Create Default Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@SSU2026!', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@srisriuniversity.edu.in' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@srisriuniversity.edu.in',
      name: 'SSU Exam Controller',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`✅ Admin user ready: ${admin.email}`);

  // 2. Create Official SSU ODL Programmes
  const programmesData = [
    { code: 'MBA', name: 'Master of Business Administration (MBA)', department: 'Faculty of Management Studies' },
    { code: 'B.COM', name: 'Bachelor of Commerce (B.Com)', department: 'Faculty of Commerce' },
    { code: 'BBA', name: 'Bachelor of Business Administration (BBA)', department: 'Faculty of Management Studies' },
    { code: 'MA-YOGA', name: 'Master of Arts (Yoga)', department: 'Faculty of Yogic Science & Human Excellence' },
    { code: 'MA-HS', name: 'Master of Arts (Hindu Studies)', department: 'Faculty of Indic Studies' },
    { code: 'MPA', name: 'Master of Performing Arts', department: 'Faculty of Performing Arts' },
  ];

  const programmesMap = new Map<string, any>();

  for (const prog of programmesData) {
    const p = await prisma.programme.upsert({
      where: { code: prog.code },
      update: { name: prog.name, department: prog.department },
      create: prog,
    });
    programmesMap.set(prog.code, p);
  }
  console.log(`✅ ${programmesData.length} Programmes initialized`);

  // 3. Create Courses
  const coursesData = [
    // MBA Courses
    { code: 'MBA101', title: 'Management Principles & Organizational Behavior', credits: 4.0, progCode: 'MBA', semester: 'I' },
    { code: 'MBA102', title: 'Managerial Economics', credits: 4.0, progCode: 'MBA', semester: 'I' },
    { code: 'MBA103', title: 'Financial Accounting for Managers', credits: 4.0, progCode: 'MBA', semester: 'I' },
    { code: 'MBA104', title: 'Marketing Management', credits: 4.0, progCode: 'MBA', semester: 'I' },
    { code: 'MBA105', title: 'Business Statistics & Analytics', credits: 3.0, progCode: 'MBA', semester: 'I' },

    // B.COM Courses
    { code: 'BCOM101', title: 'Financial Accounting', credits: 4.0, progCode: 'B.COM', semester: 'I' },
    { code: 'BCOM102', title: 'Business Law', credits: 4.0, progCode: 'B.COM', semester: 'I' },

    // BBA Courses
    { code: 'BBA101', title: 'Principles of Microeconomics', credits: 3.0, progCode: 'BBA', semester: 'I' },
    { code: 'BBA102', title: 'Business Communication Skills', credits: 3.0, progCode: 'BBA', semester: 'I' },
    { code: 'BBA103', title: 'Fundamentals of Accounting', credits: 4.0, progCode: 'BBA', semester: 'I' },

    // MA YOGA Courses
    { code: 'YOG101', title: 'Fundamentals of Yoga & Philosophy', credits: 4.0, progCode: 'MA-YOGA', semester: 'I' },
    
    // MA HINDU STUDIES Courses
    { code: 'HS101', title: 'Foundations of Hindu Studies', credits: 4.0, progCode: 'MA-HS', semester: 'I' },

    // MPA Courses
    { code: 'MPA101', title: 'Theory of Performing Arts', credits: 4.0, progCode: 'MPA', semester: 'I' },
  ];

  const coursesMap = new Map<string, any>();

  for (const crs of coursesData) {
    const prog = programmesMap.get(crs.progCode);
    if (!prog) continue;

    const c = await prisma.course.upsert({
      where: { code: crs.code },
      update: { title: crs.title, credits: crs.credits, semester: crs.semester, programmeId: prog.id },
      create: {
        code: crs.code,
        title: crs.title,
        credits: crs.credits,
        semester: crs.semester,
        programmeId: prog.id,
      },
    });
    coursesMap.set(crs.code, c);
  }
  console.log(`✅ ${coursesData.length} Courses initialized`);

  // 4. Create Grade Scale entries
  const gradeScales = [
    { symbol: 'O', minimumValue: 9.0, maximumValue: 10.0, meaning: 'Outstanding' },
    { symbol: 'A+', minimumValue: 8.0, maximumValue: 8.99, meaning: 'Excellent' },
    { symbol: 'A', minimumValue: 7.0, maximumValue: 7.99, meaning: 'Very Good' },
    { symbol: 'B+', minimumValue: 6.0, maximumValue: 6.99, meaning: 'Good' },
    { symbol: 'B', minimumValue: 5.5, maximumValue: 5.99, meaning: 'Above Average' },
    { symbol: 'C', minimumValue: 5.0, maximumValue: 5.49, meaning: 'Average' },
    { symbol: 'D', minimumValue: 4.0, maximumValue: 4.99, meaning: 'Pass' },
    { symbol: 'F', minimumValue: 0.0, maximumValue: 3.99, meaning: 'Fail' },
  ];

  for (const gs of gradeScales) {
    await prisma.gradeScale.upsert({
      where: { symbol: gs.symbol },
      update: gs,
      create: gs,
    });
  }

  // 5. Create Safe Synthetic Students & Results
  const storageDir = path.join(process.cwd(), 'storage', 'grade-cards');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const sampleStudents = [
    {
      name: 'Aarav Sharma',
      regNumber: '2026MBA001',
      rollNumber: 'SSU/2026/MBA/001',
      dob: '2002-05-14',
      progCode: 'MBA',
      batch: 'August 2025',
      semester: 'I',
      academicSession: '2025-2026',
      examSession: 'January 2026',
      declarationDate: '10 February 2026',
      courses: [
        { code: 'MBA101', title: 'Management Principles & Organizational Behavior', credits: 4.0, assg: 'O', end: 'A+', final: 'O', gp: 10.0, status: 'PASS' },
        { code: 'MBA102', title: 'Managerial Economics', credits: 4.0, assg: 'A+', end: 'A', final: 'A+', gp: 9.0, status: 'PASS' },
        { code: 'MBA103', title: 'Financial Accounting for Managers', credits: 4.0, assg: 'A', end: 'A', final: 'A', gp: 8.0, status: 'PASS' },
        { code: 'MBA104', title: 'Marketing Management', credits: 4.0, assg: 'A+', end: 'O', final: 'O', gp: 10.0, status: 'PASS' },
        { code: 'MBA105', title: 'Business Statistics & Analytics', credits: 3.0, assg: 'A+', end: 'A+', final: 'A+', gp: 9.0, status: 'PASS' },
      ],
      sgpa: 9.16,
      resultStatus: 'PASS',
    },
    {
      name: 'Ananya Pattnaik',
      regNumber: '2026BBA001',
      rollNumber: 'SSU/2026/BBA/001',
      dob: '2003-11-22',
      progCode: 'BBA',
      batch: 'August 2025',
      semester: 'I',
      academicSession: '2025-2026',
      examSession: 'January 2026',
      declarationDate: '10 February 2026',
      courses: [
        { code: 'BBA101', title: 'Principles of Microeconomics', credits: 3.0, assg: 'A+', end: 'A', final: 'A+', gp: 9.0, status: 'PASS' },
        { code: 'BBA102', title: 'Business Communication Skills', credits: 3.0, assg: 'A', end: 'B+', final: 'A', gp: 8.0, status: 'PASS' },
        { code: 'BBA103', title: 'Fundamentals of Accounting', credits: 4.0, assg: 'A+', end: 'A+', final: 'A+', gp: 9.0, status: 'PASS' },
      ],
      sgpa: 8.70,
      resultStatus: 'PASS',
    },
    {
      name: 'Rohan Das',
      regNumber: '2026YOGA001',
      rollNumber: 'SSU/2026/YOG/001',
      dob: '2001-08-10',
      progCode: 'MA-YOGA',
      batch: 'August 2025',
      semester: 'I',
      academicSession: '2025-2026',
      examSession: 'January 2026',
      declarationDate: '10 February 2026',
      courses: [
        { code: 'YOG101', title: 'Fundamentals of Yoga & Philosophy', credits: 4.0, assg: 'O', end: 'O', final: 'O', gp: 10.0, status: 'PASS' },
      ],
      sgpa: 10.0,
      resultStatus: 'PASS',
    },
  ];

  for (const stuData of sampleStudents) {
    const prog = programmesMap.get(stuData.progCode);
    if (!prog) continue;

    const student = await prisma.student.upsert({
      where: { regNumber: stuData.regNumber },
      update: {
        name: stuData.name,
        rollNumber: stuData.rollNumber,
        dob: stuData.dob,
        programmeId: prog.id,
        batch: stuData.batch,
      },
      create: {
        regNumber: stuData.regNumber,
        rollNumber: stuData.rollNumber,
        name: stuData.name,
        dob: stuData.dob,
        programmeId: prog.id,
        batch: stuData.batch,
      },
    });

    await prisma.semesterResult.deleteMany({
      where: {
        studentId: student.id,
        semester: stuData.semester,
        academicSession: stuData.academicSession,
      },
    });

    const semResult = await prisma.semesterResult.create({
      data: {
        studentId: student.id,
        semester: stuData.semester,
        academicSession: stuData.academicSession,
        examSession: stuData.examSession,
        examType: 'REGULAR',
        viewType: 'GRADE_CARD',
        sgpa: stuData.sgpa,
        resultStatus: stuData.resultStatus,
        declarationDate: stuData.declarationDate,
        status: 'PUBLISHED',
        courseResults: {
          create: stuData.courses.map((c) => {
            const courseObj = coursesMap.get(c.code);
            return {
              courseId: courseObj.id,
              assignmentGrade: c.assg,
              endTermGrade: c.end,
              finalGrade: c.final,
              gradePoint: c.gp,
              status: c.status,
            };
          }),
        },
      },
    });

    const pdfFileName = `${student.regNumber}_Sem_${stuData.semester}.pdf`;
    const pdfPath = path.join(storageDir, pdfFileName);

    await generateGradeCardPdf(
      {
        studentName: student.name,
        regNumber: student.regNumber,
        rollNumber: student.rollNumber,
        programmeName: prog.name,
        academicSession: stuData.academicSession,
        examSession: stuData.examSession,
        examType: 'REGULAR',
        viewType: 'GRADE_CARD',
        batch: student.batch,
        semester: stuData.semester,
        sgpa: stuData.sgpa,
        resultStatus: stuData.resultStatus,
        declarationDate: stuData.declarationDate,
        courses: stuData.courses.map((c) => ({
          code: c.code,
          title: c.title,
          credits: c.credits,
          assignmentGrade: c.assg,
          endTermGrade: c.end,
          finalGrade: c.final,
          gradePoint: c.gp,
          status: c.status,
        })),
      },
      pdfPath
    );

    await prisma.gradeCard.upsert({
      where: { semesterResultId: semResult.id },
      update: { pdfPath },
      create: {
        studentId: student.id,
        semesterResultId: semResult.id,
        pdfPath,
      },
    });

    console.log(`✅ Seeded student ${student.name} (${student.regNumber}) with pre-generated PDF`);
  }

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: 'SYSTEM_SEED',
      resource: 'DATABASE',
      details: 'Updated database seed with official SSU ODL programmes',
    },
  });

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
