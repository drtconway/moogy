import { NegativeBinomial } from "../src/negative-binomial";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";
import { MT19937 } from "../src/random";
import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";

describe("basic tests for negative binomial", () => {
  let NB = new NegativeBinomial(4, 0.25);
  it("pdf", () => {
    expect(NB.pdf(7)).toBeRelativelyCloseTo(0.0625705718994140625);
    expect(NB.pdf(7, {log: true})).toBeRelativelyCloseTo(-2.771460208859982898844);
    expect(NB.pdf(25)).toBeRelativelyCloseTo(0.009630204566205240526711);
    expect(NB.pdf(25, {log: true})).toBeRelativelyCloseTo(-4.64285081080112504992);
});
  it("cdf", () => {
    expect(NB.cdf(7, { lower: true, log: false })).toBeRelativelyCloseTo(0.2866954803466797985223);
    expect(NB.cdf(7, { lower: true, log: true })).toBeRelativelyCloseTo(-1.249334670616514930686);
    expect(NB.cdf(7, { lower: false, log: false })).toBeRelativelyCloseTo(0.7133045196533202014777);
    expect(NB.cdf(7, { lower: false, log: true })).toBeRelativelyCloseTo(-0.3378468534595333583326);
    expect(NB.cdf(25, { lower: true, log: false })).toBeRelativelyCloseTo(0.9544946377640850521118);
    expect(NB.cdf(25, { lower: true, log: true })).toBeRelativelyCloseTo(-0.04657325368011382138445);
    expect(NB.cdf(25, { lower: false, log: false })).toBeRelativelyCloseTo(0.04550536223591496176599);
    expect(NB.cdf(25, { lower: false, log: true })).toBeRelativelyCloseTo(-3.089925108630365624407);
  });
});

describe("chi-squared randoms", () => {
  it("basic test", () => {
    let R = new MT19937(37);
    let NB = new NegativeBinomial(25, 0.25);
    let xs = [];
    for (let i = 0; i < 1000; ++i) {
      let u = NB.random(R);
      xs.push(u);
    }
    expect(kolmogorovSmirnov(xs, NB)).toBeLessThan(0.05);
  });
  it("vector test", () => {
    let R = new MT19937(37);
    let NB = new NegativeBinomial(25, 0.25);
    let n = 1000;
    let xs = NB.random(R, n);
    expect(xs.length).toBe(n);
    expect(kolmogorovSmirnov(xs, NB)).toBeLessThan(0.05);
  });
});
