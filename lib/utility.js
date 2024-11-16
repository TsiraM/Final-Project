import bcrypt from 'bcrypt';

// Hash the password
async function hashPassword(plaintextPassword) {
  const hash = await bcrypt.hash(plaintextPassword, 10);
  console.log(hash);
  return hash;
}

// Validate the password
async function comparePassword(plaintextPassword, hash) {
  return await bcrypt.compare(plaintextPassword, hash);
}

export { hashPassword, comparePassword }