
import { TokenType } from './lexer'
import Position from './position'



class Token {
	type: TokenType|null = null
	value: string|null = null
	posStart: Position | null = null
	posEnd: Position | null = null 
	indent = 0

	/**
	 * 
	 * @param {TokenType} type - The token type
	 * @param value - The inner value of the token
	 * @param posStart - The position where the token starts in the source text
	 * @param posEnd  - The position where the token ends in the source text
	 */
	constructor(type: TokenType, value: string | null, posStart?: Position, posEnd?: Position, indentation?: number) {
		this.type = type
		this.value = value

		let posEndVal = null
		if (posEnd) {
			posEndVal = posEnd
		} else if (posStart) {
			posEndVal = posStart.copy().advance()
		}

		this.posStart = posStart?.copy() ?? null
		this.posEnd = posEndVal
		this.indent = indentation ?? posStart?.indentation ?? 0
	}
	/**
	 * A method for converting the token to a string 
	 */
	toString() {
		if (this.value) return `${this.type}:${this.value}`
		return this.type
	}

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
	matches(type: TokenType, val: string) {
		return this.type === type && this.value === val
	}
}

export default Token