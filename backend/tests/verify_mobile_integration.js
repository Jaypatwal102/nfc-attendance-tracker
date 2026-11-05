const app = require('../src/server');
const http = require('http');

async function testMobileApiIntegration() {
  console.log('====================================================');
  console.log('🚀 TESTING MOBILE APP BACKEND INTEGRATION ENDPOINTS');
  console.log('====================================================\n');

  // Start temporary server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5001, resolve));
  const baseUrl = 'http://localhost:5001';

  let passed = 0;
  let failed = 0;

  function assert(condition, message, data = null) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      if (data) console.log('   Data:', JSON.stringify(data).slice(0, 150));
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      if (data) console.error('   Details:', data);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('\n--- 1. Testing Health Check Endpoint ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health is online', healthData);

    // 2. Teacher Login
    console.log('\n--- 2. Testing Teacher Login (/api/auth/login) ---');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher.demo@nfc-tracker.local',
        password: 'DemoTeacher@2026!',
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token;
    const teacherUser = loginData.data?.user;
    assert(
      loginRes.status === 200 && !!token && teacherUser?.role === 'TEACHER',
      'Teacher login successful with valid JWT & TEACHER role',
      { teacherName: teacherUser?.teacher?.name, employeeId: teacherUser?.teacher?.employeeId }
    );

    if (!token) {
      throw new Error('Cannot continue without valid teacher token.');
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. Current User Profile (/api/auth/me)
    console.log('\n--- 3. Testing /api/auth/me ---');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 && meData.data?.user?.email === 'teacher.demo@nfc-tracker.local',
      'GET /api/auth/me returns authenticated teacher',
      meData.data?.user?.email
    );

    // 4. Teacher Assignments (/api/teacher/assignments)
    console.log('\n--- 4. Testing Teacher Assignments (/api/teacher/assignments) ---');
    const assignRes = await fetch(`${baseUrl}/api/teacher/assignments`, { headers: authHeaders });
    const assignData = await assignRes.json();
    const assignments = assignData.data || [];
    assert(
      assignRes.status === 200 && Array.isArray(assignments) && assignments.length > 0,
      `GET /api/teacher/assignments returned ${assignments.length} assigned classes`,
      assignments[0]
    );

    const firstAssignment = assignments[0];
    const subjectId = firstAssignment?.subject?.id;
    const batchId = firstAssignment?.batch?.id;

    // 5. Enrolled Students (/api/teacher/students)
    console.log('\n--- 5. Testing Enrolled Students Endpoint (/api/teacher/students) ---');
    const studentsRes = await fetch(
      `${baseUrl}/api/teacher/students?subject_id=${subjectId}&batch_id=${batchId}`,
      { headers: authHeaders }
    );
    const studentsData = await studentsRes.json();
    const students = studentsData.data || [];
    assert(
      studentsRes.status === 200 && Array.isArray(students) && students.length > 0,
      `GET /api/teacher/students returned ${students.length} enrolled students with NFC mapping`,
      students.map((s) => ({ name: s.name, roll: s.enrollment_no, nfcId: s.nfc_id }))
    );

    // 6. Create Attendance Session (/api/teacher/attendance-sessions)
    console.log('\n--- 6. Testing Attendance Session Creation (/api/teacher/attendance-sessions) ---');
    const now = new Date();
    const sessionRes = await fetch(`${baseUrl}/api/teacher/attendance-sessions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        subject_id: subjectId,
        batch_id: batchId,
        session_date: now.toISOString(),
        start_time: now.toISOString(),
        end_time: new Date(now.getTime() + 3600000).toISOString(),
      }),
    });
    const sessionData = await sessionRes.json();
    const createdSessionId = sessionData.data?.id;
    assert(
      sessionRes.status === 201 && !!createdSessionId,
      'POST /api/teacher/attendance-sessions created session successfully',
      { sessionId: createdSessionId, subject: sessionData.data?.subject?.name }
    );

    // 7. Get Attendance Session Details & Created Records (/api/teacher/attendance-sessions/:id)
    console.log('\n--- 7. Testing Session Details & Records (/api/teacher/attendance-sessions/:id) ---');
    const sessionDetailsRes = await fetch(
      `${baseUrl}/api/teacher/attendance-sessions/${createdSessionId}`,
      { headers: authHeaders }
    );
    const sessionDetails = await sessionDetailsRes.json();
    const attendances = sessionDetails.data?.attendances || [];
    assert(
      sessionDetailsRes.status === 200 && attendances.length > 0,
      `GET /api/teacher/attendance-sessions/:id initialized ${attendances.length} default ABSENT records`,
      attendances.map((a) => ({ id: a.id, student: a.student?.name, status: a.status }))
    );

    // 8. Update Attendance (/api/teacher/attendance/:id)
    console.log('\n--- 8. Testing Attendance Update Sync (/api/teacher/attendance/:id) ---');
    if (attendances.length > 0) {
      const recordToUpdate = attendances[0];
      const patchRes = await fetch(`${baseUrl}/api/teacher/attendance/${recordToUpdate.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          status: 'PRESENT',
          remark: 'Marked via Mobile NFC Scan',
        }),
      });
      const patchData = await patchRes.json();
      assert(
        patchRes.status === 200 && patchData.data?.status === 'PRESENT',
        `PATCH /api/teacher/attendance/:id updated student ${recordToUpdate.student?.name} to PRESENT`,
        patchData.data
      );
    }

    // 9. Teacher Attendance History (/api/teacher/attendance)
    console.log('\n--- 9. Testing Teacher Attendance History (/api/teacher/attendance) ---');
    const histRes = await fetch(
      `${baseUrl}/api/teacher/attendance?subject_id=${subjectId}&batch_id=${batchId}`,
      { headers: authHeaders }
    );
    const histData = await histRes.json();
    assert(
      histRes.status === 200 && Array.isArray(histData.data) && histData.data.length > 0,
      `GET /api/teacher/attendance returned ${histData.data?.length} attendance history records`,
      { totalRecords: histData.data?.length }
    );

    console.log('\n====================================================');
    console.log(`🎯 INTEGRATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

testMobileApiIntegration();

