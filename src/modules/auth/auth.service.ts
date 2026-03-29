import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../users/user.model.js";


function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email)) {
    throw new Error("Invalid email format");
  }
}

function validatePassword(password: string) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!regex.test(password)) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    );
  }
}

export class AuthService {
  async register(email: string, password: string) {
    validateEmail(email);
    validatePassword(password);

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
    });

    const { password: _, ...userSafe } = user.toJSON();
    return userSafe;
  }

    async login(email: string, password: string) {
        const user = await User.findOne({ where: {email} });

        if (!user) throw new Error("Invalid credentials");

        const match = await bcrypt.compare(password, user.password);

        if (!match) throw new Error("Invalid credentials");

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        );

        return { token };
    }
}