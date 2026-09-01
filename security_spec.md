# Security Specification & Firestore Hardening

## 1. Data Invariants
1. **User Identity & Isolation**: User profile documents at `/users/{userId}` can only be read and modified by the owner (`request.auth.uid == userId`).
2. **Administrative Control**: Elevated administrative actions and role management require verification against the `/admins/{userId}` collection or bootstrapped runtime admin authority (`aisay.company@gmail.com`).
3. **Customer Demands**: All scraped and imported buyer demands stored at `/demands/{demandId}` must contain valid non-empty IDs, required business type references, and valid status enumerations.
4. **Company Profiles & Business Types**: Business category catalogs and custom profile modifications must adhere strictly to predefined data types with size limitations to prevent injection or storage abuse.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
| # | Vector | Payload Target | Expected Result | Reason |
|---|--------|----------------|-----------------|--------|
| 1 | Identity Spoofing | `/users/victim_123` with `auth.uid = attacker_456` | PERMISSION_DENIED | User cannot write to another user's profile |
| 2 | Privilege Escalation | `/admins/attacker_456` | PERMISSION_DENIED | Non-admin cannot register themselves as admin |
| 3 | Oversized Demand ID | `/demands/{200-char-junk-string}` | PERMISSION_DENIED | Exceeds `isValidId` 128-char limit |
| 4 | Ghost Field Injection | `/demands/dem_1` with `{ fake_admin: true }` | PERMISSION_DENIED | Schema strictness rejects unexpected fields |
| 5 | Unauthorized Delete | `/demands/dem_1` unauthenticated delete | PERMISSION_DENIED | Unauthenticated users cannot delete demands |
| 6 | Broken Status Enum | `/demands/dem_1` with `status: 'CorruptedStatus'` | PERMISSION_DENIED | Invalid demand status value |
| 7 | Cross-Tenant Modification | `/company_profiles/{typeId}` unauthorized write | PERMISSION_DENIED | Requires valid authentication / permissions |
| 8 | Null ID document create | `/demands/` with invalid non-string ID | PERMISSION_DENIED | Path validation failure |
| 9 | Unauthenticated User Profile Read | `/users/{targetId}` without auth | PERMISSION_DENIED | Private PII isolation |
| 10 | Unverified Email Admin Access | Spoofed email claim without auth | PERMISSION_DENIED | Token verification gate |
| 11 | Malformed Business Type Mode | `online_or_onsite: 'InvalidMode'` | PERMISSION_DENIED | Enum restriction violated |
| 12 | Massive Payload Injection | 2MB text in title | PERMISSION_DENIED | String length constraints violated |
