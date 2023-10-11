
class Position {
	index = 0
	line = 0
	col = 0
	fileText = ""
	fileName = ""
	indentation = 0
	pushBuffer: [number,number][] = []

	/**
	 * @constructor
	 * @param {number} index The index of the current character inside the source text
	 * @param {number} line - The current line number in the source text
	 * @param {number} col - The current column number in the source text
	 * @param {string} fileName - The name of the source text file
	 * @param {string} fileText - The source text
	 * @param {number} [indentation=0] - The current indentation level
	 */
	constructor(index: number, line: number, col: number, fileText: string, fileName?: string, indentation = 0) {
		this.index = index
		this.line = line
		this.col = col
		this.fileText = fileText
		this.fileName = fileName ?? ""
		this.indentation = indentation
		this.pushBuffer = []
	}
	/**
	 * Advances forward the current character pointer in the source text.
	 * If a break line is encountered then moves to the next line and to the first column
	 * 
	 */
	advance(currentChar:string|null = null) {
		this.index += 1
		this.col += 1

		if (currentChar && currentChar === "\n") {
			this.line += 1
			this.col = 0
		}
		return this
	}

	/**
	 * Moves backward the current character in the source text _amount_ positions.
	 * If a break line is encountered then moves to the previous line and to the last column
	 */
	reverse(currentChar:string|null = null, amount = 1) {
		let prevCol = this.col
		this.index -= amount
		this.col -= amount

		if (currentChar && currentChar === "\n") {
			this.line -= amount
			this.col = prevCol
		}
		return this
	}
	/**
	 * Method used to cache the movements of caret for future fallback
	 */
	push() {
		this.pushBuffer.push([this.index, this.col])
	}
	/**
	 * Go backwards to the previous position in the history buffer.
	 */
	pop() {
		if (this.pushBuffer.length === 0) return
		const [index, col] = this.pushBuffer.pop() as [number, number]
		this.index = index
		this.col = col
		
	}

	/**
	 * Create a new position equal to this instance
	 */
	copy() {
		return new Position(
			this.index,
			this.line,
			this.col,
			this.fileText,
			this.fileName,
			this.indentation
		)
	}
}

export default Position