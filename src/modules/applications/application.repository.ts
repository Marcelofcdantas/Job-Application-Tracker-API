import db from "../../models/index.js";

export class ApplicationRepository {
  create(data: any) {
    return db.Application.create(data);
  }

  findAllByUser(userId: string) {
    return db.Application.findAll({ where: { userId } });
  }

  update(userId: string, id: string, data: any) {
    return db.Application.update(data, {
      where: { id, userId },
    });
  }

  delete(userId: string, id: string) {
    return db.Application.destroy({
      where: { id, userId },
    });
  }
}