import { validateResumePdf } from './src/lib/pdfValidator.ts';

// Test runner for Stage 1 PDF Validator
async function runTests() {
  console.log('--- RUNNING PDF VALIDATOR UNIT TESTS ---');
  let passed = 0;
  let failed = 0;

  // 1. Valid PDF with %PDF header
  const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]); // %PDF-1.7
  const validFile = new File([validPdfBytes], 'valid_resume.pdf', { type: 'application/pdf' });
  const res1 = await validateResumePdf(validFile);
  if (res1.isValid && res1.isMagicBytesVerified) {
    console.log('✔ Test 1 Passed: Valid PDF with %PDF header accepted.');
    passed++;
  } else {
    console.error('❌ Test 1 Failed:', res1.error);
    failed++;
  }

  // 2. Reject non-PDF file extension
  const txtFile = new File([new TextEncoder().encode('Hello World')], 'notes.txt', { type: 'text/plain' });
  const res2 = await validateResumePdf(txtFile);
  if (!res2.isValid && res2.error?.includes('Only PDF documents are supported')) {
    console.log('✔ Test 2 Passed: Non-PDF extension correctly rejected.');
    passed++;
  } else {
    console.error('❌ Test 2 Failed:', res2);
    failed++;
  }

  // 3. Reject spoofed PDF (renamed .exe or corrupt header)
  const fakePdfBytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]); // MZ header (.exe)
  const fakeFile = new File([fakePdfBytes], 'malicious.pdf', { type: 'application/pdf' });
  const res3 = await validateResumePdf(fakeFile);
  if (!res3.isValid && res3.error?.includes('does not contain a valid PDF document header signature')) {
    console.log('✔ Test 3 Passed: Spoofed PDF with invalid magic bytes rejected.');
    passed++;
  } else {
    console.error('❌ Test 3 Failed:', res3);
    failed++;
  }

  // 4. Reject oversized file (> 5 MB)
  const oversizedBlob = new Uint8Array(5 * 1024 * 1024 + 1024); // 5MB + 1KB
  const oversizedFile = new File([oversizedBlob], 'large_portfolio.pdf', { type: 'application/pdf' });
  const res4 = await validateResumePdf(oversizedFile);
  if (!res4.isValid && res4.error?.includes('exceeds the 5 MB limit')) {
    console.log('✔ Test 4 Passed: File exceeding 5 MB limit rejected.');
    passed++;
  } else {
    console.error('❌ Test 4 Failed:', res4);
    failed++;
  }

  // 5. Reject empty file (0 bytes)
  const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
  const res5 = await validateResumePdf(emptyFile);
  if (!res5.isValid && res5.error?.includes('empty')) {
    console.log('✔ Test 5 Passed: Empty 0-byte file rejected.');
    passed++;
  } else {
    console.error('❌ Test 5 Failed:', res5);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
