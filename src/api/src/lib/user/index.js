function parseAccountName (userResult) {
  const token = userResult.gw2_api_tokens &&
    userResult.gw2_api_tokens.filter((tkn) => tkn.primary)[0];

  return token && token.accountName;
}

module.exports = {
  parseAccountName,
};
