import { Application } from "./application.model";

export class ApplicationService {
    async create(data: any, userId: string) {
        return Application.create({ ...data, userId });
    }

    async findAll(userId: string) {
        return Application.findAll({ where: { userId } });
    }

    async update(id: string, data: any) {
        return Application.update(data, { where: { id } } );
    }

    async delete(id: string) {
        return Application.destroy({ where: { id } });
    }
}