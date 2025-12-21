
import { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { db } from "../database/connection";
import { userRoles } from "../database/schema/userRoles";
import { rolePermissions } from "../database/schema/rolePermissions";
import { permissions as permissionsSchema } from "../database/schema/permissions";
import { eq, inArray } from "drizzle-orm";
import { CreateTokenDTO } from "../modules/auth/auth.dto";

export const permissionGuard = (requiredPermission: string) => {
  return createMiddleware(async (c: Context, next: Next) => {
    const user = c.get("jwtPayload") as CreateTokenDTO;
    
    if (!user) {
      return c.json({ message: "unauthorized" }, 401);
    }

    // Role 'owner' or 'admin' bypasses permission check if you want, 
    // but standard RBAC usually checks even for them unless they are superadmin.
    // For now, let's keep it strict or allow 'owner' to bypass.
    if (user.role === 'owner') {
      return next();
    }

    // 1. Get User Roles
    const userRoleIds = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    if (userRoleIds.length === 0) {
      return c.json({ message: "forbidden: no roles assigned" }, 403);
    }

    const roleIds = userRoleIds.map((r) => r.roleId);

    // 2. Get Permissions for these Roles
    const userPermissions = await db
      .select({ slug: permissionsSchema.slug })
      .from(rolePermissions)
      .innerJoin(permissionsSchema, eq(rolePermissions.permissionId, permissionsSchema.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    const hasPermission = userPermissions.some((p) => p.slug === requiredPermission);

    if (!hasPermission) {
      return c.json({ message: `forbidden: missing permission [${requiredPermission}]` }, 403);
    }

    return next();
  });
};
