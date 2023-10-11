"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keywords = exports.TokenType = void 0;
const position_1 = __importDefault(require("./position"));
const token_1 = __importDefault(require("./token"));
const error_1 = require("../error");
var TokenType;
(function (TokenType) {
    TokenType["TT_STRING"] = "STRING";
    TokenType["TT_IDENTIFIER"] = "IDENTIFIER";
    TokenType["TT_KEYWORD"] = "KEYWORD";
    TokenType["TT_CODEBLOCK"] = "CODEBLOCK";
    TokenType["TT_END_CODEBLOCK"] = "END_CODEBLOCK";
    TokenType["TT_VARBLOCK"] = "VARBLOCK";
    TokenType["TT_END_VARBLOCK"] = "END_VARBLOCK";
    TokenType["TT_NEWLINE"] = "NEWLINE";
    TokenType["TT_EOF"] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
var Keywords;
(function (Keywords) {
    Keywords["for"] = "for";
    Keywords["endfor"] = "endfor";
    Keywords["endif"] = "endif";
    Keywords["in"] = "in";
    Keywords["is"] = "is";
    Keywords["=="] = "==";
    Keywords["if"] = "if";
    Keywords["not"] = "not";
    Keywords["True"] = "True";
    Keywords["False"] = "False";
})(Keywords || (exports.Keywords = Keywords = {}));
/**
 * ## Summary.
 *
 * Class for parsing a text extracting every token
 */
class Lexer {
    /**
     * Initializes the __Lexer__
     * @param text Text to parse
     * @param fileName A name identifying the source text
     */
    constructor(text = '', fileName = '') {
        this.fileName = "";
        this.text = "";
        this.currentChar = null;
        this.fileName = fileName;
        this.text = text;
        this.pos = new position_1.default(-1, 0, -1, text, fileName);
        this.advance();
    }
    /**
     * Move forwards the pointer in the text getting a new character from it.
     */
    advance() {
        this.pos.advance(this.currentChar);
        this.currentChar = this.pos.index < this.text.length ? this.text[this.pos.index] : null;
    }
    peek() {
        this.pos.advance(this.currentChar);
        let char = this.pos.index < this.text.length ? this.text[this.pos.index] : null;
        this.pos.reverse(this.currentChar);
        return char;
    }
    /**
    * Move back the pointer to _amount_ characters back.
    * @param [amount=1] - How many characters we want to go back @default 1
    */
    reverse(amount = 1) {
        this.pos.reverse(this.currentChar, amount);
        this.currentChar = this.pos.index < this.text.length ? this.text[this.pos.index] : null;
    }
    cleanWhitespace() {
        while (this.currentChar === " ") {
            this.advance();
        }
    }
    /**
     * If the text begins with `` " `` create a string {@link Token} from there until a closing `` " `` is found
     * @returns {Token}
     */
    makeString() {
        let string = "";
        let posStart = this.pos.copy();
        while (this.currentChar) {
            if (this.currentChar === "{") {
                const nextChar = this.peek();
                if (nextChar === "{" || nextChar === "%") {
                    this.reverse();
                    break;
                }
            }
            string += this.currentChar;
            this.advance();
        }
        this.advance();
        return new token_1.default(TokenType.TT_STRING, string, posStart, this.pos);
    }
    makeIdentifier(indentation) {
        let idString = "";
        let posStart = this.pos.copy();
        while (this.currentChar && /^[a-zA-Z0-9_.=]+$/.test(this.currentChar)) {
            idString += this.currentChar;
            this.advance();
        }
        const AllTypes = Object.keys(Keywords).filter((item) => {
            return isNaN(Number(item));
        });
        let tokenType = AllTypes.includes(idString) ? TokenType.TT_KEYWORD : TokenType.TT_IDENTIFIER;
        return new token_1.default(tokenType, idString, posStart, this.pos, indentation);
    }
    makeTokens(text) {
        if (text) {
            this.text = text;
            this.pos = new position_1.default(-1, 0, -1, text, this.fileName);
            this.advance();
        }
        let tokens = [];
        let inBlock = false;
        let asCode = false;
        let indentation = 0;
        while (this.currentChar) {
            if (this.currentChar !== '{' && this.currentChar !== '}' && !asCode) {
                tokens.push(this.makeString());
            }
            else if (this.currentChar === '{') {
                this.advance();
                if (this.currentChar && this.currentChar === '%') {
                    tokens.push(new token_1.default(TokenType.TT_CODEBLOCK, null, this.pos, undefined, indentation));
                    indentation += 1;
                    asCode = true;
                    inBlock = true;
                    this.advance();
                }
                else if (this.currentChar && this.currentChar === '{') {
                    tokens.push(new token_1.default(TokenType.TT_VARBLOCK, null, this.pos, undefined, indentation));
                    indentation += 1;
                    asCode = true;
                    inBlock = false;
                    this.advance();
                }
            }
            else if (this.currentChar === '%') {
                this.advance();
                if (this.currentChar && this.currentChar === '}') {
                    tokens.push(new token_1.default(TokenType.TT_END_CODEBLOCK, null, this.pos, undefined, indentation));
                    indentation -= 1;
                    asCode = false;
                    this.advance();
                }
                else {
                    this.reverse();
                    tokens.push(new token_1.default(TokenType.TT_KEYWORD, "%", this.pos, undefined, indentation));
                }
            }
            else if (this.currentChar === '}') {
                this.advance();
                if (this.currentChar && this.currentChar === '}') {
                    // for
                    tokens.push(new token_1.default(TokenType.TT_END_VARBLOCK, null, this.pos, undefined, indentation));
                    indentation -= 1;
                    asCode = false;
                    this.advance();
                }
            }
            else if (this.currentChar === " " || this.currentChar === '\r') { // TAB Or SPACE
                this.advance();
            }
            else if (/^[a-zA-Z0-9_=]+$/.test(this.currentChar) && asCode) { // IDENTIFIER
                tokens.push(this.makeIdentifier(indentation));
            }
            else {
                let posStart = this.pos.copy();
                let char = this.currentChar;
                this.advance();
                if (asCode) {
                    return {
                        tokens: [],
                        error: new error_1.IllegalCharError(posStart, this.pos, `Expected ${inBlock ? "%}" : "}}"} but '${char}' found`),
                    };
                }
                else {
                    return {
                        tokens: [],
                        error: new error_1.ExpectedCharError(posStart, this.pos, `'${char}'`),
                    };
                }
            }
        }
        const eofPos = this.pos.copy();
        tokens.push(new token_1.default(TokenType.TT_EOF, null, eofPos));
        return { tokens, error: null };
    }
}
exports.default = Lexer;
