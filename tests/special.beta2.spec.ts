import {
  beta,
  incompleteBeta,
  incompleteBetaDerivative,
} from "../src/special/beta";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";

const betaTests = JSON.parse(
  readFileSync("tests/data/special.beta-coverage.json").toString("utf-8")
);

describe("incomplete beta coverage", () => {
  for (let test of betaTests) {
    const a: number = test.a;
    const b: number = test.b;
    const x: number = test.x;
    const inv: boolean = test.inv;
    const norm: boolean = test.norm;
    const der: boolean = test.deriv;
    const p: number = test.p;
    const q: number = (test.q != undefined ? test.q : (Number.MAX_VALUE / 2));
    it(`${test.path}: incompleteBeta(${a}, ${b},  ${x}, { lower: ${!inv}, normalised: ${norm} }) = ${p} (derivative = ${q})`, () => {
      let deriv = der ? { value: Number.NaN } : undefined;
      let res = incompleteBeta(a, b, x, {
        lower: !inv,
        normalised: norm,
        derivative: deriv,
      });
      expect(res).toBeRelativelyCloseTo(p);
    });
  }
});
