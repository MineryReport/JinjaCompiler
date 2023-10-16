import { ForNode, IfBoolNode, IfNode, ListNode, StringNode, VarAccessNode, VarAssignNode, UnaryOpNode, BinaryOpNode, IdentifierNode } from '../Ast/node';
import { TokenType } from "../Lexer/lexer";
import Token from "../Lexer/token";
import { ExpectedCharError, InvalidSyntaxError, JinjaError, MissingIfCloseTagError, MissingLoopCloseTagError } from "../error";
import Result from "./Result";

function printToken(token: Token, ...extra: any) {
	console.log({
		token: {
			type: token.type,
			value: token.value,
			indent: token.indent
		},
		...extra
	})
}

class Parser {
	tokens: Token[] = []
	tokenIndex = -1
	currentToken: Token = new Token(TokenType.TT_EOF, null)

	constructor(tokens: Token[]) {
		this.tokens = tokens

		this.tokenIndex = -1
		this.advance()
	}

	advance() {
		this.tokenIndex += 1
		this.updateCurrentToken()
		return this.currentToken
	}

	reverse(amount = 1) {
		this.tokenIndex -= amount
		this.updateCurrentToken()
		return this.currentToken
	}

	updateCurrentToken() {
		if (this.tokenIndex >= 0 && this.tokenIndex < this.tokens.length) {
			this.currentToken = this.tokens[this.tokenIndex]
		}
	}

