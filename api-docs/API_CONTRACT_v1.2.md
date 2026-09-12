# KaraAds API Contract v1.2 (Canonical)

## Purpose
This is the canonical API contract for mobile clients and AI assistants (Gemini/ChatGPT).  
v1.2 is additive and compatibility-safe: v1.1 remains available, but new integrations should use v1.2.

Base URL: `https://karaads.com/api/open-labs/oyibo/v1.2`  
Machine-readable schema: `openapi.yaml` (same repo root)

## Gemini Ingestion Prompt
Use this prompt in AI Studio before asking implementation questions:

```text
Load and treat API_CONTRACT_v1.2.md and openapi.yaml as the source of truth.
Assume:
1) v1.2 response envelope is mandatory.
2) v1.1 is legacy and may be inconsistent.
3) Realtime call channels/payloads must match documented event fields exactly.
If uncertain, cite the exact endpoint and schema component from openapi.yaml.
```

## v1.2 Envelope
Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {}
  }
}
```

Standard error codes:
- `VALIDATION_ERROR` (422)
- `UNAUTHENTICATED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `RATE_LIMITED` (429)
- `HTTP_ERROR` (other HTTP failures)
- `ACCOUNT_SETUP_REQUIRED` (403, imported users)

## Auth: Imported Account Activation
When a user has `must_set_password=true`, `POST /auth/login` does not issue a token.

Server behavior:
- Sends an 8-character alphanumeric activation code to user email.
- Returns `403 ACCOUNT_SETUP_REQUIRED` with deterministic next actions.

Example response:

```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_SETUP_REQUIRED",
    "message": "Account setup required. Use the 8-character code sent to your email, then set your password.",
    "details": {
      "requires_email_verification": true,
      "requires_password_setup": true,
      "next_actions": ["verify_email_code", "set_password"]
    }
  }
}
```

Client UX mapping:
- Do not show generic invalid-credentials messaging for this error.
- Route user to setup instructions: enter email code, set password, then sign in.

## Auth Endpoints (v1.2)
Base path: `/auth`

Public endpoints (no auth required):
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/verify-2fa`
- `POST /auth/account-activation/send-code`
- `POST /auth/account-activation/verify-code`
- `POST /auth/account-activation/set-password`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`

Authenticated endpoints (bearer token required, email verification not required):
- `POST /auth/verify-email/otp/send-code`
- `POST /auth/verify-email/otp/verify-code`
- `POST /auth/password/change`
- `POST /auth/2fa/enable`
- `POST /auth/2fa/confirm`
- `POST /auth/2fa/disable`
- `POST /auth/2fa/recovery-codes`

Authenticated endpoints (bearer token + verified email required):
- `GET /auth/me`
- `POST /auth/logout`

### Imported Account Setup Flow
1) `POST /auth/login` returns `403 ACCOUNT_SETUP_REQUIRED` and sends an activation code to email.  
2) `POST /auth/account-activation/verify-code` with `{ email, code }` returns `activation_token` (15 minutes).  
3) `POST /auth/account-activation/set-password` with `{ activation_token, password, password_confirmation }`.  
4) Client must call `POST /auth/login` to obtain a token after password is set.

### Email Verification (OTP)
- `POST /auth/verify-email/otp/send-code` sends an 8-character code to the signed-in user's email.
- `POST /auth/verify-email/otp/verify-code` verifies the code and marks email verified.

### Password Reset
- `POST /auth/password/forgot` sends a reset link to email.
- `POST /auth/password/reset` resets the password with `{ email, token, password, password_confirmation }`.

### Password Change (Authenticated)
- `POST /auth/password/change` requires `current_password`, `password`, `password_confirmation`.

### Two-Factor Management
- `POST /auth/2fa/enable` returns QR + OTP URL + recovery codes.
- `POST /auth/2fa/confirm` confirms the TOTP code if confirmation is required.
- `POST /auth/2fa/disable` disables 2FA (requires `current_password`).
- `POST /auth/2fa/recovery-codes` returns or regenerates recovery codes (requires `current_password`).

