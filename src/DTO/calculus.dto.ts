import { Expose, Type } from "class-transformer";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class Result {
	@Expose()
	@IsBoolean({ message: "ResultDTO.error must be a boolean" })
	error!: false;

	@Expose()
	@IsNumber()
	result!: number;
}

export class Error {
	@Expose()
	@IsBoolean({ message: "ErrorDTO.error must be a boolean" })
	error!: true;

	@Expose()
	@IsString({ message: "ErrorDTO.message must be a string" })
	message!: string;
}

export class HistoryResult {
	@Expose()
	readonly __type = "historyResult";

	@Expose()
	@IsNumber()
	result!: number;

	@Expose()
	@IsString({ message: "HistoryResultDTO.query must be a string" })
	query!: string;

	@Expose()
	@Type(() => Date)
	@IsDate()
	timestamp!: Date;
}

export class HistoryError {
	@Expose()
	readonly __type = "historyError";

	@Expose()
	@IsString({ message: "HistoryErrorDTO.message must be a string" })
	message!: string;

	@Expose()
	@IsString({ message: "HistoryErrorDTO.query must be a string" })
	query!: string;

	@Expose()
	@Type(() => Date)
	@IsDate()
	timestamp!: Date;
}

export class History {
	@Expose()
	data!: Array<HistoryResult | HistoryError>;
}

export * as CalculusDTO from "./calculus.dto"; //<-- I use this way to namespace modules instead typescript namespaces because this way is tree-shakable, ecmascript way to do it.
