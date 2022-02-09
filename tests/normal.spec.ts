import { Normal } from "../src/normal";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";

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
