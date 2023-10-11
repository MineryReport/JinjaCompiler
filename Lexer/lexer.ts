import Position from "./position"
import Token from "./token"
import { ExpectedCharError, IllegalCharError, JinjaError } from '../error';

export enum TokenType {
	TT_STRING = "STRING",
	TT_IDENTIFIER = "IDENTIFIER",
	TT_KEYWORD = "KEYWORD",
	TT_CODEBLOCK = "CODEBLOCK",
	TT_END_CODEBLOCK = "END_CODEBLOCK",
	TT_VARBLOCK = "VARBLOCK",
	TT_END_VARBLOCK = "END_VARBLOCK",
	TT_NEWLINE = "NEWLINE",
	TT_EOF = "EOF",
}

export enum Keywords {
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
class Lexer {
	fileName: string = ""
	text: string = ""
	pos: Position 
	currentChar: string | null = null

	/**
	 * Initializes the __Lexer__
	 * @param text Text to parse
	 * @param fileName A name identifying the source text
	 */
	constructor(text = '', fileName = '') {
		this.fileName = fileName
		this.text = text
		this.pos = new Position(-1, 0, -1, text, fileName)
		this.advance()
	}

	/**
	 * Move forwards the pointer in the text getting a new character from it.
	 */
	advance() {
		this.pos.advance(this.currentChar)
		this.currentChar = this.pos.index < this.text.length ? this.text[this.pos.index] : null
	}

	peek() {
		this.pos.advance(this.currentChar)
		let char = this.pos.index < this.text.length ? this.text[this.pos.index] : null
		this.pos.reverse(this.currentChar)
		return char

	}
	/**
	* Move back the pointer to _amount_ characters back.
	* @param [amount=1] - How many characters we want to go back @default 1
	*/
	reverse(amount = 1) {
		this.pos.reverse(this.currentChar, amount)
		this.currentChar = this.pos.index < this.text.length ? this.text[this.pos.index] : null
	}


	cleanWhitespace() {
		while(this.currentChar === " ") {
			this.advance()
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
				const nextChar = this.peek()
				if (nextChar === "{" || nextChar === "%") {
					this.reverse()
					break;
				}
			}
			string += this.currentChar;	
			this.advance();
		}
		this.advance();
		return new Token(TokenType.TT_STRING, string, posStart, this.pos);
	}

	makeIdentifier(indentation?:number) {
		let idString = ""
		let posStart = this.pos.copy()

		while (this.currentChar && /^[a-zA-Z0-9_.=]+$/.test(this.currentChar)) {
			idString += this.currentChar
			this.advance()
		}

		const AllTypes = Object.keys(Keywords).filter((item) => {
			return isNaN(Number(item));
		})


		let tokenType = AllTypes.includes(idString) ? TokenType.TT_KEYWORD : TokenType.TT_IDENTIFIER;

		return new Token(tokenType, idString, posStart, this.pos, indentation)
	}

	makeTokens(text?: string): {tokens: Token[], error: JinjaError | null} {
		if (text) {
			this.text = text
			this.pos = new Position(-1, 0, -1, text, this.fileName)
			this.advance()
		}

		let tokens: Token[] = []
		let inBlock = false
		let asCode = false
		let indentation = 0
		
		while (this.currentChar) {
			if (this.currentChar !== '{' && this.currentChar !== '}' && !asCode) {
				tokens.push(this.makeString())
			} else if (this.currentChar === '{') {
				this.advance()
				if (this.currentChar && (this.currentChar as string) === '%') {					
					tokens.push(new Token(TokenType.TT_CODEBLOCK, null, this.pos, undefined, indentation))
					indentation+=1
					asCode = true
					inBlock = true
					this.advance()					
				} else if (this.currentChar && (this.currentChar as string) === '{') {					
					tokens.push(new Token(TokenType.TT_VARBLOCK, null, this.pos, undefined, indentation))
					indentation+=1
					asCode = true
					inBlock = false
					this.advance()	
				} 
			} else if (this.currentChar === '%') {
				this.advance()
				if (this.currentChar && (this.currentChar as string) === '}') {					
					tokens.push(new Token(TokenType.TT_END_CODEBLOCK, null, this.pos, undefined, indentation))
					indentation-=1
					asCode = false
					this.advance()					
				} else {
					this.reverse()
					tokens.push(new Token(TokenType.TT_KEYWORD, "%", this.pos, undefined, indentation))
				}
			} else if (this.currentChar === '}') {
				this.advance()
				if (this.currentChar && (this.currentChar as string) === '}') {
					// for
					tokens.push(new Token(TokenType.TT_END_VARBLOCK, null, this.pos, undefined, indentation))
					indentation-=1
					asCode = false
					this.advance()					
				}
			} else if (this.currentChar as string === " " || this.currentChar as string === '\r') {	// TAB Or SPACE
				this.advance()
			} else if (/^[a-zA-Z0-9_=]+$/.test(this.currentChar) && asCode) {				// IDENTIFIER
				tokens.push(this.makeIdentifier(indentation));
			} else {
				let posStart = this.pos.copy();
				let char = this.currentChar;

				this.advance();

				if (asCode) {
					return {
						tokens: [],
						error: new IllegalCharError(posStart, this.pos, `Expected ${inBlock ? "%}" : "}}"} but '${char}' found`),
					};
				} else {
					return {
						tokens: [],
						error: new ExpectedCharError(posStart, this.pos, `'${char}'`),
					};
				}
			}
		}


		const eofPos = this.pos.copy()
		tokens.push(new Token(TokenType.TT_EOF, null, eofPos))

		return { tokens, error: null}
	}

}

export default Lexer