"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Result {
    constructor(value) {
        this.value = null;
        this.error = null;
        this.lastRegisteredAdvanceCount = 0;
        this.advanceCount = 0;
        this.toReverseCount = 0;
        this.funcReturnValue = null;
        this.loopShouldContinue = false;
        this.loopShouldBreak = false;
        this.value = value !== null && value !== void 0 ? value : null;
        this.error = null;
    }
    reset() {
        this.value = null;
        this.error = null;
        this.lastRegisteredAdvanceCount = 0;
        this.advanceCount = 0;
        this.toReverseCount = 0;
        this.funcReturnValue = null;
        this.loopShouldBreak = false;
        this.loopShouldContinue = false;
    }
    registerAdvancement() {
        this.lastRegisteredAdvanceCount = 1;
        this.advanceCount += 1;
    }
    registerBack() {
        this.advanceCount -= this.lastRegisteredAdvanceCount;
        if (this.advanceCount < 0) {
            this.advanceCount = 0;
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
    from(res) {
        this.lastRegisteredAdvanceCount = this.advanceCount;
        this.advanceCount += res.advanceCount;
        if (res.error)
            this.error = res.error;
        this.funcReturnValue = res.funcReturnValue;
        this.loopShouldContinue = res.loopShouldContinue;
        this.loopShouldBreak = res.loopShouldBreak;
        return res.value;
    }
    tryFrom(res) {
        if (res.error) {
            this.toReverseCount = res.advanceCount;
            return null;
        }
        return this.from(res);
    }
    success(value) {
        this.reset();
        this.value = value;
        return this;
    }
    successReturn(value) {
        this.reset();
        this.funcReturnValue = value;
        return this;
    }
    sucessContinue() {
        this.reset();
        this.loopShouldContinue = true;
        return this;
    }
    successBreak() {
        this.reset();
        this.loopShouldBreak = true;
        return this;
    }
    failure(error) {
        if (!this.error || this.advanceCount === 0) {
            this.reset();
            this.error = error;
        }
        return this;
    }
    shouldReturn() {
        return (this.error ||
            this.funcReturnValue ||
            this.loopShouldBreak ||
            this.loopShouldContinue);
    }
}
exports.default = Result;
