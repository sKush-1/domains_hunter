import bcrypt from "bcrypt";

async function hashPassword(password: string) {
  const saltRounds = 10; // cost factor
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

(async () => {
  const hashed = await hashPassword("myStrongPassword123");
  console.log("Hashed password:", hashed);
})();
