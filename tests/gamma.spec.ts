import { Gamma } from "../src/gamma";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";
import { MT19937 } from "../src/random";
import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";

describe("gamma distribution special cases", () => {
  describe("X ~ Γ(2, 2)", () => {
    let Gam = new Gamma(2, 2);
    it("x = 0.5", () => {
      expect(Gam.pdf(0.5)).toBeRelativelyCloseTo(0.09735009788392562368742);
      expect(Gam.pdf(0.5, {log: true})).toBeRelativelyCloseTo(-2.329441541679835747658);
      expect(Gam.cdf(0.5)).toBeRelativelyCloseTo(0.02649902116074392618983);
      expect(Gam.cdf(0.5, {log: true})).toBeRelativelyCloseTo(-3.630647484002578195827);
      expect(Gam.cdf(0.5, { lower: false })).toBeRelativelyCloseTo(0.9735009788392561258519);
    });
    it("x = 2.5", () => {
      expect(Gam.pdf(2.5)).toBeRelativelyCloseTo(0.1790654980376188420976);
      expect(Gam.cdf(2.5)).toBeRelativelyCloseTo(0.3553642070645721684485);
      expect(Gam.cdf(2.5, { lower: false })).toBeRelativelyCloseTo(0.6446357929354278315515);
    });
    it("x = 25", () => {
        expect(Gam.pdf(25)).toBeRelativelyCloseTo(2.329158232549168828173e-05);
        expect(Gam.cdf(25)).toBeRelativelyCloseTo(0.9999496901821769423435);
        expect(Gam.cdf(25, { lower: false })).toBeRelativelyCloseTo(5.030981782306204750169e-05);
      });
    });
});

describe("gamma randoms", () => {
  it("basic test Γ(2, 2)", () => {
    let R = new MT19937(37);
    let Gam = new Gamma(2, 2);
    let xs = [];
    for (let i = 0; i < 1000; ++i) {
      let u = Gam.random(R);
      xs.push(u);
    }
    expect(kolmogorovSmirnov(xs, Gam)).toBeLessThan(0.0275);
  });
  it("vector test Γ(2, 2)", () => {
    let R = new MT19937(37);
    let Gam = new Gamma(2, 2);
    let n = 1000;
    let xs = Gam.random(R, n);
    expect(xs.length).toBe(n);
    expect(kolmogorovSmirnov(xs, Gam)).toBeLessThan(0.0275);
  });
  it("vector test Γ(25, 25)", () => {
    let R = new MT19937(37);
    let Gam = new Gamma(25, 25);
    let n = 1000;
    let xs = Gam.random(R, n);
    expect(xs.length).toBe(n);
    expect(kolmogorovSmirnov(xs, Gam)).toBeLessThan(0.0275);
  });
  it("vector test Γ(0.2, 2)", () => {
    let R = new MT19937(37);
    let Gam = new Gamma(0.2, 2);
    let n = 1000;
    let xs = Gam.random(R, n);
    expect(xs.length).toBe(n);
    expect(kolmogorovSmirnov(xs, Gam)).toBeLessThan(0.0275);
  });
});
