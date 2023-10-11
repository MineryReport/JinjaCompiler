import Token from "../Lexer/token";
import { JinjaError } from "../error";
import Result from "./Result";
declare class Parser {
    tokens: Token[];
    tokenIndex: number;
    currentToken: Token;
    constructor(tokens: Token[]);
    advance(): Token;
    reverse(amount?: number): Token;
    updateCurrentToken(): void;
    parse(): Result<any, JinjaError>;
    statements(indent?: number): Result<any, JinjaError>;
    expr(): Result<any, JinjaError>;
    blockExpr(): Result<any, JinjaError>;
    varExpr(): Result<any, JinjaError>;
    for(): Result<any, JinjaError>;
    forBlockExpr(): Result<any, JinjaError>;
    ifExpr(): Result<any, JinjaError>;
}
export default Parser;
