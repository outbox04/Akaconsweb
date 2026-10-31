export type RoleName = 'super_admin' | 'admin' | 'manager' | 'technician' | 'sale' | 'customer';

export const PERMISSION_MATRIX: Record<RoleName, string[]> = {
  super_admin: ['*'],
  admin: ['dashboard', 'customers', 'projects', 'studio', 'pricing', 'quotes', 'materials', 'live_preview', 'admin'],
  manager: ['dashboard', 'customers', 'projects', 'studio', 'pricing', 'quotes', 'materials', 'live_preview', 'admin'],
  technician: ['dashboard', 'projects', 'studio'],
  sale: ['dashboard', 'customers', 'projects', 'studio', 'pricing', 'quotes'],
  customer: ['portal'],
};

export function hasPermission(role: RoleName, viewOrAction: string): boolean {
  const allowed = PERMISSION_MATRIX[role] || [];
  return allowed.includes('*') || allowed.includes(viewOrAction);
}
