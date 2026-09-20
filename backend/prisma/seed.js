const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('Seeding NFC Attendance Tracker PostgreSQL database...');

  // 1. System Attendance Settings
  const settingsCount = await prisma.attendanceSetting.count();
  if (settingsCount === 0) {
    await prisma.attendanceSetting.create({
      data: {
        minimumPercentage: 75.0,
        warningPercentage: 80.0,
      },
    });
    console.log('✅ Created default attendance settings (75% min threshold, 80% warning threshold)');
  }

  // 2. Demo Admin User (admin.demo@nfc-tracker.local / DemoAdmin@2026!)
  const adminPasswordHash = await hashPassword('DemoAdmin@2026!');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin.demo@nfc-tracker.local' },
    update: { passwordHash: adminPasswordHash, role: Role.ADMIN, isActive: true },
    create: {
      email: 'admin.demo@nfc-tracker.local',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin Demo Account initialized: ${adminUser.email}`);

  // 3. Demo Batch (2024_MCA)
  const batch = await prisma.batch.upsert({
    where: { name: '2024_MCA' },
    update: { program: 'MCA', admissionYear: 2024, semester: 1, section: 'A', isActive: true },
    create: {
      name: '2024_MCA',
      program: 'MCA',
      admissionYear: 2024,
      semester: 1,
      section: 'A',
      isActive: true,
    },
  });
  console.log(`✅ Academic Batch initialized: ${batch.name}`);

  // 4. Demo Subjects (MCA501, MCA502, MCA503)
  const dbmsSubject = await prisma.subject.upsert({
    where: { courseCode: 'MCA501' },
    update: { name: 'Database Management System', description: 'Relational databases and SQL', isActive: true },
    create: {
      courseCode: 'MCA501',
      name: 'Database Management System',
      description: 'Relational databases and SQL',
      isActive: true,
    },
  });

  const dsaSubject = await prisma.subject.upsert({
    where: { courseCode: 'MCA502' },
    update: { name: 'Data Structures & Algorithms', description: 'Trees, Graphs, and Complexity', isActive: true },
    create: {
      courseCode: 'MCA502',
      name: 'Data Structures & Algorithms',
      description: 'Trees, Graphs, and Complexity',
      isActive: true,
    },
  });

  const netSubject = await prisma.subject.upsert({
    where: { courseCode: 'MCA503' },
    update: { name: 'Computer Networks', description: 'TCP/IP, Routing, and Socket Programming', isActive: true },
    create: {
      courseCode: 'MCA503',
      name: 'Computer Networks',
      description: 'TCP/IP, Routing, and Socket Programming',
      isActive: true,
    },
  });
  console.log('✅ Academic Subjects initialized: MCA501, MCA502, MCA503');

  // 5. Demo Teacher User (teacher.demo@nfc-tracker.local / DemoTeacher@2026!)
  const teacherPasswordHash = await hashPassword('DemoTeacher@2026!');
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher.demo@nfc-tracker.local' },
    update: { passwordHash: teacherPasswordHash, role: Role.TEACHER, isActive: true },
    create: {
      email: 'teacher.demo@nfc-tracker.local',
      passwordHash: teacherPasswordHash,
      role: Role.TEACHER,
      isActive: true,
      teacher: {
        create: {
          name: 'Prof. Alan Turing',
          employeeId: 'EMP-DEMO-001',
          email: 'teacher.demo@nfc-tracker.local',
        },
      },
    },
    include: { teacher: true },
  });
  console.log(`✅ Teacher Demo Account initialized: ${teacherUser.email}`);

  // 6. Demo Student Users (student.demo@nfc-tracker.local & student2.demo@nfc-tracker.local)
  const studentPasswordHash = await hashPassword('DemoStudent@2026!');

  // Student 1 (Good Attendance: ~90%)
  const student1User = await prisma.user.upsert({
    where: { email: 'student.demo@nfc-tracker.local' },
    update: { passwordHash: studentPasswordHash, role: Role.STUDENT, isActive: true },
    create: {
      email: 'student.demo@nfc-tracker.local',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      isActive: true,
      student: {
        create: {
          name: 'Jane Doe',
          enrollmentNo: 'MCA2024-DEMO-01',
          nfcId: 'DEMO-NFC-001',
          email: 'student.demo@nfc-tracker.local',
          batchId: batch.id,
        },
      },
    },
    include: { student: true },
  });
  console.log(`✅ Student Demo Account 1 initialized: ${student1User.email}`);

  // Student 2 (Low Attendance: < 75%)
  let student2User = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'jay.mca.nita@gmail.com' },
        { email: 'jaypatwal1@gmail.com' },
        { email: 'student2.demo@nfc-tracker.local' },
        { student: { enrollmentNo: 'MCA2024-DEMO-02' } },
      ],
    },
    include: { student: true },
  });

  if (!student2User) {
    student2User = await prisma.user.create({
      data: {
        email: 'jay.mca.nita@gmail.com',
        passwordHash: studentPasswordHash,
        role: Role.STUDENT,
        isActive: true,
        student: {
          create: {
            name: 'Rahul Patwal',
            enrollmentNo: 'MCA2024-DEMO-02',
            nfcId: 'DEMO-NFC-002',
            email: 'jay.mca.nita@gmail.com',
            batchId: batch.id,
          },
        },
      },
      include: { student: true },
    });
  } else {
    // Update existing user and student email to jay.mca.nita@gmail.com
    await prisma.user.update({
      where: { id: student2User.id },
      data: { email: 'jay.mca.nita@gmail.com', passwordHash: studentPasswordHash },
    });
    if (student2User.student) {
      await prisma.student.update({
        where: { id: student2User.student.id },
        data: { email: 'jay.mca.nita@gmail.com', name: 'Rahul Patwal' },
      });
    }
    student2User = await prisma.user.findUnique({
      where: { id: student2User.id },
      include: { student: true },
    });
  }
  console.log(`✅ Low Attendance Student Demo Account 2 initialized: ${student2User.email}`);

  // 7. Teacher Subject Batch Mappings
  if (teacherUser.teacher) {
    for (const sub of [dbmsSubject, dsaSubject, netSubject]) {
      await prisma.teacherSubjectMapping.upsert({
        where: {
          teacherId_subjectId_batchId: {
            teacherId: teacherUser.teacher.id,
            subjectId: sub.id,
            batchId: batch.id,
          },
        },
        update: {},
        create: {
          teacherId: teacherUser.teacher.id,
          subjectId: sub.id,
          batchId: batch.id,
        },
      });
    }
    console.log('✅ Teacher-Subject-Batch mappings created');
  }

  // 8. Student Subject Batch Mappings
  const demoStudents = [student1User.student, student2User.student].filter(Boolean);
  for (const st of demoStudents) {
    for (const sub of [dbmsSubject, dsaSubject, netSubject]) {
      await prisma.studentSubjectMapping.upsert({
        where: {
          studentId_subjectId_batchId: {
            studentId: st.id,
            subjectId: sub.id,
            batchId: batch.id,
          },
        },
        update: {},
        create: {
          studentId: st.id,
          subjectId: sub.id,
          batchId: batch.id,
        },
      });
    }
  }
  console.log('✅ Student-Subject-Batch enrollments created');

  // 9. Generate Demo Attendance Sessions & Attendance Records
  if (teacherUser.teacher && student1User.student && student2User.student) {
    // Create 10 demo sessions for DBMS
    for (let i = 1; i <= 10; i++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - (10 - i));

      const session = await prisma.attendanceSession.create({
        data: {
          subjectId: dbmsSubject.id,
          teacherId: teacherUser.teacher.id,
          batchId: batch.id,
          sessionDate,
          startTime: sessionDate,
          endTime: new Date(sessionDate.getTime() + 3600000),
        },
      });

      // Student 1 (Jane Doe): Attends 9 out of 10 sessions (90%)
      await prisma.attendance.create({
        data: {
          sessionId: session.id,
          studentId: student1User.student.id,
          status: i === 5 ? 'ABSENT' : 'PRESENT',
          markedAt: sessionDate,
        },
      });

      // Student 2 (Rahul Patwal): Attends 6 out of 10 sessions (60% - Low Attendance)
      await prisma.attendance.create({
        data: {
          sessionId: session.id,
          studentId: student2User.student.id,
          status: i <= 6 ? 'PRESENT' : 'ABSENT',
          markedAt: sessionDate,
        },
      });
    }
    console.log('✅ Generated 10 demo attendance sessions with realistic attendance math records (Jane Doe: 90%, Rahul Patwal: 60%)');
  }

  console.log('\n🎉 Database seeding finished successfully with demo accounts & academic data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
