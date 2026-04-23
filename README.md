# Digital Bank Ready Backend

Implemented with a focus on digital bank-level security:

- Strong validation with Zod
- AppError + global middleware
- asyncHandler
- Structured logging with Pino
- Access token + refresh token
- Password reset via link or temporary password (1h)
- Prevention of reusing the last 3 passwords
- MFA via email verification code
- Account lockout after invalid attempts
- Audit trail / security events
- Rate limiting

## Login Flow
1. `POST /auth/login`
2. If credentials are OK, MFA code is sent via email
3. `POST /auth/mfa/verify`
4. Receive accessToken and refreshToken

## Password Reset
- `POST /auth/reset/request` with `mode: "link"` or `mode: "temp"`
- Link and temporary password expire in 1 hour
- New password cannot reuse any of the last 3 passwords

## Installation
```bash
npm install
cp .env.example .env
npm run dev
