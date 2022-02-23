import { Binomial } from "../src/binomial";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";
import { MT19937 } from "../src/random";
import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";

const S: number = 0.25;

describe("binomial distribution special cases", () => {
  it("Bin(50, 0.125)", () => {
    let Bin = new Binomial(50, 0.125);
    expect(Bin.pdf(10)).toBeRelativelyCloseTo(0.04582358070337413241679);
    expect(Bin.pdf(10, {log: true})).toBeRelativelyCloseTo(-3.082956457839142405675);
    expect(Bin.cdf(10, {lower: true, log: false})).toBeRelativelyCloseTo(0.9579301614190229852142);
    expect(Bin.cdf(10, {lower: true, log: true})).toBeRelativelyCloseTo(-0.04298040406631911669599);
    expect(Bin.cdf(10, {lower: false, log: false})).toBeRelativelyCloseTo(0.04206983858097696621359);
    expect(Bin.cdf(10, {lower: false, log: true})).toBeRelativelyCloseTo(-3.168424218302282824311);
    });
});

const tests = JSON.parse(readFileSync("tests/data/binomial.json").toString("utf-8"));
//const tests = JSON.parse('[]');

describe("binomial pdf", () => {
  for (let testGroup of tests) {
    const N: number = testGroup.N;
    const p: number = testGroup.p;
    const q: number = testGroup.q;
    expect(Number.isInteger(N)).toBe(true);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
    expect(q).toBeGreaterThan(0);
    expect(q).toBeLessThan(1);
    const Bp = new Binomial(N, p);
    const Bq = new Binomial(N, q);
    for (let test of testGroup.values) {
      if (Math.random() > S) {
        continue;
      }
      const k: number = test.k;
      it(`B(${N}, ${p}, X = ${k})`, () => {
        expect(Bp.pdf(k)).toBeRelativelyCloseTo(test["p.pdf"], 8);
        expect(Bp.pdf(k, { log: false })).toBeRelativelyCloseTo(test["p.pdf"], 8);
      });
      it(`B(${N}, ${q}, X = ${k})`, () => {
        expect(Bq.pdf(k)).toBeRelativelyCloseTo(test["q.pdf"], 8);
        expect(Bq.pdf(k, { log: false })).toBeRelativelyCloseTo(test["q.pdf"], 8);
      });
    }
  }
});

describe("binomial log pdf", () => {
  for (let testGroup of tests) {
    const N: number = testGroup.N;
    const p: number = testGroup.p;
    const q: number = testGroup.q;
    expect(Number.isInteger(N)).toBe(true);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
    expect(q).toBeGreaterThan(0);
    expect(q).toBeLessThan(1);
    const Bp = new Binomial(N, p);
    const Bq = new Binomial(N, q);
    for (let test of testGroup.values) {
      if (Math.random() > S) {
        continue;
      }
      const k: number = test.k;
      it(`B(${N}, ${p}, X = ${k})`, () => {
        expect(Bp.pdf(k, { log: true })).toBeRelativelyCloseTo(test["p.pdf.log"], 9);
      });
      it(`B(${N}, ${q}, X = ${k})`, () => {
        expect(Bq.pdf(k, { log: true })).toBeRelativelyCloseTo(test["q.pdf.log"], 9);
      });
    }
  }
});

describe("binomial lower cdf", () => {
  for (let testGroup of tests) {
    const N: number = testGroup.N;
    const p: number = testGroup.p;
    const q: number = testGroup.q;
    expect(Number.isInteger(N)).toBe(true);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
    expect(q).toBeGreaterThan(0);
    expect(q).toBeLessThan(1);
    const Bp = new Binomial(N, p);
    const Bq = new Binomial(N, q);
    for (let test of testGroup.values) {
      if (Math.random() > S) {
        continue;
      }
      const k: number = test.k;
      it(`B(${N}, ${p}, X = ${k})`, () => {
        expect(Bp.cdf(k)).toBeRelativelyCloseTo(test["p.cdf.lower"], 9);
      });
      it(`B(${N}, ${q}, X = ${k})`, () => {
        expect(Bq.cdf(k)).toBeRelativelyCloseTo(test["q.cdf.lower"], 9);
      });
    }
  }
});

describe("binomial randoms", () => {
  it("basic test small m", () => {
    let R = new MT19937(37);
    let Bin = new Binomial(80, 0.125);
    let xs = [];
    for (let i = 0; i < 1000; ++i) {
      let u = Bin.random(R);
      xs.push(u);
    }
    expect(kolmogorovSmirnov(xs, Bin)).toBeLessThan(0.135);
  });
  it("vector test small m", () => {
    let R = new MT19937(37);
    let Bin = new Binomial(80, 0.125);
    let n = 1000;
    let xs = Bin.random(R, n);
    expect(xs.length).toBe(n);
    expect(kolmogorovSmirnov(xs, Bin)).toBeLessThan(0.135);
  });
  it("basic test large m", () => {
    let R = new MT19937(37);
    let Bin = new Binomial(800, 0.125);
    let xs = [];
    for (let i = 0; i < 1000; ++i) {
      let u = Bin.random(R);
      xs.push(u);
    }
    expect(kolmogorovSmirnov(xs, Bin)).toBeLessThan(0.125);
  });
  it("vector test large m", () => {
    let R = new MT19937(37);
    let Bin = new Binomial(800, 0.125);
    let n = 1000;
    let xs = Bin.random(R, n);
    expect(xs.length).toBe(n);
    expect(kolmogorovSmirnov(xs, Bin)).toBeLessThan(0.125);
  });
  });
