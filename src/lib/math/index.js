function limit (n, max) {
  if (n > max) {
    return max;
  }

  return n;
}

module.exports = {
  limit,
};
