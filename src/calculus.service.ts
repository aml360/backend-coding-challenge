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

// TODO: Check if this is the best way to do it
enum SyntaxKind {
	NumericLiteral = "NumericLiteral",
	Minus = "Minus",
	Plus = "Plus",
	Multiply = "Multiply",
	Divide = "Divide",
	LeftParenthesis = "LeftParenthesis",
	RightParenthesis = "RightParenthesis",
	Whitespace = "Whitespace",
	EOL = "EOL",
}

type Token =
	| {
			type: Omit<SyntaxKind, "Number">;
	  }
	| {
			type: SyntaxKind.NumericLiteral;
			value: number;
	  };

/**
 * @internal Do not use this class directly. Use the `CalcusService` instead.
 */
export class Lexer {
	// https://stackoverflow.com/questions/51139881/visual-code-fold-comments <-- Regions hack for VSCode
	private static matchers: Array<{ matcherType: SyntaxKind; matcher: RegExp }> = [
		//Number (e.g. 2, 23)
		{ matcherType: SyntaxKind.NumericLiteral, matcher: /\d+/ },
		//#region Operators
		//Plus
		{ matcherType: SyntaxKind.Plus, matcher: /\+/ },
		//Minus
		{ matcherType: SyntaxKind.Minus, matcher: /\-/ },
		//Multiplication
		{ matcherType: SyntaxKind.Multiply, matcher: /\*/ },
		//Division
		{ matcherType: SyntaxKind.Divide, matcher: /\// },
		//#endregion
		//#region Parenthesis
		//Left parenthesis
		{ matcherType: SyntaxKind.LeftParenthesis, matcher: /\(/ },
		//Right parenthesis
		//#endregion
		{ matcherType: SyntaxKind.RightParenthesis, matcher: /\)/ },
		//Whitespace (e.g. " ", "  ", "   ")
		{ matcherType: SyntaxKind.Whitespace, matcher: /\s+/ },
		//EOL regex
		{ matcherType: SyntaxKind.Whitespace, matcher: /\n/ },
	];

	static tokenize(input: string): Array<Token> {
		//TODO: Implement
		throw new Error("Not implemented");
	}

	static getNextToken(input: string): Token {
		//TODO: Implement
		throw new Error("Not implemented");
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
