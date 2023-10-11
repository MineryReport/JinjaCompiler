"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../Ast/node");
const Result_1 = __importDefault(require("../Parser/Result"));
const error_1 = require("../error");
class SymbolTable {
    constructor(context) {
        if (context && Object.keys(context).length > 0) {
            this.global = new Map(Object.keys(context).map((varName) => { return [varName, context[varName]]; }));
        }
        else {
            this.global = new Map();
        }
        this.scoped = new Map();
    }
    getGlobal(name) {
        if (!this.hasGlobalVar(name)) {
            throw new Error(`Unkown global variable ${name}`);
        }
        return this.global.get(name);
    }
    hasGlobalVar(name) {
        return this.global.has(name);
    }
    hasScopedVar(scope, name) {
        var _a;
        const scopedVars = this.scoped.get(scope);
        return (_a = scopedVars === null || scopedVars === void 0 ? void 0 : scopedVars.get(name)) !== null && _a !== void 0 ? _a : false;
    }
    addScoped(scope, name, value) {
        if (this.global.has(name)) {
            throw new Error(`Adding scoped var ${name} to ${scope}, but a symbol already exists in global scope with that name`);
        }
        if (this.hasScopedVar(scope, name)) {
            throw new Error(`Adding scoped var ${name} to ${scope}, but a symbol already exists in the scope ${scope} with that name`);
        }
        if (!this.scoped.has(scope)) {
            this.scoped.set(scope, new Map([[name, value]]));
        }
        else {
            const scopeVars = this.scoped.get(scope);
            scopeVars === null || scopeVars === void 0 ? void 0 : scopeVars.set(name, value);
        }
    }
    updateScoped(scope, name, value) {
        const scopeVars = this.scoped.get(scope);
        scopeVars === null || scopeVars === void 0 ? void 0 : scopeVars.set(name, value);
    }
    get(scopes, name) {
        var _a;
        for (let scope of scopes.reverse()) {
            if (this.hasScopedVar(scope, name)) {
                return (_a = this.scoped.get(scope)) === null || _a === void 0 ? void 0 : _a.get(name);
            }
        }
        return this.getGlobal(name);
    }
}
class Interpreter {
    constructor(node, context, symbols) {
        this.parentNode = node;
        if (symbols) {
            this.symbols = symbols;
        }
        else {
            this.symbols = new SymbolTable(context);
        }
    }
    run() {
        let result = new Result_1.default("");
        if (this.parentNode.type === "ListNode") {
            let res = "";
            for (let elem of this.parentNode.token) {
                res += result.from(this.visit(elem));
                if (result.error)
                    return result;
            }
            return result.success(res);
        }
        return result.failure(new error_1.JinjaError(this.parentNode.posStart, this.parentNode.posEnd, "Invalid node type", `${this.parentNode.type}`));
    }
    visit(node) {
        let result = new Result_1.default("");
        const types = {
            "StringNode": (node) => {
                const res = new Result_1.default(node.value);
                return res.success(node.value);
            },
            "UnaryOpNode": this.visitUnaryOpNode.bind(this),
            "ListNode": this.visitListNode.bind(this),
            "ForNode": this.visitForNode.bind(this),
            "VarAccessNode": this.visitVarAccessNode.bind(this),
            "BinaryOpNode": this.visitBinaryOpNode.bind(this),
            "IfNode": this.visitIfNode.bind(this),
            "IfBoolNode": this.visitIfBoolNode.bind(this),
        };
        if (!types.hasOwnProperty(node.type)) {
            return result.failure(new error_1.ExecUnkownNodeTypeError(node.posStart, node.posEnd, `${node.type}`));
        }
        const res = result.from(types[node.type](node));
        if (result.error)
            return result;
        return result.success(res);
    }
    visitUnaryOpNode(node) {
        var _a;
        let result = new Result_1.default("");
        let res = "";
        const op = node.token;
        const value = result.from(this.visit(Object.assign(Object.assign({}, node.node), { scope: [...((_a = node.node.scope) !== null && _a !== void 0 ? _a : []), ...node.scope, node.id] })));
        if (result.error)
            return result;
        if (op.value === "not") {
            if (value === "true") {
                return result.success("false");
            }
            else {
                return result.success("true");
            }
        }
        return result.success("false");
    }
    visitBinaryOpNode(node) {
        var _a, _b;
        let result = new Result_1.default("");
        let res = "";
        const varValue = node.token;
        const value = result.from(this.visit(Object.assign(Object.assign({}, varValue), { scope: [...((_a = varValue.scope) !== null && _a !== void 0 ? _a : []), ...node.scope, node.id] })));
        if (result.error)
            return result;
        const target = result.from(this.visit(Object.assign(Object.assign({}, node.node), { scope: [...((_b = varValue.scope) !== null && _b !== void 0 ? _b : []), ...node.scope, node.id] })));
        if (result.error)
            return result;
        if (node.comparison.value === "is" || node.comparison.value === "===") {
            if (value === target) {
                return result.success("true");
            }
            else {
                return result.success("false");
            }
        }
        return result.success("false");
    }
    visitListNode(node) {
        var _a;
        let result = new Result_1.default("");
        let res = "";
        for (let n of node.token) {
            let tmp = result.from(this.visit(Object.assign(Object.assign({}, n), { scope: [...((_a = node === null || node === void 0 ? void 0 : node.scope) !== null && _a !== void 0 ? _a : []), node.id] })));
            if (result.error)
                return result;
            res += tmp;
        }
        return result.success(res);
    }
    visitForNode(node) {
        var _a;
        let result = new Result_1.default("");
        const list = node.token.value;
        const listValues = this.symbols.getGlobal(list);
        const iter = node.iter.value;
        this.symbols.addScoped(node.id, iter, undefined);
        let res = "";
        for (let elem of listValues) {
            this.symbols.updateScoped(node.id, iter, elem);
            const body = node.node;
            for (let bodyItem of body) {
                let tmp = result.from(this.visit(Object.assign(Object.assign({}, bodyItem), { scope: [...((_a = node === null || node === void 0 ? void 0 : node.scope) !== null && _a !== void 0 ? _a : []), node.id] })));
                if (result.error)
                    return result;
                res += tmp;
            }
        }
        return result.success(res);
    }
    visitVarAccessNode(node) {
        let result = new Result_1.default("");
        try {
            if (parseInt(node.token)) {
                return result.success(node.token);
            }
        }
        catch (_a) { }
        const splitted = node.token.split(".");
        let res = "";
        if (splitted.length < 2) {
            try {
                res += this.symbols.get(node.scope, node.token);
            }
            catch (e) {
                return result.failure(new error_1.ExecUnkownVariableError(node.posStart, node.posEnd, e.toString()));
            }
        }
        else {
            const varItem = this.symbols.get(node.scope, splitted[0]);
            if (!varItem.hasOwnProperty(splitted[1])) {
                return result.failure(new error_1.ExecUnkownPropertyError(node.posStart, node.posEnd, `Unkown property ${splitted[1]} in ${splitted[0]}`));
            }
            res += varItem[splitted[1]];
        }
        return result.success(res);
    }
    visitIfNode(node) {
        var _a, _b;
        let result = new Result_1.default("");
        let res = "";
        const comparisonToken = node.token;
        const comparison = result.from(this.visit(Object.assign(Object.assign({}, comparisonToken), { scope: [...((_a = node === null || node === void 0 ? void 0 : node.scope) !== null && _a !== void 0 ? _a : []), node.id] })));
        const body = node.body.token;
        if (result.error)
            return result;
        if (comparison === "true") {
            const bodyValue = result.from(this.visit(new node_1.ListNode(body, node.posStart, node.posEnd, [...((_b = node === null || node === void 0 ? void 0 : node.scope) !== null && _b !== void 0 ? _b : []), node.id])));
            if (result.error)
                return result;
            return result.success(bodyValue);
        }
        return result.success(res);
    }
    visitIfBoolNode(node) {
        var _a, _b;
        let result = new Result_1.default("");
        let res = "";
        const varItem = node.token;
        const body = node.body.token;
        const comparison = result.from(this.visit(Object.assign(Object.assign({}, varItem), { scope: [...((_a = node === null || node === void 0 ? void 0 : node.scope) !== null && _a !== void 0 ? _a : []), node.id] })));
        if (result.error)
            return result;
        if (comparison === "true") {
            const bodyValue = result.from(this.visit(new node_1.ListNode(body, node.posStart, node.posEnd, [...((_b = node === null || node === void 0 ? void 0 : node.scope) !== null && _b !== void 0 ? _b : []), node.id])));
            if (result.error)
                return result;
            return result.success(bodyValue);
        }
        return result.success(res);
    }
}
exports.default = Interpreter;
