# Security Specification & Test Payloads

## 1. Data Invariants
- **Lead Invariant:** Each lead belongs to an authenticated user (`userId == request.auth.uid`). Budget must be a positive number. Temperature must be one of `['Hot', 'Warm', 'Cold']`. Stage must be a valid pipeline stage.
- **Appointment Invariant:** Each viewing appointment references a valid `leadId`, `propertyId`, and belongs to `request.auth.uid`. Status must be `['Scheduled', 'Completed', 'Cancelled']`.
- **FollowUp Invariant:** Follow-up logs must have a valid `channel` (`['WhatsApp', 'SMS', 'Email']`) and belong to `request.auth.uid`.
- **UserProfile Invariant:** A user can only create or update their own profile matching `request.auth.uid`. Role manipulation by non-admins is prevented.

## 2. Dirty Dozen Test Payloads
1. **Unauthenticated Write:** Writing a lead without `request.auth`. Expected: `PERMISSION_DENIED`.
2. **User Impersonation:** Attempting to write a lead with `userId = 'other-user-uid'`. Expected: `PERMISSION_DENIED`.
3. **Invalid Budget Type:** Passing `budget = "three million"` (string instead of number). Expected: `PERMISSION_DENIED`.
4. **Invalid Temperature Enum:** Passing `temperature = "UltraMegaHot"`. Expected: `PERMISSION_DENIED`.
5. **ID Poisoning Attack:** Creating a document with a 2048-byte malformed ID with illegal characters. Expected: `PERMISSION_DENIED`.
6. **Immutable Field Tampering:** Updating an existing lead while altering its immutable `userId`. Expected: `PERMISSION_DENIED`.
7. **Ghost Field Injection (Shadow Update):** Updating a lead with undeclared root properties like `__hacked: true`. Expected: `PERMISSION_DENIED`.
8. **PII Data Snooping:** Reading another user's leads without being an admin or owner. Expected: `PERMISSION_DENIED`.
9. **Role Self-Escalation:** Normal user modifying their own `role` in `/users/{userId}` to `admin`. Expected: `PERMISSION_DENIED`.
10. **Appointment Hijacking:** Deleting or altering appointments owned by another agency agent. Expected: `PERMISSION_DENIED`.
11. **Malicious FollowUp Payload:** FollowUp message exceeding maximum length boundary (over 2000 chars) or invalid channel. Expected: `PERMISSION_DENIED`.
12. **Blanket Query Scraping:** Unauthenticated or broad cross-tenant list queries on `/leads`. Expected: `PERMISSION_DENIED`.
