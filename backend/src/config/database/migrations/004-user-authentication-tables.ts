/* eslint-disable camelcase */
import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // -------------------------------------
  // USERS TABLE
  // -------------------------------------
  pgm.createTable("users", {
    id: "id",
    email: {
      type: "VARCHAR(255)",
      unique: true,
      notNull: true,
    },
    name: {
      type: "VARCHAR(150)",
    },
    is_email_verified: {
      type: "BOOLEAN",
      default: false,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("users", "email", { name: "idx_users_email" });

  // -------------------------------------
  // AUTH PROVIDERS TABLE
  // (email/password OR google oauth)
  // -------------------------------------
  pgm.createTable("auth_providers", {
    id: "id",
    user_id: {
      type: "BIGINT",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    provider: {
      type: "VARCHAR(50)",
      notNull: true, // "email" | "google"
    },
    provider_id: {
      type: "VARCHAR(255)", // googleId OR null for email
    },
    password_hash: {
      type: "VARCHAR(255)", // only for email provider
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("auth_providers", ["provider", "provider_id"]);
  pgm.createIndex("auth_providers", "user_id");

  // One user cannot have duplicate provider entries
  pgm.addConstraint(
    "auth_providers",
    "unique_provider_per_user",
    "UNIQUE(user_id, provider)"
  );

  // -------------------------------------
  // SESSIONS TABLE (Refresh Tokens)
  // -------------------------------------
  pgm.createTable("sessions", {
    id: "id",
    user_id: {
      type: "BIGINT",
      references: "users",
      notNull: true,
      onDelete: "CASCADE",
    },
    refresh_token: {
      type: "TEXT",
      notNull: true,
      unique: true,
    },
    user_agent: {
      type: "TEXT",
    },
    ip_address: {
      type: "VARCHAR(45)",
    },
    expires_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("sessions", "user_id");

  // -------------------------------------
  // PASSWORD RESET TOKENS
  // -------------------------------------
  pgm.createTable("password_reset_tokens", {
    id: "id",
    user_id: {
      type: "BIGINT",
      references: "users",
      notNull: true,
      onDelete: "CASCADE",
    },
    token: {
      type: "TEXT",
      notNull: true,
      unique: true,
    },
    expires_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
    },
    used: {
      type: "BOOLEAN",
      default: false,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("password_reset_tokens", "user_id");

  // -------------------------------------
  // EMAIL VERIFICATION TOKENS
  // -------------------------------------
  pgm.createTable("email_verification_tokens", {
    id: "id",
    user_id: {
      type: "BIGINT",
      references: "users",
      notNull: true,
      onDelete: "CASCADE",
    },
    token: {
      type: "TEXT",
      notNull: true,
      unique: true,
    },
    expires_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
    },
    used: {
      type: "BOOLEAN",
      default: false,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("email_verification_tokens", "user_id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("email_verification_tokens");
  pgm.dropTable("password_reset_tokens");
  pgm.dropTable("sessions");
  pgm.dropConstraint("auth_providers", "unique_provider_per_user");
  pgm.dropTable("auth_providers");
  pgm.dropIndex("users", "email");
  pgm.dropTable("users");
}
