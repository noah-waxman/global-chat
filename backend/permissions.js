const db = require("./db");

let cache = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

async function loadRolePermissions() {
  const rows = await db.any(`
    SELECT r.name AS role, p.resource, p.action
    FROM Role_Permissions rp
    JOIN Roles r ON r.id = rp.role_id
    JOIN Permissions p ON p.id = rp.permission_id
  `);
  const map = {};
  for (const { role, resource, action } of rows) {
    (map[role] ??= new Set()).add(`${resource}:${action}`);
  }
  return map;
}

async function getRolePermissionsMap() {
  if (!cache || Date.now() > cacheExpiry) {
    cache = await loadRolePermissions();
    cacheExpiry = Date.now() + CACHE_TTL;
  }
  return cache;
}

async function hasPermission(roles, resource, action) {
  const map = await getRolePermissionsMap();
  const needed = `${resource}:${action}`;
  return roles.some((role) => map[role]?.has(needed));
}

function requirePermission(resource, action) {
  return async (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const allowed = await hasPermission(
        req.session.user.roles,
        resource,
        action,
      );
      if (!allowed) return res.status(403).json({ error: "Forbidden" });
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { hasPermission, requirePermission, getRolePermissionsMap };
