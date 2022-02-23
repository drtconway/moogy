import { Binomial } from "../src/binomial";

import { addHelpers } from "./helpers";
addHelpers();

import { readFileSync } from "fs";
import { MT19937 } from "../src/random";
import { kolmogorovSmirnov } from "../src/kolmogorov-smirnov";
import { choose } from "../src/special/gamma";

function binomTail(k : number, n : number, p: number, lower: boolean = true) : number {
    if (!lower) {
        return binomTail(n - k + 1, n, 1 - p, !lower);
    }
    let q = 1 - p;
    let s = 0;
    let pk = 1;
    let qnmk = Math.pow(q, n);
    let pdf = qnmk;
    let poq = p / q;
    let cdf = pdf;
    let res: number[] = [cdf];
    for (let i = 0; i < k; ++i) {
        pdf *= (n - i)/(i + 1) * poq;
        cdf += pdf;
        res.push(cdf);
    }
    console.log(JSON.stringify(res));
    return cdf;
}

describe("tail of binomial distribution", () => {
    it("binomTail", () => {
        binomTail(15, 5000, 0.1325, true);
    });
});