import { readFileSync } from "fs";
import { choose, factorial, logChoose, logFactorial, poly, frexp, ldexp, contFracA, contFracB, sumSeries } from "../src/internal/utils";

import { addHelpers } from "./helpers";
addHelpers();

describe("factorials", () => {
  it("0!", () => {
    expect(factorial(0)).toBe(1);
  });
  it("3!", () => {
    expect(factorial(3)).toBe(6);
  });
  it("8!", () => {
    expect(factorial(8)).toBe(40320);
  });
  it("25!", () => {
    expect(factorial(25)).toBe(15511210043330985984000000);
  });
  it("250!", () => {
    expect(factorial(250)).toBe(Infinity);
  });
  it("2500!", () => {
    expect(factorial(2500)).toBe(Infinity);
  });
});

describe("choose", () => {
  it("3 choose 1", () => {
    expect(choose(3, 1)).toBe(3);
  });
  it("3 choose 3", () => {
    expect(choose(3, 3)).toBe(1);
  });
  it("4 choose 1", () => {
    expect(choose(4, 1)).toBe(4);
  });
  it("5 choose 5", () => {
    expect(choose(5, 5)).toBe(1);
  });
  it("6 choose 3", () => {
    expect(choose(6, 3)).toBe(20);
  });
  it("7 choose 4", () => {
    expect(choose(7, 4)).toBe(35);
  });
  it("9 choose 6", () => {
    expect(choose(9, 6)).toBe(84);
  });
  it("11 choose 9", () => {
    expect(choose(11, 9)).toBe(55);
  });
  it("13 choose 11", () => {
    expect(choose(13, 11)).toBe(78);
  });
  it("16 choose 3", () => {
    expect(choose(16, 3)).toBe(560);
  });
  it("20 choose 3", () => {
    expect(choose(20, 3)).toBe(1140);
  });
  it("25 choose 8", () => {
    expect(choose(25, 8)).toBe(1081575);
  });
  it("30 choose 6", () => {
    expect(choose(30, 6)).toBe(593775);
  });
  it("37 choose 35", () => {
    expect(choose(37, 35)).toBe(666);
  });
  it("45 choose 24", () => {
    expect(choose(45, 24)).toBe(3773655750150);
  });
  it("55 choose 34", () => {
    expect(choose(55, 34)).toBe(841728816603675);
  });
});

describe("log factorials", () => {
  it("log 0!", () => {
    expect(logFactorial(0)).toBe(0);
  });
  it("log 3!", () => {
    expect(logFactorial(3)).toBeRelativelyCloseTo(1.791759469228055);
  });
  it("log 8!", () => {
    expect(logFactorial(8)).toBeRelativelyCloseTo(10.60460290274525);
  });
  it("log 25!", () => {
    expect(logFactorial(25)).toBeRelativelyCloseTo(58.00360522298052);
  });
  it("log 250!", () => {
    expect(logFactorial(250)).toBeRelativelyCloseTo(1134.0452317908532);
  });
  it("log 2500!", () => {
    expect(logFactorial(2500)).toBeCloseTo(17064.9460220127);
  });
});

describe("log choose", () => {
  it("log 3 choose 2", () => {
    expect(logChoose(3, 2)).toBeRelativelyCloseTo(1.098612288668109782108);
  });
  it("log 4 choose 3", () => {
    expect(logChoose(4, 3)).toBeRelativelyCloseTo(1.386294361119890572454);
  });
  it("log 6 choose 0", () => {
    expect(logChoose(6, 0)).toBeRelativelyCloseTo(0);
  });
  it("log 9 choose 9", () => {
    expect(logChoose(9, 9)).toBeRelativelyCloseTo(0);
  });
  it("log 13 choose 3", () => {
    expect(logChoose(13, 3)).toBeRelativelyCloseTo(5.655991810819852361192);
  });
  it("log 20 choose 16", () => {
    expect(logChoose(20, 16)).toBeRelativelyCloseTo(8.48570252432486782368);
  });
  it("log 30 choose 4", () => {
    expect(logChoose(30, 4)).toBeRelativelyCloseTo(10.218480757480218557021);
  });
  it("log 45 choose 41", () => {
    expect(logChoose(45, 41)).toBeRelativelyCloseTo(11.911668027317565687895);
  });
  it("log 67 choose 32", () => {
    expect(logChoose(67, 32)).toBeRelativelyCloseTo(44.042799054152098392478);
  });
  it("log 99 choose 91", () => {
    expect(logChoose(99, 91)).toBeRelativelyCloseTo(25.866103340103968832864);
  });
  it("log 148 choose 146", () => {
    expect(logChoose(148, 146)).toBeRelativelyCloseTo(9.294497679982903548535);
  });
  it("log 221 choose 69", () => {
    expect(logChoose(221, 69)).toBeRelativelyCloseTo(134.360539462223584905587);
  });
  it("log 330 choose 309", () => {
    expect(logChoose(330, 309)).toBeRelativelyCloseTo(75.750841038981178598988);
  });
  it("log 493 choose 106", () => {
    expect(logChoose(493, 106)).toBeRelativelyCloseTo(253.485674325242030135996);
  });
  it("log 1097 choose 492", () => {
    expect(logChoose(1097, 492)).toBeRelativelyCloseTo(750.831301255769631097792);
  });
});

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