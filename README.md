# Digital Bank Ready Backend

Implementado com foco em segurança de nível banco digital:

- validação forte com Zod
- AppError + middleware global
- asyncHandler
- logger estruturado com pino
- access token + refresh token
- reset de senha por link ou senha temporária (1h)
- bloqueio de reutilização das últimas 3 senhas
- MFA por código enviado por email
- bloqueio após tentativas inválidas
- trilha de auditoria / eventos de segurança
- rate limiting

## Fluxo de login
1. `POST /auth/login`
2. Se credenciais OK, código MFA é enviado por email
3. `POST /auth/mfa/verify`
4. Recebe accessToken e refreshToken

## Reset de senha
- `POST /auth/reset/request` com `mode: "link"` ou `mode: "temp"`
- link e senha temporária expiram em 1 hora
- nova senha não pode repetir nenhuma das últimas 3

## Instalação
```bash
npm install
cp .env.example .env
npm run dev
```