## Realtime Calls Contract (Priority)
Channels:
- `private-App.Models.User.{id}`
  - Events: `IncomingCall`, `CallAccepted`, `CallDeclined`
- `private-call.{callId}`
  - Events: `CallOffer`, `CallAnswer`, `CallIceCandidate`, `CallEnded`, `CallParticipantRemoved`, `CallJoinRequestCreated`, `CallJoinRequestUpdated`

Event payload fields (implemented):
- `IncomingCall`: `call_id`, `conversation_id`, `from_user_id`, `caller`
- `CallAccepted`: `call_id`, `conversation_id`, `from_user_id`
- `CallDeclined`: `call_id`, `conversation_id`, `from_user_id`
- `CallOffer`: `call_id`, `conversation_id`, `from_user_id`, `offer_signal_id`
- `CallAnswer`: `call_id`, `conversation_id`, `from_user_id`, `answer_signal_id`
- `CallIceCandidate`: `call_id`, `conversation_id`, `from_user_id`, `candidate`
- `CallEnded`: `call_id`, `conversation_id`, `from_user_id`
- `CallParticipantRemoved`: `call_id`, `conversation_id`, `from_user_id`, `removed_user_id`, `reason`, `participant_ids`
- `CallJoinRequestCreated`: `call_id`, `conversation_id`, `request`, `pending_requests`
- `CallJoinRequestUpdated`: `call_id`, `conversation_id`, `request`, `pending_requests`, `decided_by_user_id`

Call lifecycle endpoints:
- `POST /conversations/{conversationId}/calls`
- `GET /calls/active`
- `GET /calls/{callId}`
- `POST /calls/{callId}/accept`
- `POST /calls/{callId}/decline`
- `POST /calls/{callId}/end`
- `POST /calls/{callId}/leave`
- `POST /calls/{callId}/heartbeat`
- `POST /calls/{callId}/offer`
- `POST /calls/{callId}/answer`
- `POST /calls/{callId}/ice`
- `GET /calls/{callId}/signals/{type}/{signalId}`

## Comment Threads (v1.2 Additive)
- `POST /posts/{postId}/comment` supports optional `parent_id` (UUID) to create a reply.
- `GET /posts/{postId}/comments` returns top-level comments only (timeline order: oldest -> newest).
- `GET /posts/{postId}/comments/{commentId}/replies` returns direct replies only (timeline order: oldest -> newest).
- Comment payload fields now include `parent_id` and `reply_count`.
- Realtime `CommentCreated` payload includes `parent_id` and `reply_count` to distinguish top-level comments vs replies.

## UI/UX Design Guidance (API-integrated)
### Error State Matrix
- `401 UNAUTHENTICATED`: redirect to login, clear stale token, preserve pending action intent.
- `403 FORBIDDEN`: show non-retry action state; avoid auto-retry loops.
- `404 NOT_FOUND`: show neutral empty state and exit current flow.
- `409 CONFLICT` (domain conflicts): show actionable CTA (`Refresh`, `Join Active Call`, `Retry`).
- `422 VALIDATION_ERROR`: inline field errors; no global blocking modal.
- `429 RATE_LIMITED`: show countdown/retry affordance; exponential backoff.

### Loading/Skeleton/Pagination
- Feed/list endpoints: show skeleton cards while loading page 1.
- For `page > 1`, append spinner row, never clear existing content.
- Preserve scroll position on incremental pagination errors.

### Optimistic Update Rules
- `like/save/follow`: optimistic toggle allowed; rollback on 4xx/5xx with toast.
- `send message`: optimistic pending bubble; mark failed bubble with retry action.
- `start call`: no optimistic “in-call” transition until `CallAccepted` or `accept` response.

