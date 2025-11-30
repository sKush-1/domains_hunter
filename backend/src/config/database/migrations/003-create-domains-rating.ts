/* eslint-disable camelcase */
import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create the domain_ratings table
  pgm.createTable("domain_ratings", {
    id: {
      type: "BIGSERIAL",
      primaryKey: true,
    },
    domain_id: {
      type: "BIGINT",
      notNull: true,
      references: "domains",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "BIGINT",
      // nullable for anonymous users
    },
    rating: {
      type: "INTEGER",
      notNull: true,
      check: "rating >= 1 AND rating <= 10",
    },
    ip_address: {
      type: "VARCHAR(45)",
    },
    device_id: {
      type: "VARCHAR(128)",
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

  // Create indexes
  pgm.createIndex("domain_ratings", "domain_id", {
    name: "idx_domain_ratings_domain_id",
  });
  pgm.createIndex("domain_ratings", "user_id", {
    name: "idx_domain_ratings_user_id",
  });

  // Unique constraint: one rating per user per domain (or per IP/device if anonymous)
  pgm.createIndex("domain_ratings", ["domain_id", "user_id"], {
    name: "idx_domain_ratings_unique",
    unique: true,
    where: "user_id IS NOT NULL",
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop indexes
  pgm.dropIndex("domain_ratings", ["domain_id", "user_id"], {
    name: "idx_domain_ratings_unique",
  });
  pgm.dropIndex("domain_ratings", "user_id", {
    name: "idx_domain_ratings_user_id",
  });
  pgm.dropIndex("domain_ratings", "domain_id", {
    name: "idx_domain_ratings_domain_id",
  });

  // Drop table
  pgm.dropTable("domain_ratings");
}
