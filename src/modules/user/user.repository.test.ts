import { test, describe } from "bun:test";
import { db } from "../../database/connection";
import { UserRepository } from "./user.repository";

describe("user repository", () => {
	const repo = new UserRepository(db);

	test.concurrent("get all attendances", async () => {
		const data = await repo.find(1, 10);
		console.log(data);
	});
});
