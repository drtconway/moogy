import { erf, erfc } from "../src/special/erf";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";

const S: number = 0.25;

const tests = JSON.parse(readFileSync("tests/data/special.erf.json").toString("utf-8"));

describe("erf tests", () => {
    for (let test of tests) {
        it(`erf(${test.z}) = ${test.erf}`, () => {
            expect(erf(test.z)).toBeRelativelyCloseTo(test.erf, 14);
        });
    }
});

describe("erfc tests", () => {
    for (let test of tests) {
        it(`erfc(${test.z}) = ${test.erfc}`, () => {
            expect(erfc(test.z)).toBeRelativelyCloseTo(test.erfc, 11);
        });
    }
});