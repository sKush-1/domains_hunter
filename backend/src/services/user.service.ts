import pool from "../config/database/db.config";
import { hashPassword } from "../utils/bcrypt.util";

export async function userEmailRegisterService(
  email: string,
  name: string,
  password: string,
) {
  const client = await pool.connect();
  try {
    const passwordHash = await hashPassword(password);

    await client.query("BEGIN");

    const insertUserResult = await client.query(
      `INSERT INTO users (email, name)
       VALUES ($1, $2)
       RETURNING id`,
      [email, name],
    );

    const userId = insertUserResult.rows[0].id;

    const insertAuthProviderResult = await client.query(
      `INSERT INTO auth_providers (user_id, provider, provider_id, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, "email", email, passwordHash],
    );

    await client.query("COMMIT");

    return insertAuthProviderResult.rows[0].id;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return null;
  } finally {
    client.release();
  }
}

export async function checkUserExists(email: string) {
  const client = await pool.connect();
  const user = await client.query(`SELECT id from users where email = $1`, [
    email,
  ]);
  return user.rows[0]?.id ?? null;
}
