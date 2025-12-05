/* eslint-disable camelcase */
import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("domains", {
    id: {
      type: "BIGSERIAL",
      primaryKey: true,
    },
    name: {
      type: "VARCHAR(255)",
      notNull: true,
      unique: true,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("domains", "name", { name: "idx_domains_name" });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("domains", "name", { name: "idx_domains_name" });
  pgm.dropTable("domains");
}
