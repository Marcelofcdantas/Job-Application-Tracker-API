import { Request, Response } from "express";
import { ApplicationService } from "./application.service";

export class ApplicationController {
  private service = new ApplicationService();

  async create(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const app = await this.service.create(userId, req.body);
    return res.json(app);
  }

  async getAll(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const apps = await this.service.getAll(userId);
    return res.json(apps);
  }

  async update(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const id = String(req.params.id);
    const app = await this.service.update(userId, id, req.body);
    return res.json(app);
  }

  async delete(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const id = String(req.params.id);
    await this.service.delete(userId, id);
    return res.json({ message: "Deleted" });
  }
}