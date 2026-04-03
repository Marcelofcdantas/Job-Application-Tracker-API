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

  async archive(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const id = String(req.params.id);

    await this.service.archive(userId, id);

    return res.json({ message: "Archived" });
  }

  async getArchived(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const apps = await this.service.getArchived(userId);

    return res.json(apps);
  }

  async restore(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const id = String(req.params.id);

    await this.service.restore(userId, id);

    return res.json({ message: "Restored" });
  }

  async update(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const id = String(req.params.id);
    const app = await this.service.update(userId, id, req.body);
    return res.json(app);
  }

  async getById(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const id = String(req.params.id);

    const app = await this.service.getById(userId, id);

    return res.json(app);
  }

  async delete(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const id = String(req.params.id);
    await this.service.delete(userId, id);
    return res.json({ message: "Deleted" });
  }
}