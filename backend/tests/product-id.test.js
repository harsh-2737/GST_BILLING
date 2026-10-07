const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveNextProductId } = require('../utils/productId');

test('keeps product IDs ahead of the largest existing product id', () => {
  assert.equal(resolveNextProductId(5, 6), 7);
  assert.equal(resolveNextProductId(6, 5), 7);
  assert.equal(resolveNextProductId(0, 0), 1);
});
