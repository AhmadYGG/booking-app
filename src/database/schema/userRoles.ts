import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { roles } from "./roles";

export const userRoles = pgTable("user_roles", {
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));
