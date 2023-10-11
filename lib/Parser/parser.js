"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../Ast/node");
const lexer_1 = require("../Lexer/lexer");
const token_1 = __importDefault(require("../Lexer/token"));
const error_1 = require("../error");
const Result_1 = __importDefault(require("./Result"));
function printToken(token, ...extra) {
    console.log(Object.assign({ token: {
            type: token.type,
            value: token.value,
            indent: token.indent
        } }, extra));
}
class Parser {
    constructor(tokens) {
        this.tokens = [];
        this.tokenIndex = -1;
        this.currentToken = new token_1.default(lexer_1.TokenType.TT_EOF, null);
        this.tokens = tokens;
        this.tokenIndex = -1;
        this.advance();
    }
    advance() {
        this.tokenIndex += 1;
        this.updateCurrentToken();
        return this.currentToken;
    }
    reverse(amount = 1) {
        this.tokenIndex -= amount;
        this.updateCurrentToken();
        return this.currentToken;
    }
    updateCurrentToken() {
        if (this.tokenIndex >= 0 && this.tokenIndex < this.tokens.length) {
            this.currentToken = this.tokens[this.tokenIndex];
        }
    }
    parse() {
        var _a;
        let res = this.statements();
        res.registerAdvancement();
        this.advance();
        if (!res.error && ((_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.type) !== lexer_1.TokenType.TT_EOF) {
            return res.failure(new error_1.InvalidSyntaxError(this.currentToken.posStart, this.currentToken.posEnd, `Unexpected token "${this.currentToken.value}"`));
        }
        return res;
    }
    statements(indent = 0) {
        var _a, _b, _c;
        let res = new Result_1.default();
        let statements = [];
        let posStart = (_b = (_a = this.currentToken) === null || _a === void 0 ? void 0 : _a.posStart) === null || _b === void 0 ? void 0 : _b.copy();
        while (((_c = this.currentToken) === null || _c === void 0 ? void 0 : _c.type) === lexer_1.TokenType.TT_STRING) {
            statements.push(new node_1.StringNode(this.currentToken, this.currentToken.value));
            res.registerAdvancement();
            this.advance();
        }
        if (this.currentToken.type === lexer_1.TokenType.TT_EOF) {
            return res.success(new node_1.ListNode(statements, posStart, this.currentToken.posEnd.copy()));
        }
        if (this.currentToken.indent !== indent) {
            return res.success(statements);
        }
        let expr = res.from(this.expr());
        if (res.error)
            return res;
        if (!expr) {
            printToken(this.currentToken);
        }
        statements.push(expr);
        while (true) {
            while (this.currentToken.type === lexer_1.TokenType.TT_STRING) {
                statements.push(new node_1.StringNode(this.currentToken, this.currentToken.value));
                res.registerAdvancement();
                this.advance();
            }
            if (this.currentToken.type === lexer_1.TokenType.TT_EOF) {
                break;
            }
            if ([lexer_1.TokenType.TT_KEYWORD, lexer_1.TokenType.TT_END_CODEBLOCK, lexer_1.TokenType.TT_END_VARBLOCK].includes(this.currentToken.type)) {
                break;
            }
            expr = res.tryFrom(this.expr());
            if (res.error) {
                return res;
            }
            if (!expr) {
                this.reverse(res.toReverseCount);
            }
            else {
                statements.push(expr);
            }
        }
        if (statements.length > 0) {
            return res.success(new node_1.ListNode(statements, posStart, this.currentToken.posEnd.copy()));
        }
        return res.success(new node_1.ListNode(statements, posStart, this.currentToken.posEnd.copy()));
    }
    expr() {
        let res = new Result_1.default();
        if (this.currentToken.type === lexer_1.TokenType.TT_CODEBLOCK) {
            const block = res.from(this.blockExpr());
            if (res.error)
                return res;
            return res.success(block);
        }
        if (this.currentToken.type === lexer_1.TokenType.TT_VARBLOCK) {
            const varBlock = res.from(this.varExpr());
            if (res.error)
                return res;
            return res.success(varBlock);
        }
        return res.failure(new error_1.InvalidSyntaxError(this.currentToken.posStart, this.currentToken.posEnd, "Expected variable declaration"));
    }
    blockExpr() {
        let res = new Result_1.default();
        let indent;
        res.registerAdvancement();
        this.advance();
        indent = this.currentToken.indent;
        if (this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "for")) {
            res.registerAdvancement();
            this.advance();
            const fromFor = res.from(this.for());
            if (res.error)
                return res;
            return res.success(fromFor);
        }
        if (this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "if")) {
            res.registerAdvancement();
            this.advance();
            const ifExpr = res.from(this.ifExpr());
            if (res.error)
                return res;
            return res.success(ifExpr);
        }
        return res.failure(new error_1.InvalidSyntaxError(this.currentToken.posStart, this.currentToken.posEnd, `Expected any of the allowed block expressions: 'for', 'if', found ${this.currentToken.value}`));
    }
    varExpr() {
        let res = new Result_1.default();
        let indent;
        res.registerAdvancement();
        this.advance();
        indent = this.currentToken.indent;
        if (this.currentToken.type === lexer_1.TokenType.TT_IDENTIFIER) {
            const token = this.currentToken;
            res.registerAdvancement();
            this.advance();
            if (this.currentToken.type !== lexer_1.TokenType.TT_END_VARBLOCK) {
                return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '}}'"));
            }
            res.registerAdvancement();
            this.advance();
            return res.success(new node_1.VarAccessNode(token.value, token));
        }
        return res.failure(new error_1.InvalidSyntaxError(this.currentToken.posStart, this.currentToken.posEnd, "Expected variable access"));
    }
    for() {
        let res = new Result_1.default();
        let indent;
        if (this.currentToken.type !== lexer_1.TokenType.TT_IDENTIFIER) {
            return res.failure(new error_1.InvalidSyntaxError(this.currentToken.posStart, this.currentToken.posEnd, "Expected identifier"));
        }
        const iter = this.currentToken;
        res.registerAdvancement();
        this.advance();
        if (!this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "in")) {
            return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected 'in' keyword"));
        }
        res.registerAdvancement();
        this.advance();
        if (this.currentToken.type !== lexer_1.TokenType.TT_IDENTIFIER) {
            return res.failure(new error_1.InvalidSyntaxError(this.currentToken.posStart, this.currentToken.posEnd, "Expected identifier"));
        }
        const list = this.currentToken;
        indent = this.currentToken.indent;
        res.registerAdvancement();
        this.advance();
        if (this.currentToken.type !== lexer_1.TokenType.TT_END_CODEBLOCK) {
            return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '%}'"));
        }
        res.registerAdvancement();
        this.advance();
        const body = res.from(this.forBlockExpr());
        if (res.error)
            return res;
        if (this.currentToken.type !== lexer_1.TokenType.TT_CODEBLOCK) {
            return res.failure(new error_1.MissingLoopCloseTagError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '{%'"));
        }
        res.registerAdvancement();
        this.advance();
        if (!this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "endfor")) {
            return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected endfor"));
        }
        res.registerAdvancement();
        this.advance();
        if (this.currentToken.type !== lexer_1.TokenType.TT_END_CODEBLOCK) {
            return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '%}'"));
        }
        res.registerAdvancement();
        this.advance();
        return res.success(new node_1.ForNode(list, iter, body));
    }
    forBlockExpr() {
        let res = new Result_1.default();
        let statements = [];
        while (true) {
            if (this.currentToken.type === lexer_1.TokenType.TT_STRING) {
                statements.push(new node_1.StringNode("text", this.currentToken.value));
                res.registerAdvancement();
                this.advance();
            }
            else if (this.currentToken.type === lexer_1.TokenType.TT_VARBLOCK) {
                const varBlock = res.from(this.varExpr());
                if (res.error) {
                    return res;
                }
                statements.push(varBlock);
                res.registerAdvancement();
                this.advance();
            }
            else if (this.currentToken.type === lexer_1.TokenType.TT_CODEBLOCK) {
                let tmp = this.tokens[this.tokenIndex + 1];
                if (tmp.matches(lexer_1.TokenType.TT_KEYWORD, "endfor")) {
                    console.log({ statements });
                    return res.success(statements);
                }
                let result = res.from(this.blockExpr());
                if (res.error)
                    return res;
                if (result)
                    statements.push(result);
            }
            else if (this.currentToken.type === lexer_1.TokenType.TT_END_CODEBLOCK) {
                break;
            }
            else if (this.currentToken.type === lexer_1.TokenType.TT_EOF) {
                break;
            }
            else {
                return res.failure(new error_1.InvalidSyntaxError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '%}', or Text or Var access"));
            }
        }
        return res.success(statements);
    }
    ifExpr() {
        let res = new Result_1.default();
        let negated = false;
        let negatedToken = null;
        if (this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "not")) {
            negated = true;
            negatedToken = this.currentToken;
            res.registerAdvancement();
            this.advance();
        }
        if (this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "True") || this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "False")) {
            const expr = this.currentToken;
            res.registerAdvancement();
            this.advance();
            if (this.currentToken.type !== lexer_1.TokenType.TT_END_CODEBLOCK) {
                return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '%}'"));
            }
            res.registerAdvancement();
            this.advance();
            const body = res.from(this.statements());
            if (res.error)
                return res;
            if (!this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "endif")) {
                return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected 'endif'"));
            }
            res.registerAdvancement();
            this.advance();
            if (this.currentToken.type !== lexer_1.TokenType.TT_END_CODEBLOCK) {
                return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '%}'"));
            }
            res.registerAdvancement();
            this.advance();
            if (negated) {
                return res.success(new node_1.IfBoolNode(new node_1.UnaryOpNode(negatedToken, new node_1.VarAccessNode(expr.value, expr)), body));
            }
            return res.success(new node_1.IfBoolNode(new node_1.VarAccessNode(expr.value, expr), body));
        }
        else if (this.currentToken.type !== lexer_1.TokenType.TT_IDENTIFIER) {
            return res.failure(new error_1.InvalidSyntaxError(this.currentToken.posStart, this.currentToken.posEnd, "Expected expression"));
        }
        let varToken = this.currentToken;
        res.registerAdvancement();
        this.advance();
        let operand;
        if (this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "is") || this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "==")) {
            operand = this.currentToken;
        }
        res.registerAdvancement();
        this.advance();
        if (this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "not")) {
            negated = true;
            negatedToken = this.currentToken;
            res.registerAdvancement();
            this.advance();
        }
        let target = this.currentToken;
        res.registerAdvancement();
        this.advance();
        if (this.currentToken.type !== lexer_1.TokenType.TT_END_CODEBLOCK) {
            return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '%}'"));
        }
        res.registerAdvancement();
        this.advance();
        const body = res.from(this.statements());
        if (res.error)
            return res;
        if (!this.currentToken.matches(lexer_1.TokenType.TT_KEYWORD, "endif")) {
            return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected 'endif'"));
        }
        res.registerAdvancement();
        this.advance();
        if (this.currentToken.type !== lexer_1.TokenType.TT_END_CODEBLOCK) {
            return res.failure(new error_1.ExpectedCharError(this.currentToken.posStart, this.currentToken.posEnd, "Expected '%}'"));
        }
        res.registerAdvancement();
        this.advance();
        if (negated) {
            return res.success(new node_1.IfNode(new node_1.UnaryOpNode(negatedToken, new node_1.BinaryOpNode(new node_1.VarAccessNode(varToken.value, varToken), operand, new node_1.VarAccessNode(target.value, target))), body));
        }
        return res.success(new node_1.IfNode(new node_1.BinaryOpNode(new node_1.VarAccessNode(varToken.value, varToken), operand, new node_1.VarAccessNode(target.value, target)), body));
    }
}
exports.default = Parser;
