import { readFileSync } from "fs";
import { poly, frexp, ldexp, contFracA, contFracB, sumSeries, cosPi } from "../src/internal/utils";

import { addHelpers } from "./helpers";
addHelpers();


describe("polynomial evaluation", () => {
  it("order 0", () => {
    const P: number[] = [2];
    expect(poly(P, 0.125)).toBe(2.0);
    expect(poly(P, 0.25)).toBe(2.0);
  });
  it("order 1", () => {
    const P: number[] = [3, 1];
    expect(poly(P, 0.125)).toBe(3.125);
    expect(poly(P, 10247.25)).toBe(10250.25);
  });
});

const frexpTests = JSON.parse(readFileSync("tests/data/utils.frexp.json").toString("utf-8"));

describe("frexp & ldexp", () => {
  for (let test of frexpTests) {
    it(`${test.value} <-> <${test.mantissa}, ${test.exponent}`, () => {
      const res = frexp(test.value);
      expect(res[0]).toBeRelativelyCloseTo(test.mantissa, 14);
      expect(res[1]).toBe(test.exponent);
      expect(ldexp(test.mantissa, test.exponent)).toBeRelativelyCloseTo(test.value, 14);
    });
  }
});

describe("continued fraction type A", () => {
    const uigTerms = (a1 : number, z1: number) : () => [number, number] => {
        let z = z1 - a1 + 1;
        let a = a1;
        let k = 0;
        return () => {
            k += 1;
            z += 2;
            return [k*(a - k), z];
        };
    };

    const gammaQ = (a : number, z : number) : number => {
        return (z**a) /(Math.exp(z) * (z - a + 1 + contFracA(uigTerms(a, z), 1e-20, 40)));
    }
    it("gammaQ", () => {
        expect(gammaQ(3, 3)).toBeRelativelyCloseTo(0.8463801622536870628011);
        expect(gammaQ(4, 3)).toBeRelativelyCloseTo(3.883391332693387099084);
    });
});

describe("continued fraction type B", () => {
    it("golden ratio", () => {
        let terms : () => [number, number] = () => [1, 1];
        expect(contFracB(terms, 1e-15, 40)).toBeRelativelyCloseTo((1 + Math.sqrt(5))/2);
    });

    const tanTerms = (theta: number) : () => [number, number] => {
        let a = -theta * theta;
        let b = -1;
        return () => {
            b += 2;
            return [a, b];
        };
    };

    const myTan = (theta: number) : number => {
        return theta / contFracB(tanTerms(theta), 1e-15, 40);
    };

    it("tan", () => {
        expect(myTan(0.35)).toBeRelativelyCloseTo(Math.tan(0.35));
    });
});

describe("series summation", () => {
    const log1pTerms = (x : number) : () => number => {
        let k = 0;
        let m = -x;
        let p = -1;
        return () => {
            p *= m;
            k += 1;
            return p/k;
        };
    };
    
    const myLog1p = (x : number) : number => {
        return sumSeries(log1pTerms(x), 1e-20, 1000);
    };

    it("log1p", () => {
        expect(myLog1p(0.5)).toBeRelativelyCloseTo(Math.log1p(0.5));
        expect(myLog1p(-0.5)).toBeRelativelyCloseTo(Math.log1p(-0.5));
    });
});

describe("cosPi", () => {
    it("x = -24.8", () => {
        let x : number = -24.8;
        expect(cosPi(x)).toBeRelativelyCloseTo(Math.cos(Math.PI*x));
    });
    it("x = 25.8", () => {
        let x : number = 25.8;
        expect(cosPi(x)).toBeRelativelyCloseTo(Math.cos(Math.PI*x));
    });

});