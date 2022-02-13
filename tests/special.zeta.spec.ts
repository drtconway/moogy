import { zeta } from "../src/special/zeta";

import { addHelpers } from "./helpers";
addHelpers();

describe("zeta function special cases", () => {
  it(`zeta(1e-16) = -0.5`, () => {
    expect(zeta(1e-16)).toBeRelativelyCloseTo(-0.5);
  });
  it(`zeta(42) = 1.000000000000227373675`, () => {
    expect(zeta(42)).toBeRelativelyCloseTo(1.000000000000227373675);
  });
  it(`zeta(42.3) = 1.000000000000184519067`, () => {
    expect(zeta(42.3)).toBeRelativelyCloseTo(1.000000000000184519067);
  });
  it(`zeta(70) = 1`, () => {
    expect(zeta(70)).toBeRelativelyCloseTo(1);
  });
  it(`zeta(70.3) = 1`, () => {
    expect(zeta(70.3)).toBeRelativelyCloseTo(1);
  });
  it(`zeta(85 = 1`, () => {
    expect(zeta(85)).toBeRelativelyCloseTo(1);
  });
  it(`zeta(85.3) = 1`, () => {
    expect(zeta(85.3)).toBeRelativelyCloseTo(1);
  });
  it(`zeta(86 = 1`, () => {
    expect(zeta(86)).toBeRelativelyCloseTo(1);
  });
  it(`zeta(87 = 1`, () => {
    expect(zeta(87)).toBeRelativelyCloseTo(1);
  });
  it(`zeta(120 = 1`, () => {
    expect(zeta(120)).toBeRelativelyCloseTo(1);
  });
  it(`zeta(1200 = 1`, () => {
    expect(zeta(1200)).toBeRelativelyCloseTo(1);
  });
});

import { readFileSync } from "fs";

const tests = JSON.parse(readFileSync("tests/data/special.zeta.json").toString("utf-8"));

describe("zeta function parameter sweep", () => {
  for (let test of tests) {
    it(`zeta(${test.s}) = ${test.zeta}`, () => {
      let digits = 9;
      if (test.s < -18) {
        digits = 5;
      }
      expect(zeta(test.s)).toBeRelativelyCloseTo(test.zeta, digits);
    });
  }
});
