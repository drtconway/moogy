import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";
import { MT19937 } from "../src/random";
import { Exponential } from "../src/exponential";

import { addHelpers } from "./helpers";
addHelpers();

describe("basic exponential distribution tests", () => {
  const Exp = new Exponential(0.125);
  it("pdf", () => {
    expect(Exp.pdf(3)).toBeRelativelyCloseTo(0.08591115984887152945415);
    expect(Exp.pdf(3, { log: true })).toBeRelativelyCloseTo(-2.454441541679835747658);
  });
  it("cdf lower", () => {
    expect(Exp.cdf(3, { lower: true, log: false })).toBeRelativelyCloseTo(0.3127107212090278198779);
    expect(Exp.cdf(3, { lower: true, log: true })).toBeRelativelyCloseTo(-1.162476729180193846247);
  });
  it("cdf upper", () => {
    expect(Exp.cdf(3, { lower: false, log: false })).toBeRelativelyCloseTo(0.6872892787909722356332);
    expect(Exp.cdf(3, { lower: false, log: true })).toBeRelativelyCloseTo(-0.375);
  });
});

describe("Exponential randoms", () => {
  it("basic test", () => {
    let R = new MT19937(37);
    let Exp = new Exponential(0.125);
    let xs = [];
    for (let i = 0; i < 1000; ++i) {
      let u = Exp.random(R);
      xs.push(u);
    }
    expect(kolmogorovSmirnov(xs, Exp)).toBeLessThan(0.02);
  });
  it("vector test", () => {
    let R = new MT19937(37);
    let Exp = new Exponential(0.125);
    let n = 1000;
    let xs = Exp.random(R, n);
    expect(xs.length).toBe(n);
    expect(kolmogorovSmirnov(xs, Exp)).toBeLessThan(0.02);
  });
});
