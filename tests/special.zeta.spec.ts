import { zeta } from "../src/special/zeta";

import { addHelpers } from "./helpers";
addHelpers();

describe("zeta function special cases", () => {
  it(`zeta(42) = 1.000000000000227373675`, () => {
    expect(zeta(42)).toBeRelativelyCloseTo(1.000000000000227373675);
  });
  it(`zeta(42.3) = 1.000000000000184519067`, () => {
    expect(zeta(42.3)).toBeRelativelyCloseTo(1.000000000000184519067);
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
