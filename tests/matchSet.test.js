const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

// Extract function from index.html
const html = fs.readFileSync('index.html', 'utf-8');
const funcStartStr = 'function matchSet(haystackArr, selectedSet, requireAll)';
const startIndex = html.indexOf(funcStartStr);
const braceStart = html.indexOf('{', startIndex);
let braceCount = 0;
let endIndex = -1;
for (let i = braceStart; i < html.length; i++) {
  if (html[i] === '{') braceCount++;
  if (html[i] === '}') {
    braceCount--;
    if (braceCount === 0) {
      endIndex = i;
      break;
    }
  }
}
const body = html.substring(braceStart + 1, endIndex);
const matchSet = new Function('haystackArr', 'selectedSet', 'requireAll', body);

test('matchSet function tests', async (t) => {
  await t.test('returns true when selectedSet is empty', () => {
    assert.strictEqual(matchSet(['a', 'b'], new Set(), false), true);
    assert.strictEqual(matchSet(['a', 'b'], new Set(), true), true);
  });

  await t.test('requireAll = false: returns true if haystackArr has any of selectedSet', () => {
    assert.strictEqual(matchSet(['a', 'b', 'c'], new Set(['b', 'd']), false), true);
  });

  await t.test('requireAll = false: returns false if haystackArr has none of selectedSet', () => {
    assert.strictEqual(matchSet(['a', 'b', 'c'], new Set(['x', 'y']), false), false);
  });

  await t.test('requireAll = true: returns true if haystackArr has all of selectedSet', () => {
    assert.strictEqual(matchSet(['a', 'b', 'c', 'd'], new Set(['b', 'd']), true), true);
  });

  await t.test('requireAll = true: returns false if haystackArr is missing any of selectedSet', () => {
    assert.strictEqual(matchSet(['a', 'b', 'c'], new Set(['b', 'd']), true), false);
  });
});
