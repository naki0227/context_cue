import assert from 'node:assert/strict';
import { test } from 'node:test';

import { auditText, isReservedEmailDomain } from './privacy-audit.mjs';

test('allows reserved documentation email domains', () => {
  assert.equal(isReservedEmailDomain('example.invalid'), true);
  assert.equal(isReservedEmailDomain('users.noreply.github.com'), true);
  assert.equal(isReservedEmailDomain('company.example'), true);
});

test('reports privacy-sensitive values without returning their contents', () => {
  const text = [
    ['/Users', 'sample', 'notes.txt'].join('/'),
    ['person', 'company.com'].join('@'),
    ['090', '1234', '5678'].join('-'),
    '-----BEGIN ' + 'PRIVATE KEY-----',
    `ghp_${'a'.repeat(24)}`,
  ].join('\n');

  const findings = auditText('fixture.txt', text);

  assert.deepEqual(
    findings.map(({ code, line, path }) => ({ code, line, path })),
    [
      { code: 'absolute-home-path', line: 1, path: 'fixture.txt' },
      { code: 'private-key', line: 4, path: 'fixture.txt' },
      { code: 'github-token', line: 5, path: 'fixture.txt' },
      { code: 'phone-number', line: 3, path: 'fixture.txt' },
      { code: 'non-reserved-email', line: 2, path: 'fixture.txt' },
    ],
  );
});

test('accepts generic fixtures that cannot deliver email', () => {
  assert.deepEqual(auditText('fixture.txt', 'contact-001@example.invalid'), []);
});
