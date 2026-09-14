const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert');

const html = fs.readFileSync('index.html', 'utf8');

function extractFunction(html, funcName) {
  const funcStr = `function ${funcName}(`;
  let startIdx = html.indexOf(funcStr);
  if (startIdx === -1) throw new Error(`Function ${funcName} not found`);

  let braceCount = 0;
  let bodyStart = -1;
  let bodyEnd = -1;

  const openParen = html.indexOf('(', startIdx);
  const closeParen = html.indexOf(')', openParen);
  const argsStr = html.substring(openParen + 1, closeParen);
  const args = argsStr ? argsStr.split(',').map(s => s.trim()) : [];

  for (let i = closeParen + 1; i < html.length; i++) {
    if (html[i] === '{') {
      if (braceCount === 0) bodyStart = i + 1;
      braceCount++;
    } else if (html[i] === '}') {
      braceCount--;
      if (braceCount === 0 && bodyStart !== -1) {
        bodyEnd = i;
        break;
      }
    }
  }

  const body = html.substring(bodyStart, bodyEnd);
  return new Function(...args, body);
}

const impactColor = extractFunction(html, 'impactColor');

test('impactColor tests', async (t) => {
    await t.test('v < 0 clamps to 0', () => {
        assert.strictEqual(impactColor(-1), '#10b981');
    });

    await t.test('v = 0 returns start color', () => {
        assert.strictEqual(impactColor(0), '#10b981');
    });

    await t.test('v = 5 returns end color', () => {
        assert.strictEqual(impactColor(5), '#ef4444');
    });

    await t.test('v > 5 clamps to 5', () => {
        assert.strictEqual(impactColor(6), '#ef4444');
    });

    await t.test('v = 2.5 interpolates correctly', () => {
        assert.strictEqual(impactColor(2.5), '#807f63');
    });
});
