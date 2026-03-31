import { Op } from "sequelize";
import { PasswordReset } from "./password-reset.model";

export class PasswordResetRepository {
  async create(data: { userId: string; token: string; expiresAt: Date }) {
    return PasswordReset.create(data);
  }

  async findByToken(token: string) {
    return PasswordReset.findOne({ where: { token } });
  }

  async findRecentByUserId(userId: string) {
    return PasswordReset.findOne({
      where: {
        userId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
      order: [["createdAt", "DESC"]],
    });
  }

  async deleteByToken(token: string) {
    await PasswordReset.destroy({ where: { token } });
  }

  async deleteByUserId(userId: string) {
    await PasswordReset.destroy({ where: { userId } });
  }
}
