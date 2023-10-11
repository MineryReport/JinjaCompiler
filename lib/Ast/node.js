"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfBoolNode = exports.IfNode = exports.ForNode = exports.VarAssignNode = exports.VarAccessNode = exports.BinaryOpNode = exports.IdentifierNode = exports.UnaryOpNode = exports.StringNode = exports.ListNode = void 0;
const uuid_1 = require("uuid");
class JinjaNode {
    constructor(token, type) {
        var _a, _b;
        this.type = "";
        this.token = null;
        this.id = "";
        this.scope = [];
        this.posStart = null;
        this.posEnd = null;
        this.type = type;
        this.token = token;
        this.id = (0, uuid_1.v4)();
        if (Array.isArray(token) && token.length > 0) {
            this.posStart = (_a = token.filter((t) => !!t)[0]) === null || _a === void 0 ? void 0 : _a.posStart;
            this.posEnd = (_b = token.filter((t) => !!t)[0]) === null || _b === void 0 ? void 0 : _b.posEnd;
        }
        else if (token) {
            this.posStart = token.posStart;
            this.posEnd = token.posEnd;
        }
    }
}
class ListNode extends JinjaNode {
    constructor(elementNodes, posStart, posEnd, scope) {
        super(elementNodes, "ListNode");
        this.posStart = posStart;
        this.posEnd = posEnd;
        if (scope) {
            this.scope = scope;
        }
    }
    toString() {
        var _a;
        return (_a = this.token) === null || _a === void 0 ? void 0 : _a.toString();
    }
}
exports.ListNode = ListNode;
class StringNode extends JinjaNode {
    constructor(token, value) {
        super(token, "StringNode");
        this.value = value;
    }
}
exports.StringNode = StringNode;
class UnaryOpNode extends JinjaNode {
    constructor(token, node) {
        super(token, "UnaryOpNode");
        this.node = node;
    }
}
exports.UnaryOpNode = UnaryOpNode;
class IdentifierNode extends JinjaNode {
    constructor(token) {
        super(token, "IdentifierNode");
    }
}
exports.IdentifierNode = IdentifierNode;
class BinaryOpNode extends JinjaNode {
    constructor(token, comparison, node) {
        super(token, "BinaryOpNode");
        this.node = node;
        this.comparison = comparison;
    }
}
exports.BinaryOpNode = BinaryOpNode;
class VarAccessNode extends JinjaNode {
    constructor(token, node) {
        super(token, "VarAccessNode");
        this.node = node;
    }
}
exports.VarAccessNode = VarAccessNode;
class VarAssignNode extends JinjaNode {
    constructor(token, tokenType, node) {
        super(token, "VarAssignNode");
        this.node = node;
        this.tokenType = tokenType,
            this.posEnd = node === null || node === void 0 ? void 0 : node.posEnd;
    }
}
exports.VarAssignNode = VarAssignNode;
class ForNode extends JinjaNode {
    constructor(list, iter, node) {
        super(list, "ForNode");
        this.node = node;
        this.iter = iter,
            this.posEnd = node === null || node === void 0 ? void 0 : node.posEnd;
    }
}
exports.ForNode = ForNode;
class IfNode extends JinjaNode {
    constructor(token, body) {
        super(token, "IfNode");
        this.body = body;
    }
}
exports.IfNode = IfNode;
class IfBoolNode extends JinjaNode {
    constructor(token, body) {
        super(token, "IfBoolNode");
        this.body = body;
    }
}
exports.IfBoolNode = IfBoolNode;
exports.default = JinjaNode;