	parse() {
		let res = this.statements()
		res.registerAdvancement()
		this.advance()
		if (!res.error && this.currentToken?.type !== TokenType.TT_EOF) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentToken.posStart!,
					this.currentToken.posEnd!,
					`Unexpected token "${this.currentToken.value}"`
				)
			)
		}

		return res
	}

	statements(indent = 0) {

		let res = new Result<any, JinjaError>()
		let statements: any[] = []
		let posStart = this.currentToken?.posStart?.copy()

		while (this.currentToken?.type === TokenType.TT_STRING) {
			statements.push(new StringNode(this.currentToken, this.currentToken.value));
			res.registerAdvancement()
			this.advance()
		}

		if (this.currentToken.type === TokenType.TT_EOF) {
			return res.success(
				new ListNode(statements, posStart!, this.currentToken.posEnd?.copy() ?? this.currentToken.posStart!.copy()) 
			)
		}


		if (this.currentToken.indent !== indent) {
			return res.success(statements)
		}

		let expr = res.from(this.expr());

		if (res.error) return res;
		if (!expr) {
			printToken(this.currentToken)
		}
		statements.push(expr);

		while (true) {
			while (this.currentToken.type as TokenType === TokenType.TT_STRING) {
				statements.push(new StringNode(this.currentToken, this.currentToken.value));
				res.registerAdvancement()
				this.advance()
			}


			if (this.currentToken.type as TokenType === TokenType.TT_EOF) {
				break
			}

			if ([TokenType.TT_KEYWORD, TokenType.TT_END_CODEBLOCK, TokenType.TT_END_VARBLOCK].includes(this.currentToken.type as TokenType)) {
				break
			}

			expr = res.tryFrom(this.expr());
			if (res.error) {
				return res
			}
			if (!expr) {
				this.reverse(res.toReverseCount);
			} else {
				statements.push(expr);
			}
		}

		if (statements.length > 0) {
			return res.success(
				new ListNode(statements, posStart!, this.currentToken.posEnd?.copy() ?? this.currentToken.posStart!.copy()) 
			)
		}

		return res.success(
			new ListNode(statements, posStart!, this.currentToken.posEnd?.copy() ?? this.currentToken.posStart!.copy()) 
		)

	}

	expr() {
		let res = new Result<any, JinjaError>()

		if (this.currentToken.type === TokenType.TT_CODEBLOCK) {
			const block = res.from(this.blockExpr())

			if (res.error) return res
			return res.success(block)
		}
		if (this.currentToken.type === TokenType.TT_VARBLOCK) {
			const varBlock = res.from(this.varExpr())
			if (res.error) return res
			return res.success(varBlock)
		}


		return res.failure(
			new InvalidSyntaxError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected variable declaration")
		)
	}

	blockExpr() {
		let res = new Result<any, JinjaError>()
		let indent;

		res.registerAdvancement()
		this.advance()
		indent = this.currentToken.indent

		if (this.currentToken.matches(TokenType.TT_KEYWORD, "for")) {
			res.registerAdvancement()
			this.advance()
			const fromFor = res.from(this.for())
			if (res.error) return res
			return res.success(fromFor)
		}
		if (this.currentToken.matches(TokenType.TT_KEYWORD, "if")) {
			res.registerAdvancement()
			this.advance()
			const ifExpr = res.from(this.ifExpr())

			if (res.error) return res
			return res.success(ifExpr)
		}


		return res.failure(
			new InvalidSyntaxError(this.currentToken.posStart!, this.currentToken.posEnd!, `Expected any of the allowed block expressions: 'for', 'if', found ${this.currentToken.value}`)
		)
	}

	varExpr() {
		let res = new Result<any, JinjaError>()
		let indent;

		res.registerAdvancement()
		this.advance()

		indent = this.currentToken.indent

		if (this.currentToken.type === TokenType.TT_IDENTIFIER) {
			const token = this.currentToken
			res.registerAdvancement()
			this.advance()

			if (this.currentToken.type as TokenType !== TokenType.TT_END_VARBLOCK) {
				return res.failure(new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '}}'"))
			}
			res.registerAdvancement()
			this.advance()
			return res.success(new VarAccessNode(token.value, token))
		}

		return res.failure(
			new InvalidSyntaxError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected variable access")
		)
	}


	for() {
		let res = new Result<any, JinjaError>()
		let indent

		if (this.currentToken.type !== TokenType.TT_IDENTIFIER) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentToken.posStart!,
					this.currentToken.posEnd!,
					"Expected identifier"
				)
			)
		}

		const iter = this.currentToken

		res.registerAdvancement()
		this.advance()

		if (!this.currentToken.matches(TokenType.TT_KEYWORD, "in")) {
			return res.failure(
				new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected 'in' keyword")
			)
		}
		res.registerAdvancement()
		this.advance()

		if (this.currentToken.type !== TokenType.TT_IDENTIFIER) {
			return res.failure(
				new InvalidSyntaxError(
					this.currentToken.posStart!,
					this.currentToken.posEnd!,
					"Expected identifier"
				)
			)
		}
		const list = this.currentToken

		indent = this.currentToken.indent
		res.registerAdvancement()
		this.advance()


		if (this.currentToken.type as TokenType !== TokenType.TT_END_CODEBLOCK) {
			return res.failure(
				new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '%}'")
			)
		}

		res.registerAdvancement()
		this.advance()

		const body = res.from(this.forBlockExpr())
		if (res.error) return res;


		if (this.currentToken.type as TokenType !== TokenType.TT_CODEBLOCK) {
			return res.failure(new MissingLoopCloseTagError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '{%'"))
		}

		res.registerAdvancement()
		this.advance()


		if (!this.currentToken.matches(TokenType.TT_KEYWORD, "endfor")) {
			return res.failure(new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected endfor"))
		}

		res.registerAdvancement()
		this.advance()

		if (this.currentToken.type as TokenType !== TokenType.TT_END_CODEBLOCK) {
			return res.failure(new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '%}'"))
		}

		res.registerAdvancement()
		this.advance()

		return res.success(new ForNode(list, iter, body))
	}

	forBlockExpr() {
		let res = new Result<any, JinjaError>()
		let statements = []

		while (true) {
			if (this.currentToken.type as TokenType === TokenType.TT_STRING) {
				statements.push(new StringNode("text", this.currentToken.value));
				res.registerAdvancement()
				this.advance()
			} else if (this.currentToken.type as TokenType === TokenType.TT_VARBLOCK) {
				const varBlock = res.from(this.varExpr())
				if (res.error) {
					return res
				}
				statements.push(varBlock)
				res.registerAdvancement()
				this.advance()
			} else if (this.currentToken.type as TokenType === TokenType.TT_CODEBLOCK) {
				let tmp = this.tokens[this.tokenIndex + 1]

				if (tmp.matches(TokenType.TT_KEYWORD, "endfor")) {
					return res.success(statements)
				}

				let result = res.from(this.blockExpr())

				if (res.error) return res

				if (result)
					statements.push(result)

			} else if (this.currentToken.type as TokenType === TokenType.TT_END_CODEBLOCK) {
				break
			} else if (this.currentToken.type === TokenType.TT_EOF) {
				break
			} else {
				return res.failure(new InvalidSyntaxError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '%}', or Text or Var access"))
			}
		}
		return res.success(statements)
	}

	ifExpr() {
		let res = new Result<any, JinjaError>()
		let negated = false
		let negatedToken = null

		if (this.currentToken.matches(TokenType.TT_KEYWORD, "not")) {
			negated = true
			negatedToken = this.currentToken
			res.registerAdvancement()
			this.advance()
		}

		if (this.currentToken.matches(TokenType.TT_KEYWORD, "True") || this.currentToken.matches(TokenType.TT_KEYWORD, "False")) {
			const expr = this.currentToken
			res.registerAdvancement()
			this.advance()

			if (this.currentToken.type !== TokenType.TT_END_CODEBLOCK) {
				return res.failure(
					new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '%}'")
				)
			}
			res.registerAdvancement()
			this.advance()
			const body = res.from(this.statements())

			if (res.error) return res

			if (!this.currentToken.matches(TokenType.TT_KEYWORD, "endif")) {
				return res.failure(new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected 'endif'"))
			}
			res.registerAdvancement()
			this.advance()

			if (this.currentToken.type as TokenType !== TokenType.TT_END_CODEBLOCK) {
				return res.failure(new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '%}'"))
			}
			res.registerAdvancement()
			this.advance()

			if (negated) {				
				return res.success(
					new IfBoolNode(new UnaryOpNode(
						negatedToken, new VarAccessNode(expr.value, expr)), body))

			}

			return res.success(new IfBoolNode( new VarAccessNode(expr.value, expr), body))
		} else if (this.currentToken.type !== TokenType.TT_IDENTIFIER) {
			return res.failure(
				new InvalidSyntaxError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected expression")
			)
		}

		let varToken = this.currentToken

		res.registerAdvancement()
		this.advance()

		let operand

		if (this.currentToken.matches(TokenType.TT_KEYWORD, "is") || this.currentToken.matches(TokenType.TT_KEYWORD, "==")) {
			operand = this.currentToken
		}

		res.registerAdvancement()
		this.advance()

		if (this.currentToken.matches(TokenType.TT_KEYWORD, "not")) {
			negated = true
			negatedToken = this.currentToken
			res.registerAdvancement()
			this.advance()
		}


		let target = this.currentToken

		res.registerAdvancement()
		this.advance()


		if (this.currentToken.type as TokenType !== TokenType.TT_END_CODEBLOCK) {
			return res.failure(
				new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '%}'")
			)
		}
		res.registerAdvancement()
		this.advance()


		const body = res.from(this.statements())

		if (res.error) return res

		if (!this.currentToken.matches(TokenType.TT_KEYWORD, "endif")) {
			return res.failure(new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected 'endif'"))
		}
		res.registerAdvancement()
		this.advance()

		if (this.currentToken.type as TokenType !== TokenType.TT_END_CODEBLOCK) {
			return res.failure(new ExpectedCharError(this.currentToken.posStart!, this.currentToken.posEnd!, "Expected '%}'"))
		}
		res.registerAdvancement()
		this.advance()

		if (negated) {
			return res.success(
				new IfNode(
					new UnaryOpNode(negatedToken,
						new BinaryOpNode(
							new VarAccessNode(varToken.value, varToken),
							operand,
							new VarAccessNode(target.value, target)
						)
					),
					body
				)
			)
		}
		return res.success(new IfNode(new BinaryOpNode(new VarAccessNode(varToken.value, varToken), operand, new VarAccessNode(target.value, target)), body))
	}
}

export default Parser