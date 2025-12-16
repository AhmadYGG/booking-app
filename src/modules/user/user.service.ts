import { PositionRepository } from "../position/position.repository";
import { CreateUserDTO, UpdateUserDTO } from "./user.dto";
import { UserRepository } from "./user.repository";

export class UserService {
	constructor(
		private userRepo: UserRepository,
		private positionRepo: PositionRepository,
	) {}

	async getALl(page: number, limit: number) {
		const users = await this.userRepo.find(page, limit);
		return users;
	}

	async getByID(id: number) {
		const user = await this.userRepo.findByID(id);
		return user;
	}

	async getByUsername(username: string) {
		const user = await this.userRepo.findByUsername(username);
		return user;
	}

	async create(data: CreateUserDTO) {
		const position = await this.positionRepo.findById(data.positionID);

		if (position.length === 0) {
			throw new Error("Position ID not found");
		}

		const user = await this.userRepo.save(data);
		return user;
	}

	async update(id: number, data: UpdateUserDTO) {
		return await this.userRepo.update(id, data);
	}

	async delete(id: number) {
		return await this.userRepo.delete(id);
	}

	async getTotalEmployees() {
		return await this.userRepo.countEmployees();
	}

	async getAbsentEmployeesToday() {
		return await this.userRepo.findUsersNotPresentToday();
	}
}
