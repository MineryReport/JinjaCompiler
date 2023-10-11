import Position from "../Lexer/position";
import Token from "../Lexer/token";
import {v4 as uuidv4} from 'uuid'

class JinjaNode {
	type: string = ""
	token: any | any[] | null = null
	id: string = ""
	scope: string[] = []
	posStart?: Position | null = null
	posEnd?: Position | null = null

	constructor(token: any | any[], type: string) {
		this.type = type
		this.token = token
		this.id = uuidv4()
		if (Array.isArray(token) && token.length > 0) {
			this.posStart = token.filter((t) => !!t)[0]?.posStart
			this.posEnd = token.filter((t) => !!t)[0]?.posEnd
		} else if (token){
			this.posStart = (token as Token).posStart
			this.posEnd = (token as Token).posEnd
		}

		
	}
}

export class ListNode extends JinjaNode {
	constructor(elementNodes: any[], posStart: Position, posEnd: Position, scope?: string[]) {
		super(elementNodes, "ListNode")
		this.posStart = posStart
		this.posEnd = posEnd

		if (scope) {
			this.scope = scope	
		}
	}

	toString() {
		return this.token?.toString()
	}
}

export class StringNode extends JinjaNode {
	value: any
	constructor(token: any, value: any) {
		super(token, "StringNode")
		this.value = value
	}
}

export class UnaryOpNode extends JinjaNode {
	node: any
	
	constructor(token: any, node: any) {
		super(token, "UnaryOpNode")
		this.node = node
	}
}

export class IdentifierNode extends JinjaNode {
	
	constructor(token: any) {
		super(token, "IdentifierNode")
	}
}

export class BinaryOpNode extends JinjaNode {
	node: any
	comparison: any
	
	constructor(token: any, comparison: any, node: any) {
		super(token, "BinaryOpNode")
		this.node = node
		this.comparison = comparison
	}
}


export class VarAccessNode extends JinjaNode {
	node: any
	
	constructor(token: any, node: any) {
		super(token, "VarAccessNode")
		this.node = node
	}
}

export class VarAssignNode extends JinjaNode {
	node: any
	tokenType: any
	
	constructor(token: any, tokenType: any, node: any) {
		super(token, "VarAssignNode")
		this.node = node
		this.tokenType = tokenType,
		this.posEnd = node?.posEnd
	}
}

export class ForNode extends JinjaNode {
	node: any
	iter: any
	
	constructor(list: any, iter: any, node: any) {
		super(list, "ForNode")
		this.node = node
		this.iter = iter,
		this.posEnd = node?.posEnd
	}
}

export class IfNode extends JinjaNode {	
	body: any
	constructor(token: any, body: any) {
		super(token, "IfNode")
		this.body = body
	}
}

export class IfBoolNode extends JinjaNode {
	body :any
	constructor(token: any, body: any) {
		super(token, "IfBoolNode")
		this.body = body
	}
}

export default JinjaNode