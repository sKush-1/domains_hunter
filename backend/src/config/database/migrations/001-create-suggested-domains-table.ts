/* eslint-disable camelcase */
import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Create the suggested_domains table
  pgm.createTable("suggested_domains", {
    id: {
      type: "BIGSERIAL",
      primaryKey: true,
    },
    prompt_id: {
      type: "VARCHAR(64)",
      notNull: true,
      unique: true,
    },
    content: {
      type: "TEXT",
      notNull: true,
    },
    ip_address: {
      type: "VARCHAR(45)",
      notNull: true,
    },
    device_id: {
      type: "VARCHAR(128)",
      notNull: true,
    },
    prompt_result: {
      type: "TEXT",
      notNull: true,
    },
    domains_result: {
      type: "TEXT",
      notNull: true,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  // Create indexes
  pgm.createIndex("suggested_domains", "prompt_id", { name: "idx_prompt_id" });
  pgm.createIndex("suggested_domains", "ip_address", {
    name: "idx_ip_address",
  });
  pgm.createIndex("suggested_domains", "device_id", { name: "idx_device_id" });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop indexes
  pgm.dropIndex("suggested_domains", "prompt_id", { name: "idx_prompt_id" });
  pgm.dropIndex("suggested_domains", "ip_address", { name: "idx_ip_address" });
  pgm.dropIndex("suggested_domains", "device_id", { name: "idx_device_id" });

  // Drop table
  pgm.dropTable("suggested_domains");
}