### Realtime Call UX State Machine
- `idle -> dialing` after `POST /calls`
- `dialing -> ringing` after success create
- `ringing -> connected` on `CallAccepted` + SDP flow complete
- `app refresh -> restoring` via `GET /calls/active` when active call exists
- `restoring -> reconnecting` after media + signaling resume
- `connected -> reconnecting` on transport loss
- `reconnecting -> connected` on recovery
- `ringing|connected -> ended` on `CallDeclined`/`CallEnded` or timeout
- Recipients in `ringing` state must not be auto-answered on refresh; restore incoming prompt only
- Audio-call clients must bind remote streams to concrete `<audio autoPlay playsInline>` elements for playback.
- Ringing engine requirements:
  - recipient ringtone during incoming
  - caller ringback during outgoing ringing
  - stop tones on accept/decline/end/leave and on connected/reconnecting transitions
  - static-file playback with generated tone fallback when files/autoplay fail

### Conflict/Retry Behavior
- `403` on join-by-link pre-approval: create join request and poll `GET /calls/active` until approved.
- `409` during call create: surface “already in call”, offer jump to `GET /calls/active`.
- `422` on signaling payload: block send, keep user in call UI with validation detail.
- `429` on signaling bursts: queue outbound candidates and flush with jittered backoff.
- `403` on call invite: user must be in your following list for invite eligibility.

## v1.1 -> v1.2 Migration Map
| Area | v1.1 | v1.2 |
|---|---|---|
| Envelope | Mixed payload styles | Uniform `success/data/error` envelope |
| Errors | Laravel default + custom mixed | Normalized error code/message/details |
| Calls read API | No explicit active/show endpoint | `GET /calls/active`, `GET /calls/{callId}` |
| Signal retrieval | Available on web routes, partial mobile docs | Explicitly documented and available in v1.2 |
| Stories | Create-focused mobile docs | Explicit `GET /stories` and `GET /stories/{storyId}` contract |

## Operational Runbook (Calls + Avatars)
### Avatar derivative repair
Run missing avatar derivative backfill:

```bash
php artisan media:backfill-derivatives --avatars --only-missing=1
```

Confirm queue worker is running for avatar jobs (`ProcessUserAvatar`).

Post-run validation query (example):

```sql
select id, avatar, avatar_processing_status
from users
where avatar is not null
  and (avatar_processing_status is null or avatar_processing_status <> 'ready');
```

### Call signaling diagnostics
Set `CALL_DEBUG=true` in environment to emit structured signal sanitization logs:
- `call_id`
- `type`
- `signal_id`
- `raw_sdp_len`
- `sanitized_sdp_len`
- `ssrc_lines_removed_count`

### Call transport checklist (TURN + cache)
- Configure `VITE_WEBRTC_ICE_SERVERS` as JSON array of STUN/TURN servers in production.
- Include at least one TURN UDP/TCP relay with credentials for NAT-restricted users.
- Use a shared cache store (Redis recommended) for call state keys (`call:*`, `active_call_for_user:*`) in multi-instance deployments.
- Run `php artisan calls:expire-stale` to force-expire stale active sessions if sessions get stuck.
- Optional ring asset/env conventions for web clients:
  - `public/sounds/ringtone.mp3`, `public/sounds/ringback.mp3`
  - `VITE_CALL_RINGTONE_URL`, `VITE_CALL_RINGBACK_URL`, `VITE_CALL_RING_VOLUME`
| Realtime docs | Incomplete channel/event mapping | Exact channel/event/payload mapping |

No immediate breaking change policy:
- Existing clients can stay on `/v1.1`.
- New clients should start with `/v1.2`.
- Migration order: Auth -> Calls -> Feed/Users -> remaining domains.

## Coverage
`openapi.yaml` is the machine contract and includes:
- Auth
- Representative feed/user endpoints
- Story list/detail/create/view/reaction/delete endpoints
- Full call lifecycle + signaling endpoints
- Shared error schema

If any implementation differs from this file, update both `openapi.yaml` and this document in the same change.
