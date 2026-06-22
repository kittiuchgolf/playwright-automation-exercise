import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diffViolations } from './a11y-diff.mjs';

test('flags a rule id present now but absent from baseline', () => {
  const baseline = { '/': ['color-contrast', 'landmark-one-main'] };
  const current = { '/': ['color-contrast', 'landmark-one-main', 'button-name'] };
  assert.deepEqual(diffViolations(baseline, current), { '/': ['button-name'] });
});

test('reports an empty array when nothing is new', () => {
  const baseline = { '/products': ['image-alt'] };
  const current = { '/products': ['image-alt'] };
  assert.deepEqual(diffViolations(baseline, current), { '/products': [] });
});

test('treats every id on a brand-new route as new', () => {
  const baseline = {};
  const current = { '/login': ['color-contrast'] };
  assert.deepEqual(diffViolations(baseline, current), { '/login': ['color-contrast'] });
});
