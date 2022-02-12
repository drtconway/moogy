import { zeta } from "../src/special/zeta";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";

const tests = JSON.parse(readFileSync("tests/data/special.zeta.json").toString("utf-8"));

describe("normal pdf", () => {
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
  