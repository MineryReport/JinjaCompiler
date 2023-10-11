"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interpreter_1 = __importDefault(require("./Interpreter/interpreter"));
const lexer_1 = __importDefault(require("./Lexer/lexer"));
const parser_1 = __importDefault(require("./Parser/parser"));
const example = `
esto es un texto y aqui quiero mostrar las facturas

`;
function Run(text, fileName) {
    const lexer = new lexer_1.default(text, fileName);
    const tokens = lexer.makeTokens();
    if (tokens.error) {
        return { value: null, error: tokens.error };
    }
    const parser = new parser_1.default(tokens.tokens);
    const parsed = parser.parse();
    if (parsed.error) {
        return { value: null, error: parsed.error };
    }
    const parsedValue = parsed.value;
    const context = {
        None: null,
        False: false,
        True: true,
        Facturas: [{ year: 2020, numero: 1 }, { year: null, numero: 2 }, { year: 2023, numero: 1 }]
    };
    const interpreter = new interpreter_1.default(parsedValue, context);
    const result = interpreter.run();
    if (result.error) {
        return { value: null, error: result.error };
    }
    return { value: result.value, error: null };
}
const { value, error } = Run(example);
if (error) {
    console.log(error.toString());
}
else {
    console.log(value);
}
