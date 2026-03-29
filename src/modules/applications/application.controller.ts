import { Request, Response } from "express";
import { ApplicationService } from "./application.service.js";

const service = new ApplicationService();

export class ApplicationController {
    async create(req: Request, res: Response) {
        const userId = (req as any).user.id;

        const app = await service.create(req.body, userId);

        res.json(app);
    }

    async findAll(req: Request, res: Response) {
        const userId = (req as any).user.id;

        const apps = await service.findAll(userId);

        res.json(apps);
    }
}