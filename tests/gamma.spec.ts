import { gamma, scaledGamma, sinpx } from "../src/special/gamma";

import { addHelpers } from "./helpers";
addHelpers();

describe("sinpx = x * sin(pi * x)", () => {
    it("x = 5/2", () => {
        expect(sinpx(5/2)).toBeRelativelyCloseTo(5/2 * Math.sin(Math.PI * 5 / 2), 15);
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
    expect(gamma(-3 / 2)).toBeRelativelyCloseTo(4/3 * Math.sqrt(Math.PI), 15);
  });
  it("Γ(5/2) = 3/4 * sqrt(π)", () => {
    expect(gamma(5 / 2)).toBeRelativelyCloseTo(0.75 * Math.sqrt(Math.PI), 15);
  });
  it("Γ(7/2) = 15/8 * sqrt(π)", () => {
    expect(gamma(7 / 2)).toBeRelativelyCloseTo((15 / 8) * Math.sqrt(Math.PI), 15);
  });
  it("Γ(1/3) = 2.678938534707747633655692940974677", () => {
    expect(gamma(1 / 3)).toBeRelativelyCloseTo(2.678938534707747633655692940974677, 14);
  });
  it("Γ(1/4) = 3.625609908221908311930685155867672", () => {
    expect(gamma(1 / 4)).toBeRelativelyCloseTo(3.625609908221908311930685155867672, 15);
  });
  it("Γ(1/5) = 4.590843711998803053204758275929152", () => {
    expect(gamma(1 / 5)).toBeRelativelyCloseTo(4.590843711998803053204758275929152, 14);
  });
  it("Γ(1/6) = 5.566316001780235204250096895207726", () => {
    expect(gamma(1 / 6)).toBeRelativelyCloseTo(5.566316001780235204250096895207726, 12);
  });
  it("Γ(17/16) = 0.9675800675995248847599762987154317516646", () => {
    expect(gamma(17 / 16)).toBeRelativelyCloseTo(0.9675800675995248847599762987154317516646, 15);
  });
});
