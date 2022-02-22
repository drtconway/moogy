import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";
import { MT19937 } from "../src/random";
import { Poisson } from "../src/poisson";

import { addHelpers } from "./helpers";
addHelpers();

describe("basic poisson distribution tests", () => {
    const Poi = new Poisson(3.5);
    it("pdf", () => {
        expect(Poi.pdf(11)).toBeRelativelyCloseTo(0.0007304022176867057966967);
        expect(Poi.pdf(11, {log: true})).toBeRelativelyCloseTo(-7.221915192424836149598);
    });
    it("cdf lower", () => {
        expect(Poi.cdf(11, {lower: true, log: false})).toBeRelativelyCloseTo(0.9997110077800697158779);
        expect(Poi.cdf(11, {lower: true, log: true})).toBeRelativelyCloseTo(-0.0002890339862288414949157);
    });
    it("cdf upper", () => {
        expect(Poi.cdf(11, {lower: false, log: false})).toBeRelativelyCloseTo(0.0002889922199303006020155);
        expect(Poi.cdf(11, {lower: false, log: true})).toBeRelativelyCloseTo(-8.149110790870608411751);
    });
});

describe("poisson randoms", () => {
    it("basic test", () => {
      let R = new MT19937(37);
      let Poi = new Poisson(35);
      let xs = [];
      for (let i = 0; i < 1000; ++i) {
        let u = Poi.random(R);
        xs.push(u);
      }
      expect(kolmogorovSmirnov(xs, Poi)).toBeLessThan(0.125);
    });
    it("vector test", () => {
      let R = new MT19937(37);
      let Poi = new Poisson(35);
      let n = 1000;
      let xs = Poi.random(R, n);
      expect(xs.length).toBe(n);
      expect(kolmogorovSmirnov(xs, Poi)).toBeLessThan(0.125);
    });
  });
  