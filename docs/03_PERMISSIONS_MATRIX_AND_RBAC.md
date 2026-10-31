# MindSpark Hub Official Platform: Permissions Matrix and RBAC Architecture

## 1. Role Definitions

MindSpark Hub enforces strict Role-Based Access Control (RBAC) across four defined administrative tiers. Least privilege is enforced on the server for every operation.

1. **Super Administrator (`SUPER_ADMIN`):** Highest authority. Controls security settings, role assignments, user onboarding, user deactivation, and system-wide configurations. Maximum 2 to 3 designated individuals.
2. **Administrator (`ADMIN`):** Operational lead. Manages all public content, approves programme events, manages applications and inquiries, initiates safeguarded takedowns, and reviews audit logs. Cannot alter user roles or system security settings.
3. **Editor (`EDITOR`):** Content and communications lead. Manages Insights articles, educational publications, and general gallery items. Has no access to inquiries, application data, user accounts, or programme event approvals.
4. **Programme Manager (`PROGRAMME_MANAGER`):** Field operational lead. Manages programme details and creates/drafts event schedules. Can submit events for review but cannot self-approve or publish them. Has no access to articles, inquiries, or user data.

---

## 2. Server-Enforced Permissions Matrix

| Module & Capability | Anonymous Public | Programme Manager | Editor | Administrator | Super Administrator |
|---|:---:|:---:|:---:|:---:|:---:|
| **Public Content Reading** | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW |
| **Submit Public Inquiries / Applications** | ALLOW | ALLOW | ALLOW | ALLOW | ALLOW |
| **View Inquiries & Applications** | DENY | DENY | DENY | ALLOW | ALLOW |
| **Export Inquiries & Applications** | DENY | DENY | DENY | ALLOW (Audited) | ALLOW (Audited) |
| **Delete Inquiries (Retention Policy)** | DENY | DENY | DENY | DENY | ALLOW (Audited) |
| **Draft Programme Events** | DENY | ALLOW | DENY | ALLOW | ALLOW |
| **Approve & Publish Programme Events** | DENY | DENY | DENY | ALLOW | ALLOW |
| **Edit Programme Curricula** | DENY | ALLOW | DENY | ALLOW | ALLOW |
| **Create & Edit Articles** | DENY | DENY | ALLOW | ALLOW | ALLOW |
| **Publish Articles** | DENY | DENY | ALLOW | ALLOW | ALLOW |
| **Upload General Gallery Images** | DENY | DENY | ALLOW | ALLOW | ALLOW |
| **Upload & Verify Minors Consent in Gallery** | DENY | DENY | DENY | ALLOW | ALLOW |
| **Emergency Gallery Takedown** | DENY | DENY | DENY | ALLOW | ALLOW |
| **View Audit Logs** | DENY | DENY | DENY | ALLOW | ALLOW |
| **Invite New Users** | DENY | DENY | DENY | DENY | ALLOW |
| **Assign or Change User Roles** | DENY | DENY | DENY | DENY | ALLOW |
| **Deactivate User Accounts** | DENY | DENY | DENY | DENY | ALLOW |
| **Revoke Active User Sessions** | DENY | DENY | DENY | DENY | ALLOW |
| **Configure System Security Settings** | DENY | DENY | DENY | DENY | ALLOW |

---

## 3. Policy Module Design (`lib/auth/permissions.ts`)

Access controls are centralized in a single policy module that accepts the authenticated actor and the requested capability. Ad-hoc authorization checks in view layers are prohibited.

```typescript
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'PROGRAMME_MANAGER';

export type Permission =
  | 'content:read'
  | 'articles:manage'
  | 'gallery:manage'
  | 'gallery:consent_verify'
  | 'programmes:manage'
  | 'events:draft'
  | 'events:approve'
  | 'inquiries:view'
  | 'inquiries:export'
  | 'inquiries:delete'
  | 'users:manage'
  | 'audit:view'
  | 'security:configure';

export function hasPermission(role: Role, permission: Permission): boolean {
  switch (permission) {
    case 'content:read':
      return true;
    case 'events:draft':
    case 'programmes:manage':
      return ['SUPER_ADMIN', 'ADMIN', 'PROGRAMME_MANAGER'].includes(role);
    case 'articles:manage':
    case 'gallery:manage':
      return ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role);
    case 'events:approve':
    case 'gallery:consent_verify':
    case 'inquiries:view':
    case 'inquiries:export':
    case 'audit:view':
      return ['SUPER_ADMIN', 'ADMIN'].includes(role);
    case 'inquiries:delete':
    case 'users:manage':
    case 'security:configure':
      return role === 'SUPER_ADMIN';
    default:
      return false;
  }
}
```
