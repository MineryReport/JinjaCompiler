import JinjaNode from "./node"

type ExtendedJinjaNode = {
	node?: JinjaNode | null
} & JinjaNode

function hasNext(node: ExtendedJinjaNode) {
	return node?.node || node.token 
}

function getNextNode(node: ExtendedJinjaNode) {
	if (hasNext(node)) {
		return node?.node ?? node.token
	}
	return null
}

function increaseDepth(noide: JinjaNode, depth: number) {
	return depth + 1
}

function* iterateNode(node: JinjaNode, depth = 0){
	let current = node
	let currentDepth = depth

	while (hasNext(current)) {
		yield {value: current, depth: currentDepth}
		current = getNextNode(current)
		currentDepth = increaseDepth(node, depth)
	}
}

function mapNode<T extends ExtendedJinjaNode | null>(node: JinjaNode, method: (item: JinjaNode, index: number, firstNode: JinjaNode)=> T | null, i: number, ast: JinjaNode, allowNulls = true) {
	let newNode = method(node, i, ast)
	if (newNode && newNode.hasOwnProperty("node") && newNode.node) {
		if (Array.isArray(newNode.node)) {
			let arr = []
			let j = 1
			for (let elem of newNode.node) {
				const mappedNode = mapNode(elem, method, i + j, ast, allowNulls)
				if (mappedNode || (!mappedNode && allowNulls)) {
					arr.push(mappedNode)
				}
			}
		} else {
			const mappedNode = mapNode(newNode.node, method, i + 1, ast, allowNulls)
			if (mappedNode || (!mappedNode && allowNulls)) {
				newNode.node = mappedNode
			}
		}
	} else if (newNode && newNode.hasOwnProperty("token") && newNode.token) {
		if (Array.isArray(newNode.token)) {
			let arr = []
			let j = 1
			for (let elem of newNode.token) {
				const mappedNode = mapNode(elem, method, i + j, ast, allowNulls) 
				if (mappedNode || (!mappedNode && allowNulls)) {
					arr.push(mappedNode)
				}
				j++
			}
			newNode.token = arr
		} else {
			const mappedNode = mapNode(newNode.token, method, i + 1, ast, allowNulls) 
			if (mappedNode || (!mappedNode && allowNulls)) {
				newNode.node = mappedNode
			}
		}
	}
	return newNode
}

class Ast {
	ast: JinjaNode
	length: number

	constructor(_ast: JinjaNode) {
		this.ast = _ast
		this.length = this.reduce((acc, item, index) => index, 0) ?? 0
	}

	*getIterator() {
		for (let next of iterateNode(this.ast)) {
			yield next
		}
	} 

	reduce<T>(callback: (acc: T, val: JinjaNode, index: number, depth: number, firstNode: JinjaNode) => T, initialValue:T|null  = null) {
		const it = this.getIterator()

		let index = 0
		let acc = initialValue
		for (let {value, depth} of it) {
			if (acc === null) {
				acc = value as T
				index++
			} else {
				acc = callback(acc, value, index++, depth, this.ast)
			}
		}

		return acc
	}

	find(callback: (item: JinjaNode, index: number, depth: number, firstNode: JinjaNode) => boolean) {
		let index = 0;
		for (let { value, depth } of this.getIterator()) {
			if (callback(value, index++, depth, this.ast)) {
				return value;
			}
		}
		return undefined;
	}

	map<T extends ExtendedJinjaNode | null>(callback:  (item: JinjaNode, index: number, firstNode: JinjaNode)=> T, allowNulls = true) {
		let newTree = mapNode(this.ast, callback, 0, this.ast, allowNulls);
		if (!newTree) return null
		return new Ast(newTree);
	}

	forEach(callback: (item: JinjaNode, index: number, depth: number, firstNode: JinjaNode)=> void) {
		let index = 0;
		for (let { value, depth } of this.getIterator()) {
			callback(value, index++, depth, this.ast);
		}
	}

	filter(callback: (item: JinjaNode, index: number, firstNode: JinjaNode) => boolean) {
		return this.map(
			(item, index, ast) => (callback(item, index, ast) ? null : item),
			false
		);
	}
	
}

export default Ast