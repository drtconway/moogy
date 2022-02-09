import { Empirical } from "../src/empirical";

import { addHelpers } from "./helpers";
addHelpers();

describe("empirical cdf", () => {
    const xs : number[] = [];
    for (let i = 0; i < 100; ++i) {
        xs.push(i);
    }
    it("empirical cdf", () => {
        const Ed = new Empirical(xs);
        expect(Ed.cdf(-1)).toBe(0);
        expect(Ed.cdf(100)).toBe(1);
        expect(Ed.cdf(50)).toBe(0.5);
        expect(Ed.cdf(25)).toBe(0.25);
        expect(Ed.cdf(75)).toBe(0.75);
    });
});