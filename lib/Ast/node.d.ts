import Position from "../Lexer/position";
declare class JinjaNode {
    type: string;
    token: any | any[] | null;
    id: string;
    scope: string[];
    posStart?: Position | null;
    posEnd?: Position | null;
    constructor(token: any | any[], type: string);
}
export declare class ListNode extends JinjaNode {
    constructor(elementNodes: any[], posStart: Position, posEnd: Position, scope?: string[]);
    toString(): any;
}
export declare class StringNode extends JinjaNode {
    value: any;
    constructor(token: any, value: any);
}
export declare class UnaryOpNode extends JinjaNode {
    node: any;
    constructor(token: any, node: any);
}
export declare class IdentifierNode extends JinjaNode {
    constructor(token: any);
}
export declare class BinaryOpNode extends JinjaNode {
    node: any;
    comparison: any;
    constructor(token: any, comparison: any, node: any);
}
export declare class VarAccessNode extends JinjaNode {
    node: any;
    constructor(token: any, node: any);
}
export declare class VarAssignNode extends JinjaNode {
    node: any;
    tokenType: any;
    constructor(token: any, tokenType: any, node: any);
}
export declare class ForNode extends JinjaNode {
    node: any;
    iter: any;
    constructor(list: any, iter: any, node: any);
}
export declare class IfNode extends JinjaNode {
    body: any;
    constructor(token: any, body: any);
}
export declare class IfBoolNode extends JinjaNode {
    body: any;
    constructor(token: any, body: any);
}
export default JinjaNode;
