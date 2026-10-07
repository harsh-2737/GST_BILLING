function resolveNextProductId(currentCounterValue, maxExistingProductId) {
  const currentValue = Number(currentCounterValue ?? 0);
  const maxExistingId = Number(maxExistingProductId ?? 0);

  if (!Number.isFinite(currentValue) && !Number.isFinite(maxExistingId)) {
    return 1;
  }

  if (!Number.isFinite(currentValue)) {
    return maxExistingId + 1;
  }

  if (!Number.isFinite(maxExistingId)) {
    return currentValue + 1;
  }

  return Math.max(currentValue + 1, maxExistingId + 1);
}

module.exports = {
  resolveNextProductId,
};
