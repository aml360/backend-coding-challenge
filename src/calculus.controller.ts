import {
	Controller,
	Get,
	InternalServerErrorException,
	Query,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { CalculusService } from "./calculus.service";
import { CalculusDTO } from "./DTO/calculus.dto";

// Endpoints
// GET /calculus?query=[input]
// GET /calculus/history

@Controller("calculus")
export class CalculusController {
	constructor(private readonly calculusSv: CalculusService) {}

	@Get()
	@UsePipes(
		new ValidationPipe({ transform: true, transformOptions: { excludeExtraneousValues: true } }),
	)
	getCalculus(
		@Query("query")
		queryB64: string | undefined,
	): CalculusDTO.Result | CalculusDTO.Error {
		if (!queryB64) {
			return { error: true, message: "No query provided" };
		}
		const query = Buffer.from(queryB64, "base64").toString("utf8");
		// Error handling with try-catch or rust style Result type?
		try {
			const result = this.calculusSv.evaluateExpression(query);
			this.calculusSv.addToHistory(
				plainToInstance(
					CalculusDTO.HistoryResult,
					{
						result,
						query,
						timestamp: new Date(),
					} /* satisfies CalculusDTO.HistoryResult (ts 4.9+)*/,
				),
			);
			return { error: false, result };
		} catch (error) {
			if (error instanceof Error) {
				this.calculusSv.addToHistory(
					plainToInstance(
						CalculusDTO.HistoryError,
						{
							message: error.message,
							query,
							timestamp: new Date(),
						} /* satisfies CalculusDTO.HistoryError (ts 4.9+)*/,
					),
				);
				return { error: true, message: error.message };
			}
			console.error("CalculusSv threw an error that is not an instance of Error, error:", error);
			throw new InternalServerErrorException("Unknown error");
		}
	}

	@Get("history")
	getHistory(): CalculusDTO.History {
		return { data: this.calculusSv.getHistory() };
	}
}
