import { TokenType } from './lexer';
import Position from './position';
declare class Token {
    type: TokenType | null;
    value: string | null;
    posStart: Position | null;
    posEnd: Position | null;
    indent: number;
    /**
     *
     * @param {TokenType} type - The token type
     * @param value - The inner value of the token
     * @param posStart - The position where the token starts in the source text
     * @param posEnd  - The position where the token ends in the source text
     */
    constructor(type: TokenType, value: string | null, posStart?: Position, posEnd?: Position, indentation?: number);
    /**
     * A method for converting the token to a string
     */
    toString(): string | null;
    /**
     * Checks if the token matches the provided type and value
     * @example
     *
     * const forToken = Token(TYPES.TT_KEYWORD, value: "for", posStart, posEnd);
     *
     * forToken.matches(TYPES.TT_KEYWORD, "for") // true
     * forToken.matches(TYPES.TT_KEYWORD, "in") // false
     * forToken.matches(TYPES.TT_INT, 1) // false
     *
     *
     * @param type - The token type to check
     * @param val - The value to check
     * @returns {boolean}
     */
    matches(type: TokenType, val: string): boolean;
}
export default Token;
