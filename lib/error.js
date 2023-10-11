"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecUnkownPropertyError = exports.ExecUnkownVariableError = exports.ExecUnkownNodeTypeError = exports.MissingIfCloseTagError = exports.MissingLoopCloseTagError = exports.ExpectedCharError = exports.InvalidSyntaxError = exports.IllegalCharError = exports.JinjaError = void 0;
const stringWithArrows = (text, posStart, details) => {
    const splitted = text.split("\n");
    let result = "";
    let indx = 0;
    for (let line of splitted) {
        result += line.replace("\t", " ") + "\n";
        if (indx === posStart.line) {
            result += " ".repeat(posStart.col - 1);
            result += "^";
            result += "-".repeat(5) + details;
            result += "\n";
        }
        indx++;
    }
    return result;
};
class JinjaError {
    constructor(posStart, posEnd, error_name, details) {
        this.error_name = "";
        this.details = "";
        this.posStart = posStart;
        this.posEnd = posEnd;
        this.error_name = error_name;
        this.details = details;
    }
    toString() {
        var _a, _b, _c, _d;
        if (!this.posStart) {
            console.log(this);
            return '';
        }
        return `${this.error_name}: ${this.details}
		File ${((_a = this.posStart) === null || _a === void 0 ? void 0 : _a.fileName) ? (_b = this.posStart) === null || _b === void 0 ? void 0 : _b.fileName : "_FILE_"}, line ${(_d = (_c = this.posStart) === null || _c === void 0 ? void 0 : _c.line) !== null && _d !== void 0 ? _d : 0 + 1}

${stringWithArrows(this.posStart.fileText, this.posStart, this.details)}`;
    }
}
exports.JinjaError = JinjaError;
class IllegalCharError extends JinjaError {
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Illegal Character", details);
    }
}
exports.IllegalCharError = IllegalCharError;
class InvalidSyntaxError extends JinjaError {
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Illegal Syntax", details);
    }
}
exports.InvalidSyntaxError = InvalidSyntaxError;
class ExpectedCharError extends JinjaError {
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Expected Character", details);
    }
}
exports.ExpectedCharError = ExpectedCharError;
class MissingLoopCloseTagError extends JinjaError {
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Missing for closing", details);
    }
}
exports.MissingLoopCloseTagError = MissingLoopCloseTagError;
class MissingIfCloseTagError extends JinjaError {
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Missing if closing", details);
    }
}
exports.MissingIfCloseTagError = MissingIfCloseTagError;
class ExecUnkownNodeTypeError extends JinjaError {
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Unknown node type", details);
    }
}
exports.ExecUnkownNodeTypeError = ExecUnkownNodeTypeError;
class ExecUnkownVariableError extends JinjaError {
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Unknown variable", details);
    }
}
exports.ExecUnkownVariableError = ExecUnkownVariableError;
class ExecUnkownPropertyError extends JinjaError {
    constructor(posStart, posEnd, details) {
        super(posStart, posEnd, "Unknown property", details);
    }
}
exports.ExecUnkownPropertyError = ExecUnkownPropertyError;
