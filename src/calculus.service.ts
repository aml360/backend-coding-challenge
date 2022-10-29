import { Injectable } from "@nestjs/common";
import { CalculusDTO } from "./DTO/calculus.dto";

@Injectable()
export class CalculusService {
	// TODO: Use a library to do this? https://www.npmjs.com/package/lru-cache
	#cache: Map<string, number> = new Map();

	#history: CalculusDTO.History["data"] = [];

	evaluateExpression(expression: string): number /* | Error? */ {
		// TODO: Error handling here?
		const tokens = Lexer.tokenize(expression);
		const ast = Parser.parse(tokens);
		const result = Evaluator.eval(ast);
		return result;
	}
}

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

type AST = null /* TBD */;
type Expression = null /* TBD */;
type UnaryExpression = null /* TBD */;
type BinaryExpression = null /* TBD */;
type ASTNode = null /* TBD */;

export class Parser {
	static parse(input: Token[]): AST {
		//TODO: Implement
		throw new Error("Not implemented");
	}
}
export class Evaluator {
	static eval(ast: AST): number {
		//TODO: Implement
		throw new Error("Not implemented");
	}
}
