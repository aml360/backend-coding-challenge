import { Module } from "@nestjs/common";
import { CalculusController } from "./calculus.controller";
import { CalculusService } from "./calculus.service";

@Module({
	imports: [],
	controllers: [CalculusController],
	providers: [CalculusService],
})
export class AppModule {}
