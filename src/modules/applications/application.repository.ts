import db from "../../models/index";

export class ApplicationRepository {
  create(data: any) {
    return db.Application.create(data);
  }

  findAllByUser(userId: string) {
    return db.Application.findAll({ where: { userId, archived: false } });
  }

  findArchivedByUser(userId: string) {
    return db.Application.findAll({
      where: { userId, archived: true },
    });
  }

  archive(userId: string, id: string) {
    return db.Application.update(
      { archived: true },
      { where: { id, userId } }
    );
  }

  findById(userId: string, id: string) {
    return db.Application.findOne({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, data: any) {
    const [updatedRows] = await db.Application.update(data, {
      where: { id, userId },
    });

    if (updatedRows === 0) {
      throw new Error("Application not found or not updated");
    }

    return db.Application.findOne({
      where: { id, userId },
    });
  }

  delete(userId: string, id: string) {
    return db.Application.destroy({
      where: { id, userId },
    });
  }
}