import { ApplicationRepository } from "./application.repository";

export class ApplicationService {
  private repo = new ApplicationRepository();

  create(userId: string, data: any) {
    const today = new Date().toISOString().split("T")[0];

    return this.repo.create({
      ...data,
      appliedDate: data.appliedDate || today,
      userId,
    });
  }

  getAll(userId: string) {
    return this.repo.findAllByUser(userId);
  }

  update(userId: string, id: string, data: any) {
    const today = new Date().toISOString().split("T")[0];

    return this.repo.update(userId, id, {
      ...data,
      appliedDate: data.appliedDate || today,
    });
  }

  delete(userId: string, id: string) {
    return this.repo.delete(userId, id);
  }
}