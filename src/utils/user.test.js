import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDisplayName, hasSavedName, validateDisplayName } from './user.js';

test('validateDisplayName trims whitespace and accepts 2-30 valid chars with space or hyphen', () => {
  assert.deepEqual(validateDisplayName('  Madhavan  '), {
    valid: true,
    value: 'Madhavan',
  });
  assert.deepEqual(validateDisplayName('Mary-Jane Lee'), {
    valid: true,
    value: 'Mary-Jane Lee',
  });
  assert.deepEqual(validateDisplayName('AB'), {
    valid: true,
    value: 'AB',
  });
  assert.deepEqual(validateDisplayName('A'.repeat(30)), {
    valid: true,
    value: 'A'.repeat(30),
  });
});

test('validateDisplayName rejects empty, short, long, or special characters', () => {
  assert.equal(validateDisplayName('').valid, false);
  assert.equal(validateDisplayName('   ').valid, false);
  assert.equal(validateDisplayName('A').valid, false);
  assert.equal(validateDisplayName('  A  ').valid, false);
  assert.equal(validateDisplayName('A'.repeat(31)).valid, false);
  assert.equal(validateDisplayName('Madhavan_1').valid, false);
  assert.equal(validateDisplayName('Madhavan!').valid, false);
  assert.equal(validateDisplayName('user@mail').valid, false);
});

test('hasSavedName checks explicitly saved displayName/name without triggering on username fallback', () => {
  assert.equal(hasSavedName(null), false);
  assert.equal(hasSavedName({ username: 'bob_123', email: 'bob@example.com', displayName: null, name: null }), false);
  assert.equal(hasSavedName({ username: 'bob_123', name: 'bob_123', displayName: '   ' }), false);
  assert.equal(hasSavedName({ username: 'bob_123', displayName: 'Bob' }), true);
  assert.equal(hasSavedName({ username: 'bob_123', name: 'Bob' }), true);
});

test('formatDisplayName still cleans email/username when displayName is null', () => {
  assert.equal(
    formatDisplayName({ username: 'madhavanvairava_380', email: 'madhavanvairava_380@gmail.com', displayName: null }),
    'Madhavanvairava'
  );
  assert.equal(
    formatDisplayName({ username: 'madhavanvairava_380', email: 'madhavanvairava_380@gmail.com', displayName: 'Madhavan' }),
    'Madhavan'
  );
});

