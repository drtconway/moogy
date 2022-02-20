import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { domain } from "./internal/checks";

export class Geometric implements Distribution {
  name: string = "geometric";
  private p: number;
  private logP: number;
  private q: number;
  private logQ: number;

  constructor(p: number) {
    domain(p, { greaterThan: 0, lessThanOrEqual: 1 });
    this.p = p;
    this.logP = Math.log(p);
    this.q = 1 - p;
    this.logQ = Math.log1p(-p);
  }

  pdf(k: number, options: PdfOptions = { log: false }): number {
    domain(k, { integer: true, greaterThanOrEqual: 0 });
    if (options.log) {
      return this.logP + k * this.logQ;
    } else {
      return this.p * Math.pow(this.q, k);
    }
  }

  cdf(k: number, options: CdfOptions = { lower: true, log: false }): number {
    domain(k, { integer: true, greaterThanOrEqual: 0 });
    let z = this.logQ * (k + 1);
    if (options.lower != undefined && options.lower) {
      if (options.log) {
        return Math.log1p(-Math.exp(z));
      } else {
        return -Math.expm1(z);
      }
    } else {
      if (options.log) {
        return z;
      } else {
        return Math.exp(z);
      }
    }
  }

  random(rng: RandomSource): number;
  random(rng: RandomSource, n: number): number[];
  random(rng: RandomSource, n?: number): number | number[] {
    if (n == null) {
      return this.oneVariate(rng);
    } else {
      let xs = [];
      for (let i = 0; i < n; ++i) {
        xs.push(this.oneVariate(rng));
      }
      return xs;
    }
  }

  private oneVariate(rng: RandomSource): number {
    // rng.random() returns [0, 1).
    // therefore 1 - rng.random() is in the range (0, 1].
    //
    let x = 1 - rng.random();
    return Math.floor(Math.log(x) / this.logQ);
  }
}
