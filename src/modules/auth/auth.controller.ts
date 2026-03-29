import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const service = new AuthService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await service.register(email, password);

            res.status(201).json(user);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(400).json({ error: "Unknown error" });
            }
        }
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        const data = await service.login(email, password);

        res.json(data);
    }
}