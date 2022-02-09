import { Binomial } from "../src/binomial";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";

const S: number = 0.25;

const tests = JSON.parse(readFileSync("tests/data/binomial.json").toString("utf-8"));

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
