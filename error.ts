import Position from "./Lexer/position";

const stringWithArrows = (text: string, posStart: Position, details: string) => {
	const splitted = text.split("\n")

	let result = ""
	let indx = 0
	for (let line of splitted) {
		result += line.replace("\t"," ") + "\n"
		if (indx === posStart.line) {
			result += " ".repeat(posStart.col - 1) 
			result += "^"
			result += "-".repeat(5) + details
			result += "\n"
		}
		indx++
	}
	return result
}

export class JinjaError {
	error_name: string = ""
	details: string = ""
	posStart: Position
	posEnd: Position

	constructor (posStart: Position, posEnd: Position, error_name: string, details: string) {
		this.posStart = posStart
		this.posEnd = posEnd
		this.error_name = error_name
		this.details = details
	}

	toString() {
		if (!this.posStart) {
			console.log(this)
			return ''
		}
		return `${this.error_name}: ${this.details}
		File ${this.posStart?.fileName ? this.posStart?.fileName : "_FILE_"}, line ${this.posStart?.line ?? 0 + 1}

${stringWithArrows(this.posStart.fileText, this.posStart, this.details)}`;
	}
}

export class IllegalCharError extends JinjaError {
	constructor(posStart: Position, posEnd: Position, details: string) {
		super(posStart, posEnd, "Illegal Character", details)
	}
}


export class InvalidSyntaxError extends JinjaError {
	constructor(posStart: Position, posEnd: Position, details: string) {
		super(posStart, posEnd, "Illegal Syntax", details)
	}
}

export class ExpectedCharError extends JinjaError {
	constructor(posStart: Position, posEnd: Position, details: string) {
		super(posStart, posEnd, "Expected Character", details)
	}
}

export class MissingLoopCloseTagError extends JinjaError {
	constructor(posStart: Position, posEnd: Position, details: string) {
		super(posStart, posEnd, "Missing for closing", details)
	}
}
export class MissingIfCloseTagError extends JinjaError {
	constructor(posStart: Position, posEnd: Position, details: string) {
		super(posStart, posEnd, "Missing if closing", details)
	}
}
export class ExecUnkownNodeTypeError extends JinjaError {
	constructor(posStart: Position, posEnd: Position, details: string) {
		super(posStart, posEnd, "Unknown node type", details)
	}
}
export class ExecUnkownVariableError extends JinjaError {
	constructor(posStart: Position, posEnd: Position, details: string) {
		super(posStart, posEnd, "Unknown variable", details)
	}
}

export class ExecUnkownPropertyError extends JinjaError {
	constructor(posStart: Position, posEnd: Position, details: string) {
		super(posStart, posEnd, "Unknown property", details)
	}
}
