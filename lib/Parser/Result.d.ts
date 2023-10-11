declare class Result<T, E> {
    value: T | null;
    error: E | null;
    lastRegisteredAdvanceCount: number;
    advanceCount: number;
    toReverseCount: number;
    funcReturnValue: any | null;
    loopShouldContinue: boolean;
    loopShouldBreak: boolean;
    constructor(value?: T);
    reset(): void;
    registerAdvancement(): void;
    registerBack(): void;
    /**
     * Applies a target result to this instance, changing its
     * inner error to the targets and returning the target's value
     *
     * @example
     *
     * const isInt = (value) => {
     * 	return Number.isInteger(parseInt(value))
     * 		? Result().failure("Not an int")
     * 		: Result().success(value)
     * }
     *
     * let result = Result()
     *
     * const num = isInt("23")
     * if (num.error) {
     * 	console.error(num.error)
     * } else {
     * 	console.log(num)
     * }
     *
     * @param {Result} res - The result to flat map with
     * @returns {*} The target result's value
     */
    from(res: Result<T, E>): T | null;
    tryFrom(res: Result<T, E>): T | null;
    success(value: T): this;
    successReturn(value: T): this;
    sucessContinue(): this;
    successBreak(): this;
    failure(error: E): this;
    shouldReturn(): any;
}
export default Result;
