import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	// TODO: Add e2e tests
	it("/ (GET)", () => {
		const queryB64 = Buffer.from("2 * (23/(3*3))- 23 * (2*3)").toString("base64");
		const result = 2 * (23 / (3 * 3)) - 23 * (2 * 3);
		return request(app.getHttpServer())
			.get("/calculus")
			.query({ query: queryB64 })
			.expect(200)
			.expect("Hello World!");
	});
});
