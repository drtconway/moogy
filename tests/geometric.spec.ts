import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";
import { MT19937 } from "../src/random";
import { Geometric } from "../src/geometric";

import { addHelpers } from "./helpers";
addHelpers();

describe("basic geometric distribution tests", () => {
    const Geo = new Geometric(0.125);
    it("pdf", () => {
        expect(Geo.pdf(3)).toBeRelativelyCloseTo(0.083740234375);
        expect(Geo.pdf(3, {log: true})).toBeRelativelyCloseTo(-2.480035719553403517068);
    });
    it("cdf lower", () => {
        expect(Geo.cdf(3, {lower: true, log: false})).toBeRelativelyCloseTo(0.413818359375);
        expect(Geo.cdf(3, {lower: true, log: true})).toBeRelativelyCloseTo(-0.8823281469047931091509);
    });
    it("cdf upper", () => {
        expect(Geo.cdf(3, {lower: false, log: false})).toBeRelativelyCloseTo(0.586181640625);
        expect(Geo.cdf(3, {lower: false, log: true})).toBeRelativelyCloseTo(-0.5341255704980905072432);
    });
});

describe("gamma randoms", () => {
    it("basic test", () => {
      let R = new MT19937(37);
      let Geo = new Geometric(0.125);
      let xs = [];
      for (let i = 0; i < 1000; ++i) {
        let u = Geo.random(R);
        xs.push(u);
      }
      expect(kolmogorovSmirnov(xs, Geo)).toBeLessThan(0.125);
    });
    it("vector test", () => {
      let R = new MT19937(37);
      let Geo = new Geometric(0.125);
      let n = 1000;
      let xs = Geo.random(R, n);
      expect(xs.length).toBe(n);
      expect(kolmogorovSmirnov(xs, Geo)).toBeLessThan(0.125);
    });
  });
  