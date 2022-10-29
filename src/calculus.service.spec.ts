//Define tests with jest for the calculus service, especially the lexer, parser and evaluator

import {
	BinaryExpression,
	CalculusService,
	Evaluator,
	Lexer,
	NumericLiteralExpression,
	Parser,
	SyntaxKind,
	Token,
} from "./calculus.service";

describe("Calculus service", () => {
	let calcSv: CalculusService;

	beforeEach(async () => {
		calcSv = new CalculusService();
	});

	describe("Lexer", () => {
		describe("Numbers parsing", () => {
			it("2", () => {
				const result = Lexer.tokenize("2");
				const expected: Token[] = [
					{ type: SyntaxKind.NumericLiteral, value: "2" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});

			it("23", () => {
				const result = Lexer.tokenize("23");
				const expected: Token[] = [
					{ type: SyntaxKind.NumericLiteral, value: "23" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});
		});

		describe("Operators parsing", () => {
			it("+", () => {
				const result = Lexer.tokenize("+");
				const expected: Token[] = [{ type: SyntaxKind.Plus, value: "+" }, { type: SyntaxKind.EOF }];
				expect(result).toStrictEqual(expected);
			});

			it("-", () => {
				const result = Lexer.tokenize("-");
				const expected: Token[] = [
					{ type: SyntaxKind.Minus, value: "-" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});

			it("*", () => {
				const result = Lexer.tokenize("*");
				const expected: Token[] = [
					{ type: SyntaxKind.Multiply, value: "*" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});

			it("/", () => {
				const result = Lexer.tokenize("/");
				const expected: Token[] = [
					{ type: SyntaxKind.Divide, value: "/" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});
		});

		describe("Parenthesis parsing", () => {
			it("(", () => {
				const result = Lexer.tokenize("(");
				const expected: Token[] = [
					{ type: SyntaxKind.LeftParenthesis, value: "(" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});

			it(")", () => {
				const result = Lexer.tokenize(")");
				const expected: Token[] = [
					{ type: SyntaxKind.RightParenthesis, value: ")" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});
		});

		describe("Complex expressions parsing", () => {
			it("2+3", () => {
				const result = Lexer.tokenize("2+3");
				const expected: Token[] = [
					{ type: SyntaxKind.NumericLiteral, value: "2" },
					{ type: SyntaxKind.Plus, value: "+" },
					{ type: SyntaxKind.NumericLiteral, value: "3" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});
			it("2+3*4", () => {
				const result = Lexer.tokenize("2+3*4");
				const expected: Token[] = [
					{ type: SyntaxKind.NumericLiteral, value: "2" },
					{ type: SyntaxKind.Plus, value: "+" },
					{ type: SyntaxKind.NumericLiteral, value: "3" },
					{ type: SyntaxKind.Multiply, value: "*" },
					{ type: SyntaxKind.NumericLiteral, value: "4" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});
			it("(-2 +3)*5 /2", () => {
				const result = Lexer.tokenize("(-2 +3)*5 /2");
				const expected: Token[] = [
					{ type: SyntaxKind.LeftParenthesis, value: "(" },
					{ type: SyntaxKind.Minus, value: "-" },
					{ type: SyntaxKind.NumericLiteral, value: "2" },
					{ type: SyntaxKind.Plus, value: "+" },
					{ type: SyntaxKind.NumericLiteral, value: "3" },
					{ type: SyntaxKind.RightParenthesis, value: ")" },
					{ type: SyntaxKind.Multiply, value: "*" },
					{ type: SyntaxKind.NumericLiteral, value: "5" },
					{ type: SyntaxKind.Divide, value: "/" },
					{ type: SyntaxKind.NumericLiteral, value: "2" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});

			it("   2 + 3* ((4 + -5))", () => {
				const result = Lexer.tokenize("   2 + 3* ((4 + -5))");
				const expected: Token[] = [
					{ type: SyntaxKind.NumericLiteral, value: "2" },
					{ type: SyntaxKind.Plus, value: "+" },
					{ type: SyntaxKind.NumericLiteral, value: "3" },
					{ type: SyntaxKind.Multiply, value: "*" },
					{ type: SyntaxKind.LeftParenthesis, value: "(" },
					{ type: SyntaxKind.LeftParenthesis, value: "(" },
					{ type: SyntaxKind.NumericLiteral, value: "4" },
					{ type: SyntaxKind.Plus, value: "+" },
					{ type: SyntaxKind.Minus, value: "-" },
					{ type: SyntaxKind.NumericLiteral, value: "5" },
					{ type: SyntaxKind.RightParenthesis, value: ")" },
					{ type: SyntaxKind.RightParenthesis, value: ")" },
					{ type: SyntaxKind.EOF },
				];
				expect(result).toStrictEqual(expected);
			});
		});
	});

	describe("Parser", () => {
		describe("Simple expressions parsing", () => {
			it("2", () => {
				// TODO: Refactor this without using the Lexer
				const result = Parser.parse(Lexer.tokenize("2"));
				expect(result).toBeInstanceOf(NumericLiteralExpression);
				expect((result as NumericLiteralExpression).value).toBe(2);
			});
			it("2+3", () => {
				// TODO: Refactor this without using the Lexer
				const result = Parser.parse(Lexer.tokenize("2+3"));
				expect(result).toBeInstanceOf(BinaryExpression);
				const resultBin = result as BinaryExpression;
				expect(resultBin.left).toBeInstanceOf(NumericLiteralExpression);
				expect((resultBin.left as NumericLiteralExpression).value).toBe(2);
				expect(resultBin.right).toBeInstanceOf(NumericLiteralExpression);
				expect((resultBin.right as NumericLiteralExpression).value).toBe(3);
				expect(resultBin.operator).toBe(SyntaxKind.Plus);
			});
		});
	});

	describe("Evaluator", () => {
		// TODO: Same as parser tests, we depend on lexer and parser here
		it("2", () => {
			const result = Evaluator.eval(Parser.parse(Lexer.tokenize("2")));
			expect(result).toBe(2);
		});
		it("2+3", () => {
			const result = Evaluator.eval(Parser.parse(Lexer.tokenize("2+3")));
			expect(result).toBe(5);
		});
		it("2+3*4", () => {
			const result = Evaluator.eval(Parser.parse(Lexer.tokenize("2+3*4")));
			expect(result).toBe(14);
		});
		it("(-2 +3)*5 /2", () => {
			const result = Evaluator.eval(Parser.parse(Lexer.tokenize("(-2 +3)*5 /2")));
			console.log(result);

			expect(result).toBe(2.5);
		});
		it("   2 + 3* ((4 + -5))", () => {
			const result = Evaluator.eval(Parser.parse(Lexer.tokenize("   2 + 3* ((4 + -5))")));
			expect(result).toBe(-1);
		});
	});
});
