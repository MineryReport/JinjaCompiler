import JinjaNode, { BinaryOpNode, ForNode, IdentifierNode, IfBoolNode, IfNode, ListNode, StringNode, UnaryOpNode, VarAccessNode } from "../Ast/node";
import { TokenType } from "../Lexer/lexer";
import Token from "../Lexer/token";
import Result from "../Parser/Result";
import { ExecUnkownNodeTypeError, ExecUnkownPropertyError, ExecUnkownVariableError, JinjaError } from '../error';

class SymbolTable {
	global: Map<string, any>
	scoped: Map<string, Map<string, any>>

	constructor(context?: {[key:string]:any}) {
		if (context && Object.keys(context).length > 0) {
			this.global = new Map(Object.keys(context).map((varName) => {return [varName, context[varName]]}))
		} else {
			this.global = new Map()
		}
		this.scoped = new Map()
	}

	getGlobal(name: string) {
		if (!this.hasGlobalVar(name)) {
			throw new Error(`Unkown global variable ${name}`)
		}
		return this.global.get(name)
	}

	hasGlobalVar(name: string) {
		return this.global.has(name)
	}

	hasScopedVar(scope: string, name: string) {
		const scopedVars = this.scoped.get(scope)
		return scopedVars?.get(name) ?? false
	}

	addScoped(scope: string, name: string, value: any) {
		if (this.global.has(name)) {
			throw new Error(`Adding scoped var ${name} to ${scope}, but a symbol already exists in global scope with that name`)
		}

		if (this.hasScopedVar(scope, name)) {
			throw new Error(`Adding scoped var ${name} to ${scope}, but a symbol already exists in the scope ${scope} with that name`)
		}

		if (!this.scoped.has(scope)) {
			this.scoped.set(scope, new Map([[name, value]]))
		} else {
			const scopeVars = this.scoped.get(scope)
			scopeVars?.set(name, value)
		}
	}

	updateScoped(scope: string, name: string, value: any) {
		const scopeVars = this.scoped.get(scope)
		scopeVars?.set(name, value)
	}

	get(scopes: string[], name: string) {

		for (let scope of scopes.reverse()) {
			if (this.hasScopedVar(scope, name)) {
				return this.scoped.get(scope)?.get(name)
			}
		}
	
		return this.getGlobal(name)
	}
}

class Interpreter {
	parentNode: JinjaNode
	symbols: SymbolTable

	constructor(node: JinjaNode, context?: {[key: string]: any}, symbols?: SymbolTable) {
		this.parentNode = node

		if (symbols) {
			this.symbols = symbols
		} else {
			this.symbols = new SymbolTable(context)
		}
	}

	run() {
		let result = new Result<string, JinjaError>("")

		if (this.parentNode.type === "ListNode") {
			let res = ""
			for (let elem of this.parentNode.token) {
				res += result.from(this.visit(elem))
				if(result.error) return result
			}
			return result.success(res)
		}
		return result.failure(new JinjaError(this.parentNode.posStart!, this.parentNode.posEnd!, "Invalid node type", `${this.parentNode.type}`))
	}

	visit(node: JinjaNode) {
		let result = new Result<string, JinjaError>("")
		const types: {[key: string]: (node: any) => Result<string, JinjaError>} = {
			"StringNode": (node: StringNode) => {
				const res = new Result<string, JinjaError>(node.value)
				return res.success(node.value)
			},
			"UnaryOpNode": this.visitUnaryOpNode.bind(this),
			"ListNode": this.visitListNode.bind(this),
			"ForNode": this.visitForNode.bind(this),
			"VarAccessNode": this.visitVarAccessNode.bind(this),
			"BinaryOpNode": this.visitBinaryOpNode.bind(this),
			"IfNode": this.visitIfNode.bind(this),
			"IfBoolNode": this.visitIfBoolNode.bind(this),
		}

		if (!types.hasOwnProperty(node.type)) {
			return result.failure(new ExecUnkownNodeTypeError(node.posStart!, node.posEnd!, `${node.type}`))
		}
		const res = result.from(types[node.type](node))

		if (result.error) return result

		return result.success(res!)
	}


