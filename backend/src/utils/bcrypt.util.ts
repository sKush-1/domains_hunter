import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  const saltRounds = 10; // cost factor
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}
