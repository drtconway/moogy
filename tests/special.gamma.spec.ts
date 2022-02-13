import { choose, factorial, gamma, logChoose, logFactorial, logGamma, scaledGamma, sinpx } from "../src/special/gamma";

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
    expect(() => factorial(250)).toThrow('gamma overflow (251)');
  });
  it("2500!", () => {
    expect(() => factorial(2500)).toThrow('gamma overflow (2501)');
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

describe("sinpx = x * sin(pi * x)", () => {
  it("x = 5/2", () => {
    expect(sinpx(5 / 2)).toBeRelativelyCloseTo(
      (5 / 2) * Math.sin((Math.PI * 5) / 2),
      15
    );
  });
});

describe("scaled gamma: gamma(z) / (z/e)^z", () => {
  expect(scaledGamma(20.5)).toBeRelativelyCloseTo(0.5558764668018836285768, 14);
});

describe("gamma special values", () => {
  it("Γ(n) for small integers", () => {
    expect(gamma(1)).toBe(1);
    expect(gamma(4)).toBe(6);
    expect(gamma(5)).toBe(24);
  });
  it("Γ(1/2) = sqrt(π)", () => {
    expect(gamma(1 / 2)).toBeRelativelyCloseTo(Math.sqrt(Math.PI), 15);
  });
  it("Γ(-1/2) = -2 * sqrt(π)", () => {
    expect(gamma(-1 / 2)).toBeRelativelyCloseTo(-2 * Math.sqrt(Math.PI), 15);
  });
  it("Γ(3/2) = sqrt(π)/2", () => {
    expect(gamma(3 / 2)).toBeRelativelyCloseTo(Math.sqrt(Math.PI) / 2, 15);
  });
  it("Γ(-3/2) = 4/3 * sqrt(π)", () => {
    expect(gamma(-3 / 2)).toBeRelativelyCloseTo(
      (4 / 3) * Math.sqrt(Math.PI),
      15
    );
  });
  it("Γ(5/2) = 3/4 * sqrt(π)", () => {
    expect(gamma(5 / 2)).toBeRelativelyCloseTo(0.75 * Math.sqrt(Math.PI), 15);
  });
  it("Γ(7/2) = 15/8 * sqrt(π)", () => {
    expect(gamma(7 / 2)).toBeRelativelyCloseTo(
      (15 / 8) * Math.sqrt(Math.PI),
      15
    );
  });
  it("Γ(1/3) = 2.678938534707747633655692940974677", () => {
    expect(gamma(1 / 3)).toBeRelativelyCloseTo(
      2.678938534707747633655692940974677,
      14
    );
  });
  it("Γ(1/4) = 3.625609908221908311930685155867672", () => {
    expect(gamma(1 / 4)).toBeRelativelyCloseTo(
      3.625609908221908311930685155867672,
      15
    );
  });
  it("Γ(1/5) = 4.590843711998803053204758275929152", () => {
    expect(gamma(1 / 5)).toBeRelativelyCloseTo(
      4.590843711998803053204758275929152,
      14
    );
  });
  it("Γ(1/6) = 5.566316001780235204250096895207726", () => {
    expect(gamma(1 / 6)).toBeRelativelyCloseTo(
      5.566316001780235204250096895207726,
      12
    );
  });
  it("Γ(17/16) = 0.9675800675995248847599762987154317516646", () => {
    expect(gamma(17 / 16)).toBeRelativelyCloseTo(
      0.9675800675995248847599762987154317516646,
      15
    );
  });
});

describe("log gamma special values", () => {
  it("log Γ(n) for small integers", () => {
    expect(logGamma(1)).toBe(0);
    expect(logGamma(2)).toBe(0);
    expect(logGamma(3)).toBeRelativelyCloseTo(Math.log(2));
    expect(logGamma(4)).toBeRelativelyCloseTo(Math.log(6));
    expect(logGamma(5)).toBeRelativelyCloseTo(Math.log(24));
  });
  it("log Γ(1/2) = log sqrt(π)", () => {
    expect(logGamma(1 / 2)).toBeRelativelyCloseTo(
      Math.log(Math.sqrt(Math.PI)),
      15
    );
  });
  it("log Γ(3/2) = log (sqrt(π)/2)", () => {
    expect(logGamma(3 / 2)).toBeRelativelyCloseTo(
      Math.log(Math.sqrt(Math.PI) / 2),
      14
    );
  });
  it("log Γ(-3/2) = log (4/3 * sqrt(π))", () => {
    expect(logGamma(-3 / 2)).toBeRelativelyCloseTo(
      Math.log((4 / 3) * Math.sqrt(Math.PI)),
      15
    );
  });
  it("log Γ(5/2) = log (3/4 * sqrt(π))", () => {
    expect(logGamma(5 / 2)).toBeRelativelyCloseTo(
      Math.log(0.75 * Math.sqrt(Math.PI)),
      14
    );
  });
  it("log Γ(1/5) = log 4.590843711998803053204758275929152", () => {
    expect(logGamma(1 / 5)).toBeRelativelyCloseTo(
      Math.log(4.590843711998803053204758275929152),
      14
    );
  });
  it("log Γ() = log 4.590843711998803053204758275929152", () => {
    expect(logGamma(1 / 5)).toBeRelativelyCloseTo(
      Math.log(4.590843711998803053204758275929152),
      14
    );
  });
});

import { readFileSync } from "fs";

const tests = JSON.parse(
  readFileSync("tests/data/special.gamma.json").toString("utf-8")
);

describe("gamma parameter sweep", () => {
  for (let test of tests) {
    const z: number = test.z;
    if ("gamma" in test) {
      it(`gamma(${z}) = ${test.gamma}`, () => {
        expect(gamma(z)).toBeRelativelyCloseTo(test.gamma);
      });
    }
    it(`log gamma(${z}) = ${test["gamma.log"]}`, () => {
      expect(logGamma(z)).toBeRelativelyCloseTo(test["gamma.log"]);
    });
  }
});