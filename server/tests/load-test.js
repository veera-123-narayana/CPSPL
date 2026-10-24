/**
 * INNOVRUSH 2K26 — Concurrency & Capacity Benchmark Suite
 * Measures real-world throughput, latency percentiles, and simultaneous user capacity.
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';

async function runBatch(concurrencyLevel, totalRequests) {
  const endpoints = ['/api/public/event', '/api/public/problems', '/api/public/timer'];
  const latencies = [];
  let successful = 0;
  let failed = 0;

  const startTime = Date.now();
  let remaining = totalRequests;

  async function worker() {
    while (remaining > 0) {
      remaining--;
      const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
      const reqStart = performance.now();
      try {
        const res = await fetch(`${BASE_URL}${ep}`);
        if (res.ok) {
          successful++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
      } finally {
        latencies.push(performance.now() - reqStart);
      }
    }
  }

  const workers = Array.from({ length: concurrencyLevel }, () => worker());
  await Promise.all(workers);

  const totalTimeMs = Date.now() - startTime;
  latencies.sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.5)]?.toFixed(1) || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)]?.toFixed(1) || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)]?.toFixed(1) || 0;
  const max = latencies[latencies.length - 1]?.toFixed(1) || 0;
  const rps = ((successful / totalTimeMs) * 1000).toFixed(0);

  return { concurrencyLevel, totalRequests, successful, failed, totalTimeMs, rps, p50, p95, p99, max };
}

async function benchmark() {
  console.log('\n============================================================');
  console.log('  INNOVRUSH 2K26 — CONCURRENCY & CAPACITY BENCHMARK');
  console.log(`  Target: ${BASE_URL}`);
  console.log('============================================================\n');

  console.log('Testing simultaneous participant loads...\n');
  
  const testTiers = [
    { concurrency: 25, requests: 200 },
    { concurrency: 50, requests: 400 },
    { concurrency: 100, requests: 800 },
  ];

  const results = [];
  for (const tier of testTiers) {
    process.stdout.write(`  [TESTING] ${tier.concurrency} Concurrent Users sending ${tier.requests} requests... `);
    const res = await runBatch(tier.concurrency, tier.requests);
    console.log(`DONE in ${(res.totalTimeMs / 1000).toFixed(2)}s`);
    results.push(res);
  }

  console.log('\n------------------------------------------------------------');
  console.log('  BENCHMARK RESULTS & LATENCY PROFILE');
  console.log('------------------------------------------------------------');
  console.log('| Concurrent Users | Total Requests | Success Rate | RPS       | Median (p50) | 95th %tile | Max Latency |');
  console.log('|:-----------------:|:--------------:|:------------:|:---------:|:------------:|:----------:|:-----------:|');
  for (const r of results) {
    const successRate = `${((r.successful / r.totalRequests) * 100).toFixed(1)}%`;
    console.log(`| ${String(r.concurrencyLevel).padEnd(17)} | ${String(r.totalRequests).padEnd(14)} | ${successRate.padEnd(12)} | ${(r.rps + ' req/s').padEnd(9)} | ${(r.p50 + ' ms').padEnd(12)} | ${(r.p95 + ' ms').padEnd(10)} | ${(r.max + ' ms').padEnd(11)} |`);
  }
  console.log('------------------------------------------------------------\n');
}

benchmark().catch(err => {
  console.error('Benchmark Error:', err);
});
