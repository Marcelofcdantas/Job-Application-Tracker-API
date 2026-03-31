import { ApplicationRepository } from "./application.repository";

export class ApplicationService {
  private repo = new ApplicationRepository();

  create(userId: string, data: any) {
    return this.repo.create({ ...data, userId });
  }

  getAll(userId: string) {
    return this.repo.findAllByUser(userId);
  }

  update(userId: string, id: string, data: any) {
    return this.repo.update(userId, id, data);
  }

  delete(userId: string, id: string) {
    return this.repo.delete(userId, id);
  }
}