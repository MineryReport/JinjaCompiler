"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hasNext(node) {
    return (node === null || node === void 0 ? void 0 : node.node) || node.token;
}
function getNextNode(node) {
    var _a;
    if (hasNext(node)) {
        return (_a = node === null || node === void 0 ? void 0 : node.node) !== null && _a !== void 0 ? _a : node.token;
    }
    return null;
}
function increaseDepth(noide, depth) {
    return depth + 1;
}
function* iterateNode(node, depth = 0) {
    let current = node;
    let currentDepth = depth;
    while (hasNext(current)) {
        yield { value: current, depth: currentDepth };
        current = getNextNode(current);
        currentDepth = increaseDepth(node, depth);
    }
}
function mapNode(node, method, i, ast, allowNulls = true) {
    let newNode = method(node, i, ast);
    if (newNode && newNode.hasOwnProperty("node") && newNode.node) {
        if (Array.isArray(newNode.node)) {
            let arr = [];
            let j = 1;
            for (let elem of newNode.node) {
                const mappedNode = mapNode(elem, method, i + j, ast, allowNulls);
                if (mappedNode || (!mappedNode && allowNulls)) {
                    arr.push(mappedNode);
                }
            }
        }
        else {
            const mappedNode = mapNode(newNode.node, method, i + 1, ast, allowNulls);
            if (mappedNode || (!mappedNode && allowNulls)) {
                newNode.node = mappedNode;
            }
        }
    }
    else if (newNode && newNode.hasOwnProperty("token") && newNode.token) {
        if (Array.isArray(newNode.token)) {
            let arr = [];
            let j = 1;
            for (let elem of newNode.token) {
                const mappedNode = mapNode(elem, method, i + j, ast, allowNulls);
                if (mappedNode || (!mappedNode && allowNulls)) {
                    arr.push(mappedNode);
                }
                j++;
            }
            newNode.token = arr;
        }
        else {
            const mappedNode = mapNode(newNode.token, method, i + 1, ast, allowNulls);
            if (mappedNode || (!mappedNode && allowNulls)) {
                newNode.node = mappedNode;
            }
        }
    }
    return newNode;
}
class Ast {
    constructor(_ast) {
        var _a;
        this.ast = _ast;
        this.length = (_a = this.reduce((acc, item, index) => index, 0)) !== null && _a !== void 0 ? _a : 0;
    }
    *getIterator() {
        for (let next of iterateNode(this.ast)) {
            yield next;
        }
    }
    reduce(callback, initialValue = null) {
        const it = this.getIterator();
        let index = 0;
        let acc = initialValue;
        for (let { value, depth } of it) {
            if (acc === null) {
                acc = value;
                index++;
            }
            else {
                acc = callback(acc, value, index++, depth, this.ast);
            }
        }
        return acc;
    }
    find(callback) {
        let index = 0;
        for (let { value, depth } of this.getIterator()) {
            if (callback(value, index++, depth, this.ast)) {
                return value;
            }
        }
        return undefined;
    }
    map(callback, allowNulls = true) {
        let newTree = mapNode(this.ast, callback, 0, this.ast, allowNulls);
        if (!newTree)
            return null;
        return new Ast(newTree);
    }
    forEach(callback) {
        let index = 0;
        for (let { value, depth } of this.getIterator()) {
            callback(value, index++, depth, this.ast);
        }
    }
    filter(callback) {
        return this.map((item, index, ast) => (callback(item, index, ast) ? null : item), false);
    }
}
exports.default = Ast;
