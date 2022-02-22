import { beta, incompleteBeta } from "../src/special/beta";

import { addHelpers } from "./helpers";
addHelpers();

describe("beta special cases", () => {
  it("beta(1, 1)", () => {
    expect(beta(1, 1)).toBe(1);
  });
  it("beta(1, 2)", () => {
    expect(beta(1, 2)).toBe(0.5);
  });
  it("beta(2, 1)", () => {
    expect(beta(2, 1)).toBe(0.5);
  });
  it("beta(0.125, 1 - 0.125) = π/sin(0.125π)", () => {
    expect(beta(0.125, 1 - 0.125)).toBeRelativelyCloseTo(Math.PI / Math.sin(Math.PI * 0.125));
  });
  it("beta(2, 2) = 1/6", () => {
    expect(beta(2, 2)).toBeRelativelyCloseTo(1 / 6);
  });
  it("beta(3, 2) = 1/12", () => {
    expect(beta(3, 2)).toBeRelativelyCloseTo(1 / 12);
  });
  it("beta(5, 4) = 1/280", () => {
    expect(beta(5, 4)).toBeRelativelyCloseTo(1 / 280);
  });
});

import { readFileSync } from "fs";

const betaTests = JSON.parse(readFileSync("tests/data/special.beta.json").toString("utf-8"));

describe("beta parameter sweep", () => {
  for (let test of betaTests) {
    it(`beta(${test.a}, ${test.b}) = ${test.beta}`, () => {
      expect(beta(test.a, test.b)).toBeRelativelyCloseTo(test.beta);
    });
  }
});
