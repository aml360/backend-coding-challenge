import { Injectable } from "@nestjs/common";
import LRU from "lru-cache";
import { CalculusDTO, HistoryError, HistoryResult } from "./DTO/calculus.dto";

@Injectable()
export class CalculusService {
	#cache = new LRU<string, number>({ ttl: 1000 * 60 * 60, max: 1000 });

	#history: CalculusDTO.History["data"] = [];

	evaluateExpression(expression: string): number /* | Error? */ {
		const cacheHit = this.#cache.get(expression);
		if (!!cacheHit) {
			return cacheHit;
		}
		const tokens = Lexer.tokenize(expression);
		const ast = Parser.parse(tokens);
		const result = Evaluator.eval(ast);
		this.#cache.set(expression, result);
		return result;
	}

	getHistory(): CalculusDTO.History["data"] {
		return this.#history;
	}

	addToHistory(data: HistoryError | HistoryResult): void {
		this.#history.push(data);
	}
}

// Below this line all code is only intended for internal use

// I use tsc as reference for some types.
// https://github.com/microsoft/TypeScript/blob/main/src/compiler/types.ts#L21
export const enum SyntaxKind {
	NumericLiteral = "NumericLiteral",
	Minus = "Minus",
	Plus = "Plus",
	Multiply = "Multiply",
	Divide = "Divide",
	LeftParenthesis = "LeftParenthesis",
	RightParenthesis = "RightParenthesis",
	EOF = "EOF",
	WhiteSpace = "WhiteSpace",
}

export type Token =
	| {
			type: Exclude<SyntaxKind, SyntaxKind.EOF>;
			value: string;
	  }
	| { type: SyntaxKind.EOF };

type Matcher = { type: SyntaxKind; regex: RegExp };

/**
 * @internal Do not use this class directly. Use the `CalcusService` instead.
 */
export class Lexer {
	// https://stackoverflow.com/questions/51139881/visual-code-fold-comments <-- Regions hack for VSCode
	private static matchers: Array<Matcher> = [
		//Number (e.g. 2, 23)
		{ type: SyntaxKind.NumericLiteral, regex: /\d+/ },
		//#region Operators
		//Plus
		{ type: SyntaxKind.Plus, regex: /\+/ },
		//Minus
		{ type: SyntaxKind.Minus, regex: /\-/ },
		//Multiplication
		{ type: SyntaxKind.Multiply, regex: /\*/ },
		//Division
		{ type: SyntaxKind.Divide, regex: /\// },
		//#endregion
		//#region Parenthesis
		//Left parenthesis
		{ type: SyntaxKind.LeftParenthesis, regex: /\(/ },
		//Right parenthesis
		//#endregion
		{ type: SyntaxKind.RightParenthesis, regex: /\)/ },
		{ type: SyntaxKind.WhiteSpace, regex: /\s+/ },
	];

	/**
	 *
	 * @param input
	 * @returns An array of tokens, removes all whitespace tokens.
	 */
	static tokenize(input: string): Array<Token> {
		const tokens: Array<Token> = [];
		let slicedInput = input;

		while (true) {
			const token = this.getNextToken(slicedInput);
			//Skip whitespace
			if (token.type === SyntaxKind.WhiteSpace) {
				slicedInput = slicedInput.slice(token.value.length);
				continue;
			}
			tokens.push(token);
			//Break under EOF
			if (token.type === SyntaxKind.EOF) {
				break;
			}
			slicedInput = slicedInput.substring(token.value.length);
		}
		return tokens;
	}

	/**
	 *
	 * @param input The input string for returning the next token, does not modify the input string.
	 * @throws Error if the input string doesn't have a valid token.
	 * @returns the next token
	 */
	static getNextToken(input: string): Token {
		if (input.length === 0) {
			return { type: SyntaxKind.EOF };
		}
		let match: null | { matchResult: RegExpMatchArray; matcher: Matcher } = null;
		{
			for (const matcher of this.matchers) {
				const matchResult = input.match(matcher.regex);
				if (!!matchResult && matchResult.index === 0) {
					match = { matcher, matchResult };
					break;
				}
			}
		}
		if (!match) {
			throw new Error(`Unexpected token "${input[0]}"`);
		}
		return {
			type: match.matcher.type,
			value: match.matchResult[0]!,
		};
	}
}

//#region Expressions
export abstract class Expression {
	abstract eval(): number;
}

export class BinaryExpression extends Expression {
	constructor(public left: Expression, public right: Expression, public operator: SyntaxKind) {
		super();
	}

