export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'PROGRAMME_MANAGER' | 'FINANCE';

export type Permission =
  | 'content:read'
  | 'programmes:manage'
  | 'events:draft'
  | 'events:approve'
  | 'articles:manage'
  | 'articles:publish'
  | 'gallery:manage'
  | 'gallery:safeguard_approve'
  | 'gallery:takedown'
  | 'awards:manage'
  | 'inquiries:view'
  | 'inquiries:manage'
  | 'inquiries:export'
  | 'inquiries:delete'
  | 'users:manage'
  | 'audit:view'
  | 'security:manage'
  | 'donations:view'
  | 'donations:manage'
  | 'donations:export'
  | 'donations:refund';

export function hasPermission(role: Role, permission: Permission): boolean {
  switch (permission) {
    case 'content:read':
      return true;

    case 'programmes:manage':
    case 'events:draft':
      return ['SUPER_ADMIN', 'ADMIN', 'PROGRAMME_MANAGER'].includes(role);

    case 'events:approve':
      // Four-eyes principle: Programme Managers cannot approve their own events
      return ['SUPER_ADMIN', 'ADMIN'].includes(role);

    case 'articles:manage':
    case 'articles:publish':
    case 'gallery:manage':
    case 'awards:manage':
      return ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role);

    case 'gallery:safeguard_approve':
    case 'gallery:takedown':
    case 'inquiries:view':
    case 'inquiries:manage':
    case 'inquiries:export':
    case 'audit:view':
      return ['SUPER_ADMIN', 'ADMIN'].includes(role);

    case 'donations:view':
    case 'donations:manage':
    case 'donations:export':
    case 'donations:refund':
      return ['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(role);

    case 'inquiries:delete':
    case 'users:manage':
    case 'security:manage':
      return role === 'SUPER_ADMIN';

    default:
      return false;
  }
}

const ALL_PERMISSIONS: Permission[] = [
  'content:read',
  'programmes:manage',
  'events:draft',
  'events:approve',
  'articles:manage',
  'articles:publish',
  'gallery:manage',
  'gallery:safeguard_approve',
  'gallery:takedown',
  'awards:manage',
  'inquiries:view',
  'inquiries:manage',
  'inquiries:export',
  'inquiries:delete',
  'users:manage',
  'audit:view',
  'security:manage',
];

export function permissionsForRole(role: Role): Permission[] {
  return ALL_PERMISSIONS.filter((permission) => hasPermission(role, permission));
}

export function roleHierarchyLevel(role: Role): number {
  switch (role) {
    case 'SUPER_ADMIN':
      return 4;
    case 'ADMIN':
      return 3;
    case 'PROGRAMME_MANAGER':
      return 2;
    case 'EDITOR':
      return 2;
    default:
      return 0;
  }
}
