import JinjaNode from "./node";
type ExtendedJinjaNode = {
    node?: JinjaNode | null;
} & JinjaNode;
declare class Ast {
    ast: JinjaNode;
    length: number;
    constructor(_ast: JinjaNode);
    getIterator(): Generator<{
        value: JinjaNode;
        depth: number;
    }, void, unknown>;
    reduce<T>(callback: (acc: T, val: JinjaNode, index: number, depth: number, firstNode: JinjaNode) => T, initialValue?: T | null): T | null;
    find(callback: (item: JinjaNode, index: number, depth: number, firstNode: JinjaNode) => boolean): JinjaNode | undefined;
    map<T extends ExtendedJinjaNode | null>(callback: (item: JinjaNode, index: number, firstNode: JinjaNode) => T, allowNulls?: boolean): Ast | null;
    forEach(callback: (item: JinjaNode, index: number, depth: number, firstNode: JinjaNode) => void): void;
    filter(callback: (item: JinjaNode, index: number, firstNode: JinjaNode) => boolean): Ast | null;
}
export default Ast;
