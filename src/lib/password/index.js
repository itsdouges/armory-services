import password from 'password-hash-and-salt';

export async function hashPassword (userPassword) {
  return new Promise((resolve, reject) => {
    password(userPassword).hash((error, hash) => {
      if (error) {
        return reject(error);
      }

      return resolve(hash);
    });
  });
}

export async function verifyHash (hash, userPassword) {
  return new Promise((resolve, reject) => {
    password(userPassword).verifyAgainst(hash, (error, verified) => {
      if (error) {
        return reject(error);
      }

      if (!verified) {
        return reject('Bad password');
      }

      return resolve();
    });
  });
}
