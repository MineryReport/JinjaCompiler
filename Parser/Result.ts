class Result<T,E> {
	value: T|null = null
	error: E|null = null
	lastRegisteredAdvanceCount = 0
	advanceCount = 0
	toReverseCount = 0
	funcReturnValue: any|null = null
	loopShouldContinue = false
	loopShouldBreak = false

	constructor(value?:T) {
		this.value = value ?? null
		this.error = null
	}

	reset() {
		this.value = null
		this.error = null
		this.lastRegisteredAdvanceCount = 0
		this.advanceCount = 0
		this.toReverseCount = 0
		this.funcReturnValue = null
		this.loopShouldBreak = false
		this.loopShouldContinue = false
	}

	registerAdvancement() {
		this.lastRegisteredAdvanceCount = 1
		this.advanceCount += 1
	}

	registerBack() {
		this.advanceCount -= this.lastRegisteredAdvanceCount
		if (this.advanceCount < 0) {
			this.advanceCount = 0
		}
	}
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
	from(res: Result<T,E>) {
		this.lastRegisteredAdvanceCount = this.advanceCount
		this.advanceCount += res.advanceCount
		if (res.error) this.error = res.error
		this.funcReturnValue = res.funcReturnValue
		this.loopShouldContinue = res.loopShouldContinue
		this.loopShouldBreak = res.loopShouldBreak

		return res.value
	}

	tryFrom(res: Result<T,E>) {
		if (res.error) {
			this.toReverseCount = res.advanceCount
			return null
		}
		return this.from(res)
	}

	success(value:T) {
		this.reset()
		this.value = value
		return this
	}
	successReturn(value:T) {
		this.reset()
		this.funcReturnValue = value
		return this
	}

	sucessContinue() {
		this.reset()
		this.loopShouldContinue = true
		return this
	}
	successBreak() {
		this.reset()
		this.loopShouldBreak = true
		return this
	}
	failure(error:E) {
		if(!this.error || this.advanceCount === 0) {
			this.reset()
			this.error = error
		}
		return this
	}

	shouldReturn() {
		return (
			this.error ||
			this.funcReturnValue ||
			this.loopShouldBreak || 
			this.loopShouldContinue
		)
	}
}

export default Result