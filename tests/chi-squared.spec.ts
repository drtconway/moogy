import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";
import { MT19937 } from "../src/random";
import { ChiSquared } from "../src/chi-squared";

import { addHelpers } from "./helpers";
addHelpers();

describe("basic chi-squared distribution tests", () => {
    const CS = new ChiSquared(3);
    it("pdf", () => {
        expect(CS.pdf(3.5)).toBeRelativelyCloseTo(0.1296966458331184623987);
        expect(CS.pdf(3.5, {log: true})).toBeRelativelyCloseTo(-2.042557048956988641208);
    });
    it("cdf lower", () => {
        expect(CS.cdf(3.5, {lower: true, log: false})).toBeRelativelyCloseTo(0.6792378791943610716331);
        expect(CS.cdf(3.5, {lower: true, log: true})).toBeRelativelyCloseTo(-0.3867838752303864313653);
    });
    it("cdf upper", () => {
        expect(CS.cdf(3.5, {lower: false, log: false})).toBeRelativelyCloseTo(0.3207621208056389283669);
        expect(CS.cdf(3.5, {lower: false, log: true})).toBeRelativelyCloseTo(-1.137055487250605123606);
    });
});

describe("chi-squared randoms", () => {
    it("basic test", () => {
      let R = new MT19937(37);
      let CS = new ChiSquared(3);
      let xs = [];
      for (let i = 0; i < 1000; ++i) {
        let u = CS.random(R);
        xs.push(u);
      }
      expect(kolmogorovSmirnov(xs, CS)).toBeLessThan(0.125);
    });
    it("vector test", () => {
      let R = new MT19937(37);
      let CS = new ChiSquared(3);
      let n = 1000;
      let xs = CS.random(R, n);
      expect(xs.length).toBe(n);
      expect(kolmogorovSmirnov(xs, CS)).toBeLessThan(0.125);
    });
  });
  