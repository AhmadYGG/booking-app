import { ServiceRepository } from "./service.repository";
import { CreateServiceDTO, UpdateServiceDTO } from "./service.dto";

export class ServiceService {
    constructor(private serviceRepository: ServiceRepository) { }

    async getAll(page: number, limit: number) {
        return await this.serviceRepository.find(page, limit);
    }

    async getByID(id: number) {
        return await this.serviceRepository.findByID(id);
    }

    async create(data: CreateServiceDTO) {
        const insertData = {
            serviceName: data.serviceName,
            durationMinutes: data.durationMinutes,
            price: data.price.toString(), // Support decimal as string in insertion
            description: data.description,
            isActive: data.isActive ?? true,
        };
        return await this.serviceRepository.create(insertData as any);
    }

    async update(id: number, data: UpdateServiceDTO) {
        const updateData: any = { ...data };
        if (data.price !== undefined) {
            updateData.price = data.price.toString();
        }
        return await this.serviceRepository.update(id, updateData);
    }

    async delete(id: number) {
        return await this.serviceRepository.delete(id);
    }

    async updateStatus(id: number, isActive: boolean) {
        return await this.serviceRepository.updateStatus(id, isActive);
    }
}