	eval(): number {
		switch (this.operator) {
			case SyntaxKind.Plus:
				return this.left.eval() + this.right.eval();
			case SyntaxKind.Minus:
				return this.left.eval() - this.right.eval();
			case SyntaxKind.Multiply:
				return this.left.eval() * this.right.eval();
			case SyntaxKind.Divide:
				return this.left.eval() / this.right.eval();
			default:
				throw new Error(`Unexpected operator "${this.operator}"`);
		}
	}
}

export class UnaryExpression extends Expression {
	constructor(public operand: Expression, public operator: SyntaxKind) {
		super();
	}

	eval(): number {
		switch (this.operator) {
			case SyntaxKind.Minus:
				return -this.operand.eval();
			case SyntaxKind.Plus:
				return +this.operand.eval();
			default:
				throw new Error(`Unexpected operator "${this.operator}"`);
		}
	}
}

export class NumericLiteralExpression extends Expression {
	constructor(public value: number) {
		super();
	}
	eval(): number {
		return this.value;
	}
}

export class ParenthesizedExpression extends Expression {
	constructor(public innerExpression: Expression) {
		super();
	}
	eval(): number {
		return this.innerExpression.eval();
	}
}

export type ExpressionT =
	| BinaryExpression
	| NumericLiteralExpression
	| UnaryExpression
	| ParenthesizedExpression;
//#endregion

// Used this videos https://youtu.be/bxpc9Pp5pZM, https://youtu.be/T4J3BPy__CU, https://youtu.be/SToUyjAsaFk, and this https://en.wikipedia.org/wiki/Recursive_descent_parser
export class Parser {
	static parse(tokens: Token[]): ExpressionT {
		const expression = this.parseExpression(tokens);
		if (expression === null) {
			throw new Error("Unexpected end of input");
		}
		return expression;
	}

	static parseExpression(tokens: Token[]): ExpressionT | null {
		let expression = this.parseTerm(tokens);
		if (expression === null) {
			return null;
		}
		while (true) {
			const operator = tokens[0]!;
			if (operator.type !== SyntaxKind.Plus && operator.type !== SyntaxKind.Minus) {
				break;
			}
			tokens.shift();
			const right = this.parseTerm(tokens);
			if (right === null) {
				throw new Error("Unexpected end of input");
			}
			expression = new BinaryExpression(expression, right, operator.type);
		}
		return expression;
	}

	static parseTerm(tokens: Token[]): ExpressionT | null {
		let expression = this.parseFactor(tokens);
		if (expression === null) {
			return null;
		}
		while (true) {
			const operator = tokens[0]!;
			if (operator.type !== SyntaxKind.Multiply && operator.type !== SyntaxKind.Divide) {
				break;
			}
			tokens.shift();
			const right = this.parseFactor(tokens);
			if (right === null) {
				throw new Error("Unexpected end of input");
			}
			expression = new BinaryExpression(expression, right, operator.type);
		}
		return expression;
	}

	static parseFactor(tokens: Token[]): ExpressionT | null {
		const token = tokens.shift();
		if (token === undefined) {
			return null;
		}
		switch (token.type) {
			case SyntaxKind.Plus:
				return new UnaryExpression(this.parseFactor(tokens)!, token.type);
			case SyntaxKind.Minus:
				return new UnaryExpression(this.parseFactor(tokens)!, token.type);
			case SyntaxKind.NumericLiteral:
				return new NumericLiteralExpression(parseFloat(token.value));
			case SyntaxKind.LeftParenthesis:
				const expression = this.parseExpression(tokens);
				if (expression === null) {
					throw new Error("Unexpected end of input");
				}
				const rightParenthesis = tokens.shift();
				if (
					rightParenthesis === undefined ||
					rightParenthesis.type !== SyntaxKind.RightParenthesis
				) {
					throw new Error("Expected right parenthesis");
				}
				return new ParenthesizedExpression(expression);
			default:
				throw new Error(
					`Unexpected token "${(token as Exclude<Token, { type: SyntaxKind.EOF }>).value}"`,
				);
		}
	}
}

export class Evaluator {
	static eval(expression: Expression): number {
		return expression.eval();
	}
}
