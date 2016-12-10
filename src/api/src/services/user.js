module.exports = {
  findByAccountName (accountName) {
    return {
      accountName,
    };
  },

  isUserInGuild () {
    return Promise.resolve(true);
  },
};
