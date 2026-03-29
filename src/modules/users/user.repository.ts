import { User } from "./user.model.js";

export class UserRepository {
  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async findById(id: string) {
    return User.findByPk(id);
  }

  async create(data: {
    email: string;
    password: string;
    passwordHistory: string[];
  }) {
    return User.create(data);
  }

  async updateSecurityState(
    id: string,
    data: Partial<{
      password: string;
      mustChangePassword: boolean;
      temporaryPasswordExpiresAt: Date | null;
      passwordHistory: string[];
      failedLoginAttempts: number;
      lockedUntil: Date | null;
      mfaCodeHash: string | null;
      mfaCodeExpiresAt: Date | null;
    }>
  ) {
    await User.update(data, { where: { id } });
  }
}
