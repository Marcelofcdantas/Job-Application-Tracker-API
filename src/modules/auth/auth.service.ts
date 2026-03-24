import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../users/user.model";

export class AuthService {
    async register(email: string, password: string) {
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashed,
        });

        return user;
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