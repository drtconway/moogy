import { Normal } from "../src/normal";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";
import { MT19937 } from "../src/random";
import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";

const S: number = 1.0;

const tests = JSON.parse(readFileSync("tests/data/normal.json").toString("utf-8"));

describe("normal pdf", () => {
  for (let testGroup of tests) {
    const mu: number = testGroup.mu;
    const sigma: number = testGroup.sigma;
    const Nd = new Normal(mu, sigma);
    for (let test of testGroup.values) {
      if (Math.random() > S) {
        continue;
      }
      const z: number = test.z;
      it(`Nd(${mu}, ${sigma}, X = ${z})`, () => {
        expect(Nd.pdf(z)).toBeRelativelyCloseTo(test["pdf"], 12);
        expect(Nd.pdf(z, { log: false })).toBeRelativelyCloseTo(test["pdf"], 12);
      });
    }
  }
});

describe("normal log pdf", () => {
  for (let testGroup of tests) {
    const mu: number = testGroup.mu;
    const sigma: number = testGroup.sigma;
    const Nd = new Normal(mu, sigma);
    for (let test of testGroup.values) {
      if (Math.random() > S) {
        continue;
      }
      const z: number = test.z;
      it(`Nd(${mu}, ${sigma}, X = ${z})`, () => {
        expect(Nd.pdf(z, { log: true })).toBeRelativelyCloseTo(test["pdf.log"], 12);
      });
    }
  }
});

describe("normal lower cdf", () => {
  it("bad value test", () => {
    const Nd = new Normal(0, 1);
    const z = 7.743188277706759770069;
    expect(Nd.cdf(z, { log: true })).toBeRelativelyCloseTo(-4.84771526051599e-15, 12);
  });
  for (let testGroup of tests) {
    const mu: number = testGroup.mu;
    const sigma: number = testGroup.sigma;
    const Nd = new Normal(mu, sigma);
    for (let test of testGroup.values) {
      if (Math.random() > S) {
        continue;
      }
      const z: number = test.z;
      it(`Nd(${mu}, ${sigma}, X = ${z})`, () => {
        expect(Nd.cdf(z)).toBeRelativelyCloseTo(test["cdf.lower"], 12);
        expect(Nd.cdf(z, { log: true })).toBeRelativelyCloseTo(test["cdf.lower.log"], 9);
      });
    }
  }
});

describe("normal upper cdf", () => {
  for (let testGroup of tests) {
    const mu: number = testGroup.mu;
    const sigma: number = testGroup.sigma;
    const Nd = new Normal(mu, sigma);
    for (let test of testGroup.values) {
      if (Math.random() > S) {
        continue;
      }
      const z: number = test.z;
      const az0 = Math.abs((z - mu) / sigma);
      it(`Nd(${mu}, ${sigma}, X = ${z})`, () => {
        expect(Nd.cdf(z, { lower: false })).toBeRelativelyCloseTo(test["cdf.upper"], 12);
        if (az0 < 3) {
          expect(Nd.cdf(z, { lower: false, log: true })).toBeRelativelyCloseTo(test["cdf.upper.log"], 13);
        }
        if (3 <= az0 && az0 < 5) {
          expect(Nd.cdf(z, { lower: false, log: true })).toBeRelativelyCloseTo(test["cdf.upper.log"], 10);
        }
        if (5 <= az0 && az0 < 7) {
          expect(Nd.cdf(z, { lower: false, log: true })).toBeRelativelyCloseTo(test["cdf.upper.log"], 8);
        }
        if (az0 >= 7) {
            expect(Nd.cdf(z, { lower: false, log: true })).toBeRelativelyCloseTo(test["cdf.upper.log"], 7);
        }
      });
    }
  }
});

describe("normal randoms", () => {
  it("basic test", () => {
    let R = new MT19937(37);
    let Nd = new Normal(0, 1);
    let n = 0;
    let s = 0;
    let s2 = 0;
    let xs = [];
    for (let i = 0; i < 1000; ++i) {
      let u = Nd.random(R);
      n += 1;
      s += u;
      s2 += u * u;
      xs.push(u);
    }
    let m = s / n;
    let sd = Math.sqrt(s2 / n - m * m);
    expect(m).toBeGreaterThan(-0.02);
    expect(m).toBeLessThan(0.02);
    expect(sd).toBeGreaterThan(0.95);
    expect(sd).toBeLessThan(1.05);
    expect(kolmogorovSmirnov(xs, Nd)).toBeLessThan(0.025);
  });
  it("vector test", () => {
    let R = new MT19937(37);
    let Nd = new Normal(10, 10);
    let n = 1000;
    let xs = Nd.random(R, n);
    expect(xs.length).toBe(n);
    expect(kolmogorovSmirnov(xs, Nd)).toBeLessThan(0.025);
  });
});