	visitUnaryOpNode(node: UnaryOpNode) {
		let result = new Result<string, JinjaError>("")
		let res = ""

		const op = node.token

		const value = result.from(this.visit({...node.node, scope: [...(node.node.scope ?? []), ...node.scope, node.id]}))
		if (result.error) return result

		if (op.value === "not") {
			if (value === "true") {
				return result.success("false")
			} else{
				return result.success("true")
			}
		}

		return result.success("false")
	}

	visitBinaryOpNode(node: BinaryOpNode) {
		let result = new Result<string, JinjaError>("")
		let res = ""

		const varValue = node.token

		const value = result.from(this.visit({...varValue, scope: [...(varValue.scope ?? []), ...node.scope, node.id]}))

		if (result.error) return result
		const target = result.from(this.visit({...node.node, scope: [...(varValue.scope ?? []), ...node.scope, node.id]}))
		
		if (result.error) return result


		if (node.comparison.value === "is" || node.comparison.value === "===") {
			if (value === target){
				return result.success("true")
			} else {
				return result.success("false")
			}
		}


		return result.success("false")
	}

	visitListNode(node: ListNode) {
		let result = new Result<string, JinjaError>("")

		let res = ""

		for (let n of node.token) {
			let tmp = result.from(this.visit({...n, scope: [...(node?.scope ?? []), node.id]}))
			if (result.error) return result
			res+= tmp
		}

		return result.success(res)
	}

	visitForNode(node: ForNode) {
		let result = new Result<string, JinjaError>("")
		
		const list = node.token.value

		const listValues: any[] = this.symbols.getGlobal(list)

		const iter = node.iter.value
		this.symbols.addScoped(node.id, iter, undefined)

		let res = ""
		for (let elem of listValues) {
			this.symbols.updateScoped(node.id, iter, elem)

			const body = node.node
			
			for (let bodyItem of body) {
				let tmp = result.from(this.visit({...bodyItem, scope: [...(node?.scope ?? []), node.id]}))
				if (result.error) return result
				res+= tmp
			}
			
		}
			
		return result.success(res)
	}

	visitVarAccessNode(node: VarAccessNode) {
		let result = new Result<string, JinjaError>("")

		try {
			if (parseInt(node.token)) {
				return result.success(node.token)
			}
		} catch {}

		const splitted = (node.token as string).split(".")

		let res = ""
		if (splitted.length < 2) {
			try {
				res += this.symbols.get(node.scope, node.token)
			} catch (e) {
				
				return result.failure(new ExecUnkownVariableError(node.posStart!, node.posEnd!, e!.toString()) )
			}
		} else {
			const varItem = this.symbols.get(node.scope, splitted[0])

			if (!varItem.hasOwnProperty(splitted[1])) {
				return result.failure(new ExecUnkownPropertyError(node.posStart!, node.posEnd!, `Unkown property ${splitted[1]} in ${splitted[0]}`))
			}
			res += varItem[splitted[1]]
		}

		return result.success(res)
	}


	visitIfNode(node: IfNode) {
		let result = new Result<string, JinjaError>("")

		let res = ""

		const comparisonToken = node.token
		
		const comparison = result.from(this.visit({...comparisonToken, scope: [...(node?.scope ?? []), node.id]}))

		const body = node.body.token

		if (result.error) return result

		if (comparison === "true") {
			const bodyValue = result.from(this.visit(new ListNode(body, node.posStart!, node.posEnd!, [...(node?.scope ?? []), node.id])))
			if (result.error) return result
			return result.success(bodyValue!)
		}
		
		return result.success(res)
	}

	visitIfBoolNode(node: IfBoolNode) {
		let result = new Result<string, JinjaError>("")

		let res = ""

		const varItem = node.token

		const body = node.body.token

		const comparison = result.from(this.visit({...varItem, scope: [...(node?.scope ?? []), node.id]}))
		if (result.error) return result
		if (comparison === "true") {
			const bodyValue = result.from(this.visit(new ListNode(body, node.posStart!, node.posEnd!, [...(node?.scope ?? []), node.id])))
			if (result.error) return result
			return result.success(bodyValue!)
		}
		
		return result.success(res)
	}
	
}


export default Interpreter