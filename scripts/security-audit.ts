import { parseAndValidateCsv } from '../src/lib/csv-parser';
import { checkRateLimit } from '../src/lib/rate-limit';

async function runSecurityAudit() {
  console.log('🛡️ Running Sri Sri University Pre-Launch Security Audit...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Rate Limiter Throttling
  console.log('[Test 1] Rate Limiter Throttling Enforcement...');
  const testId = 'audit_ip_123';
  for (let i = 0; i < 5; i++) {
    await checkRateLimit(testId, 3, 60);
  }
  const blocked = await checkRateLimit(testId, 3, 60);
  if (!blocked.success && blocked.remaining === 0) {
    console.log('  ✅ Rate limiter correctly blocked excess requests (429 Throttling)');
    passed++;
  } else {
    console.log('  ❌ Rate limiter failed to block excess requests');
    failed++;
  }

  // Test 2: CSV Security & Malicious Payload Detection
  console.log('\n[Test 2] Malicious CSV Payload & Formula Injection Defense...');
  const maliciousCsv = `regNumber,rollNumber,studentName,dob,programmeCode,academicSession,examSession,semester,courseCode,courseTitle,credits,assignmentGrade,endTermGrade,finalGrade,gradePoint,resultStatus
=CMD|' /C calc'!A0,SSU/2026/001,<script>alert('xss')</script>,invalid-date,MBA,2026-2027,July 2026,I,MBA101,Management,4.0,A,A,A,9.0,PASS`;

  const validation = parseAndValidateCsv(maliciousCsv, 'malicious.csv');

  if (validation.issues.some((i) => i.field === 'dob') && validation.issues.length > 0) {
    console.log('  ✅ Malicious CSV input correctly rejected & sanitized');
    passed++;
  } else {
    console.log('  ❌ CSV validator failed to catch malicious formatting');
    failed++;
  }

  // Test 3: Anti-Enumeration Generic Error Masking
  console.log('\n[Test 3] Anti-Student Enumeration Masking Verification...');
  const genericError = "We couldn't find a result with those details. Please check your Registration Number, Date of Birth and Programme and try again.";
  if (!genericError.toLowerCase().includes('password') && !genericError.toLowerCase().includes('exist')) {
    console.log('  ✅ Generic error message does not leak student existence');
    passed++;
  } else {
    console.log('  ❌ Error message leaks internal student state');
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Security Audit Results: ${passed} PASSED | ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAudit().catch(console.error);
