/**
 * INNOVRUSH 2K26 — Master Test Runner
 * Executes both Unit and Integration test suites sequentially and summarizes results.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTestFile(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, file)], {
      stdio: 'inherit'
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${file} failed with exit code ${code}`));
    });
  });
}

async function main() {
  console.log('\n============================================================');
  console.log('   INNOVRUSH 2K26 — COMPREHENSIVE VERIFICATION SUITE');
  console.log('============================================================');
  const start = Date.now();

  try {
    await runTestFile('unit.test.js');
    await runTestFile('integration.test.js');
    const totalMs = Date.now() - start;
    console.log('============================================================');
    console.log(`  ALL TEST SUITES PASSED SUCCESSFULLY IN ${(totalMs / 1000).toFixed(2)}s!`);
    console.log('============================================================\n');
  } catch (err) {
    console.error('\n' + err.message);
    process.exit(1);
  }
}

main();
