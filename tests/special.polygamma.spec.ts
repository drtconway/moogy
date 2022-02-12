import { digamma, polyCotPi, polygamma, trigamma } from "../src/special/polygamma";

import { addHelpers } from "./helpers";
addHelpers();

describe("digamma", () => {
  it("digamma(1)", () => {
    expect(digamma(1)).toBeRelativelyCloseTo(-0.5772156649015323104379);
  });
  it("digamma(1.5)", () => {
    expect(digamma(1.5)).toBeRelativelyCloseTo(0.03648997397857689506395);
  });
  it("digamma(π)", () => {
    expect(digamma(Math.PI)).toBeRelativelyCloseTo(0.9772133079420066703591);
  });
});

describe("trigamma", () => {
  it("trigamma(1)", () => {
    expect(trigamma(1)).toBeRelativelyCloseTo(1.644934066848226406066);
  });
  it("trigamma(1.5)", () => {
    expect(trigamma(1.5)).toBeRelativelyCloseTo(0.9348022005446793292194);
  });
  it("trigamma(π)", () => {
    expect(trigamma(Math.PI)).toBeRelativelyCloseTo(0.3742437696542004754718);
  });
});

describe("polygamma", () => {
  it("polygamma 1", () => {
    expect(polygamma(1, 2.1)).toBeRelativelyCloseTo(0.6068528698010232647064);
  });
  it("polygamma 2", () => {
    expect(polygamma(2, 2.1)).toBeRelativelyCloseTo(-0.3588277765408507402611);
  });
  it("polygamma 3", () => {
    expect(polygamma(3, 2.1)).toBeRelativelyCloseTo(0.4147960580762828364243);
  });
  it("polygamma 4", () => {
    expect(polygamma(4, 2.1)).toBeRelativelyCloseTo(-0.7050914424451879547462);
  });
  it("polygamma 5", () => {
    expect(polygamma(5, 2.1)).toBeRelativelyCloseTo(1.5706393625190462337571);
  });
  it("polygamma 6", () => {
    expect(polygamma(6, 2.1)).toBeRelativelyCloseTo(-4.3079605124003830241008);
  });
  it("polygamma 7", () => {
    expect(polygamma(7, 2.1)).toBeRelativelyCloseTo(13.9942193527948397502314);
  });
});

class PolyCotPiC {
  C : number[][] = [];

  constructor(N : number) {
    for (let k = 0; k <= N; ++k) {
      this.C.push([]);
      for (let n = 0; n <= N; ++n) {
        this.C[k].push(0);
      }
    }
    this.C[0][1] = -1;
    for (let n = 0; n < N; ++n) {
      for (let k = 0; k < n + 1; ++k) {
        if (k > 0) {
          this.C[k-1][n+1] -= k * this.C[k][n];
        }
        this.C[k+1][n+1] += (k - n - 1) * this.C[k][n];
      }
    }
  }
}

describe("test polyCotPi", () => {
  const tbl = new PolyCotPiC(15);
  const myPolyCotPi = (n : number, x : number) : number => {
    let sum : number = 0;
    const C : number[] = [];
    for (let k = 0; k < n; ++k) {
      C.push(tbl.C[k][n]);
      sum += tbl.C[k][n] * Math.pow(Math.cos(Math.PI * x), k) 
    }
    return (Math.pow(Math.PI, n) / Math.pow(Math.sin(Math.PI * x), n + 1)) * sum;
  };
  expect(myPolyCotPi(3, 25.8)).toBeRelativelyCloseTo(-1199.587615479271335062, 7);
  expect(polyCotPi(3, 25.8, -24.8)).toBeRelativelyCloseTo(myPolyCotPi(3, -24.8));
});

import { readFileSync } from "fs";

const tests = JSON.parse(readFileSync("tests/data/special.polygamma.json").toString("utf-8"));

describe("polygamma parameter sweep", () => {
  for (let test of tests) {
    const n : number = test.n;
    const z : number = test.z;
    it(`polygamma(${n}, ${z}) = ${test.polygamma}`, () => {
      expect(polygamma(n, z)).toBeRelativelyCloseTo(test.polygamma);
    });
  }
});