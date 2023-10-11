import JinjaNode, { BinaryOpNode, ForNode, IfBoolNode, IfNode, ListNode, UnaryOpNode, VarAccessNode } from "../Ast/node";
import Result from "../Parser/Result";
import { JinjaError } from '../error';
declare class SymbolTable {
    global: Map<string, any>;
    scoped: Map<string, Map<string, any>>;
    constructor(context?: {
        [key: string]: any;
    });
    getGlobal(name: string): any;
    hasGlobalVar(name: string): boolean;
    hasScopedVar(scope: string, name: string): any;
    addScoped(scope: string, name: string, value: any): void;
    updateScoped(scope: string, name: string, value: any): void;
    get(scopes: string[], name: string): any;
}
declare class Interpreter {
    parentNode: JinjaNode;
    symbols: SymbolTable;
    constructor(node: JinjaNode, context?: {
        [key: string]: any;
    }, symbols?: SymbolTable);
    run(): Result<string, JinjaError>;
    visit(node: JinjaNode): Result<string, JinjaError>;
    visitUnaryOpNode(node: UnaryOpNode): Result<string, JinjaError>;
    visitBinaryOpNode(node: BinaryOpNode): Result<string, JinjaError>;
    visitListNode(node: ListNode): Result<string, JinjaError>;
    visitForNode(node: ForNode): Result<string, JinjaError>;
    visitVarAccessNode(node: VarAccessNode): Result<string, JinjaError>;
    visitIfNode(node: IfNode): Result<string, JinjaError>;
    visitIfBoolNode(node: IfBoolNode): Result<string, JinjaError>;
}
export default Interpreter;
