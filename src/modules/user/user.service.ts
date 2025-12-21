import { CreateUserDTO, UpdateUserDTO } from "./user.dto";
import { UserRepository } from "./user.repository";

export class UserService {
	constructor(
		private userRepo: UserRepository,
	) {}

	async getALl(page: number, limit: number) {
		const users = await this.userRepo.find(page, limit);
		return users;
	}

	async getByID(id: number) {
		const user = await this.userRepo.findByID(id);
		return user;
	}

	async getByEmail(email: string) {
		const user = await this.userRepo.findByEmail(email);
		return user;
	}

	async create(data: CreateUserDTO) {
		const user = await this.userRepo.save(data);
		return user;
	}

	async update(id: number, data: UpdateUserDTO) {
		return await this.userRepo.update(id, data as any);
	}

	async delete(id: number) {
		return await this.userRepo.delete(id);
	}
}
