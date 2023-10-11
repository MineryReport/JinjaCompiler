import Interpreter from "./Interpreter/interpreter";
import Lexer from "./Lexer/lexer";
import Parser from "./Parser/parser";

const example = `
esto es un texto y aqui quiero mostrar las facturas

`


function Run(text:string, fileName?: string) {
	const lexer = new Lexer(text, fileName)
	const tokens = lexer.makeTokens()
	if (tokens.error) {
		return {value: null, error: tokens.error}
	}
	const parser = new Parser(tokens.tokens)
	const parsed = parser.parse()

	if (parsed.error) {
		return {value: null, error: parsed.error}
	}

	const parsedValue = parsed.value

	const context = {
		None: null,
		False: false,
		True: true,
		Facturas: [{year: 2020, numero: 1}, {year: null, numero:2}, {year: 2023, numero: 1}]
	}
	const interpreter = new Interpreter(parsedValue, context)
	
	const result = interpreter.run()
	if (result.error) {
		return {value: null, error: result.error}
	}

	return {value: result.value, error: null}
}

const {value, error} = Run(example)

if (error) {
	console.log(error.toString())
} else {
	console.log(value);
}