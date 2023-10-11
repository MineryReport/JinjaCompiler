"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = __importDefault(require("../Lexer/lexer"));
test("Parses strings", () => {
    const text = "esto es un texto";
    const lexer = new lexer_1.default(text);
    const result = lexer.makeTokens();
    expect(result.tokens.length).toBe(2); // String and EOF
    expect(result.tokens[0].type).toBe("STRING");
    expect(result.tokens[0].value).toBe(text);
    expect(result.tokens[1].type).toBe("EOF");
});
test("Parses strings with single { ", () => {
    const text = "esto es un {texto}";
    const lexer = new lexer_1.default(text);
    const result = lexer.makeTokens();
    expect(result.tokens.length).toBe(2); // String and EOF
    expect(result.tokens[0].type).toBe("STRING");
    expect(result.tokens[0].value).toBe(text);
    expect(result.tokens[1].type).toBe("EOF");
});
test("Parses strings until double { ", () => {
    const text = "esto es un {{texto}}";
    const lexer = new lexer_1.default(text);
    const result = lexer.makeTokens();
    expect(result.tokens.length).toBe(5); // String and EOF
    expect(result.tokens[0].type).toBe("STRING");
    expect(result.tokens[0].value).toBe("esto es un ");
    expect(result.tokens[1].type).toBe("VARBLOCK");
    expect(result.tokens[2].type).toBe("IDENTIFIER");
    expect(result.tokens[2].value).toBe("texto");
    expect(result.tokens[3].type).toBe("END_VARBLOCK");
    expect(result.tokens[4].type).toBe("EOF");
});
test("Parses strings until {% ", () => {
    const text = "esto es un {%texto%}";
    const lexer = new lexer_1.default(text);
    const result = lexer.makeTokens();
    expect(result.tokens.length).toBe(5); // String and EOF
    expect(result.tokens[0].type).toBe("STRING");
    expect(result.tokens[0].value).toBe("esto es un ");
    expect(result.tokens[1].type).toBe("CODEBLOCK");
    expect(result.tokens[2].type).toBe("IDENTIFIER");
    expect(result.tokens[2].value).toBe("texto");
    expect(result.tokens[3].type).toBe("END_CODEBLOCK");
    expect(result.tokens[4].type).toBe("EOF");
});
