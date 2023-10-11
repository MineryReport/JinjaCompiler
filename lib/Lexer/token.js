"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Token {
    /**
     *
     * @param {TokenType} type - The token type
     * @param value - The inner value of the token
     * @param posStart - The position where the token starts in the source text
     * @param posEnd  - The position where the token ends in the source text
     */
    constructor(type, value, posStart, posEnd, indentation) {
        var _a, _b;
        this.type = null;
        this.value = null;
        this.posStart = null;
        this.posEnd = null;
        this.indent = 0;
        this.type = type;
        this.value = value;
        let posEndVal = null;
        if (posEnd) {
            posEndVal = posEnd;
        }
        else if (posStart) {
            posEndVal = posStart.copy().advance();
        }
        this.posStart = (_a = posStart === null || posStart === void 0 ? void 0 : posStart.copy()) !== null && _a !== void 0 ? _a : null;
        this.posEnd = posEndVal;
        this.indent = (_b = indentation !== null && indentation !== void 0 ? indentation : posStart === null || posStart === void 0 ? void 0 : posStart.indentation) !== null && _b !== void 0 ? _b : 0;
    }
    /**
     * A method for converting the token to a string
     */
    toString() {
        if (this.value)
            return `${this.type}:${this.value}`;
        return this.type;
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
    matches(type, val) {
        return this.type === type && this.value === val;
    }
}
exports.default = Token;
