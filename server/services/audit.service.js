import AuditLog from '../models/AuditLog.js';

export async function logAudit({ user, action, entityType, entityId, details, req }) {
  try {
    await AuditLog.create({
      performedBy: user._id,
      performedByName: user.name,
      role: user.role,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
    });
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
}

