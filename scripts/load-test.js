const autocannon = require('autocannon');

async function runLoadTests() {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

  console.log(`🚀 Starting Sri Sri University High-Concurrency Load Test Suite...`);
  console.log(`Target: ${baseUrl}\n`);

  // Scenario 1: 1,000 concurrent students hitting Homepage
  console.log(`⚡ Scenario 1: Simulating 1,000 concurrent students opening Homepage...`);
  const result1 = await autocannon({
    url: baseUrl,
    connections: 1000,
    duration: 10,
  });
  console.log(`Summary Scenario 1: ${result1.requests.total} requests, p95 latency: ${result1.latency.p95}ms, 2xx: ${result1['2xx']}\n`);

  // Scenario 2: Student Result Search API Under Concurrency
  console.log(`⚡ Scenario 2: Simulating 1,000 concurrent students performing Result Lookup...`);
  const result2 = await autocannon({
    url: `${baseUrl}/api/result/search`,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      regNumber: '2026MBA001',
      dob: '2002-05-14',
      programmeId: 'dummy-id',
    }),
    connections: 1000,
    duration: 10,
  });
  console.log(`Summary Scenario 2: ${result2.requests.total} requests, p95 latency: ${result2.latency.p95}ms\n`);

  console.log(`✅ Load test suite completed!`);
}

runLoadTests().catch(console.error);
