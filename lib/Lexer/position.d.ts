declare class Position {
    index: number;
    line: number;
    col: number;
    fileText: string;
    fileName: string;
    indentation: number;
    pushBuffer: [number, number][];
    /**
     * @constructor
     * @param {number} index The index of the current character inside the source text
     * @param {number} line - The current line number in the source text
     * @param {number} col - The current column number in the source text
     * @param {string} fileName - The name of the source text file
     * @param {string} fileText - The source text
     * @param {number} [indentation=0] - The current indentation level
     */
    constructor(index: number, line: number, col: number, fileText: string, fileName?: string, indentation?: number);
    /**
     * Advances forward the current character pointer in the source text.
     * If a break line is encountered then moves to the next line and to the first column
     *
     */
    advance(currentChar?: string | null): this;
    /**
     * Moves backward the current character in the source text _amount_ positions.
     * If a break line is encountered then moves to the previous line and to the last column
     */
    reverse(currentChar?: string | null, amount?: number): this;
    /**
     * Method used to cache the movements of caret for future fallback
     */
    push(): void;
    /**
     * Go backwards to the previous position in the history buffer.
     */
    pop(): void;
    /**
     * Create a new position equal to this instance
     */
    copy(): Position;
}
export default Position;
