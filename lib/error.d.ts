import Position from "./Lexer/position";
export declare class JinjaError {
    error_name: string;
    details: string;
    posStart: Position;
    posEnd: Position;
    constructor(posStart: Position, posEnd: Position, error_name: string, details: string);
    toString(): string;
}
export declare class IllegalCharError extends JinjaError {
    constructor(posStart: Position, posEnd: Position, details: string);
}
export declare class InvalidSyntaxError extends JinjaError {
    constructor(posStart: Position, posEnd: Position, details: string);
}
export declare class ExpectedCharError extends JinjaError {
    constructor(posStart: Position, posEnd: Position, details: string);
}
export declare class MissingLoopCloseTagError extends JinjaError {
    constructor(posStart: Position, posEnd: Position, details: string);
}
export declare class MissingIfCloseTagError extends JinjaError {
    constructor(posStart: Position, posEnd: Position, details: string);
}
export declare class ExecUnkownNodeTypeError extends JinjaError {
    constructor(posStart: Position, posEnd: Position, details: string);
}
export declare class ExecUnkownVariableError extends JinjaError {
    constructor(posStart: Position, posEnd: Position, details: string);
}
export declare class ExecUnkownPropertyError extends JinjaError {
    constructor(posStart: Position, posEnd: Position, details: string);
}
