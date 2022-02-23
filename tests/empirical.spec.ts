import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";
import { MT19937 } from "../src/random";
import { Empirical } from "../src/empirical";

import { addHelpers } from "./helpers";
addHelpers();

describe("empirical cdf", () => {
    const xs : number[] = [];
    for (let i = 0; i < 100; ++i) {
        xs.push(i);
    }
    const Ed = new Empirical(xs);
    it("empirical pdf", () => {
        expect(() => {
            let p = Ed.pdf(1);
        }).toThrow("no pdf method for empirical distributions.");
    });
    it("empirical cdf", () => {
        expect(Ed.cdf(-1, {lower: true, log: false})).toBe(0);
        expect(Ed.cdf(-1, {lower: true, log: true})).toBe(-Infinity);
        expect(Ed.cdf(-1, {lower: false, log: false})).toBe(1);
        expect(Ed.cdf(-1, {lower: false, log: true})).toBe(0);
        expect(Ed.cdf(100, {lower: true, log: false})).toBe(1);
        expect(Ed.cdf(100, {lower: true, log: true})).toBe(0);
        expect(Ed.cdf(100, {lower: false, log: false})).toBe(0);
        expect(Ed.cdf(100, {lower: false, log: true})).toBe(-Infinity);
        expect(Ed.cdf(75, {lower: true, log: false})).toBe(0.75);
        expect(Ed.cdf(75, {lower: true, log: true})).toBe(Math.log(0.75));
        expect(Ed.cdf(75, {lower: false, log: false})).toBe(0.25);
        expect(Ed.cdf(75, {lower: false, log: true})).toBe(Math.log(0.25));
        });
});

describe("empirical randoms", () => {
    const xs : number[] = [];
    for (let i = 0; i < 100; ++i) {
        xs.push(i);
    }
    const Ed = new Empirical(xs);

    it("basic test", () => {
      let R = new MT19937(37);
      let xs = [];
      for (let i = 0; i < 1000; ++i) {
        let u = Ed.random(R);
        xs.push(u);
      }
      expect(kolmogorovSmirnov(xs, Ed)).toBeLessThan(0.05);
    });
    it("vector test", () => {
      let R = new MT19937(37);
      let n = 1000;
      let xs = Ed.random(R, n);
      expect(xs.length).toBe(n);
      expect(kolmogorovSmirnov(xs, Ed)).toBeLessThan(0.05);
    });
  });
  