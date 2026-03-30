import { PasswordReset } from "./password-reset.model";

export class PasswordResetRepository {
  async create(data: { userId: string; token: string; expiresAt: Date }) {
    return PasswordReset.create(data);
  }

  async findByToken(token: string) {
    return PasswordReset.findOne({ where: { token } });
  }

  async deleteByToken(token: string) {
    await PasswordReset.destroy({ where: { token } });
  }

  async deleteByUserId(userId: string) {
    await PasswordReset.destroy({ where: { userId } });
  }
}
