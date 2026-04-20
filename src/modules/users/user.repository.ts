import { User } from "./user.model";

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
    name?: string;
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
      token_version: number;
    }>
  ) {
    const updateData: Record<string, unknown> = {
      ...data,
    };

    if (data.passwordHistory !== undefined) {
      updateData.password_history = data.passwordHistory;
      delete updateData.passwordHistory;
    }

    await User.update(updateData, { where: { id } });
  }

  async saveResetToken(userId: string, token: string, expires: Date) {
    return User.update(
      {
        reset_token: token,
        reset_token_expires: expires,
      },
      {
        where: { id: userId },
      }
    );
  }

async findByVerificationToken(token: string) {
  return User.findOne({ where: { emailVerificationToken: token } });
}

async update(userId: string, data: any) {
  return User.update(data, { where: { id: userId } });
}

  async findByResetToken(token: string) {
    return User.findOne({
      where: {
        reset_token: token,
      },
    });
  }

  async clearResetToken(userId: string) {
    return User.update(
      {
        reset_token: null,
        reset_token_expires: null,
      },
      {
        where: { id: userId },
      }
    );
  }
}
