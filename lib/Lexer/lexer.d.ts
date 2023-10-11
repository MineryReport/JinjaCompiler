import Position from "./position";
import Token from "./token";
import { JinjaError } from '../error';
export declare enum TokenType {
    TT_STRING = "STRING",
    TT_IDENTIFIER = "IDENTIFIER",
    TT_KEYWORD = "KEYWORD",
    TT_CODEBLOCK = "CODEBLOCK",
    TT_END_CODEBLOCK = "END_CODEBLOCK",
    TT_VARBLOCK = "VARBLOCK",
    TT_END_VARBLOCK = "END_VARBLOCK",
    TT_NEWLINE = "NEWLINE",
    TT_EOF = "EOF"
}
export declare enum Keywords {
    for = "for",
    endfor = "endfor",
    endif = "endif",
    in = "in",
    is = "is",
    "==" = "==",
    if = "if",
    not = "not",
    True = "True",
    False = "False"
}
/**
 * ## Summary.
 *
 * Class for parsing a text extracting every token
 */
declare class Lexer {
    fileName: string;
    text: string;
    pos: Position;
    currentChar: string | null;
    /**
     * Initializes the __Lexer__
     * @param text Text to parse
     * @param fileName A name identifying the source text
     */
    constructor(text?: string, fileName?: string);
    /**
     * Move forwards the pointer in the text getting a new character from it.
     */
    advance(): void;
    peek(): string | null;
    /**
    * Move back the pointer to _amount_ characters back.
    * @param [amount=1] - How many characters we want to go back @default 1
    */
    reverse(amount?: number): void;
    cleanWhitespace(): void;
    /**
     * If the text begins with `` " `` create a string {@link Token} from there until a closing `` " `` is found
     * @returns {Token}
     */
    makeString(): Token;
    makeIdentifier(indentation?: number): Token;
    makeTokens(text?: string): {
        tokens: Token[];
        error: JinjaError | null;
    };
}
export default Lexer;
