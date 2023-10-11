"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.Lexer = exports.Interpreter = void 0;
const interpreter_1 = __importDefault(require("./Interpreter/interpreter"));
exports.Interpreter = interpreter_1.default;
const lexer_1 = __importDefault(require("./Lexer/lexer"));
exports.Lexer = lexer_1.default;
const parser_1 = __importDefault(require("./Parser/parser"));
exports.Parser = parser_1.default;
