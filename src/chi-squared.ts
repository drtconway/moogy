import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { gammaDerivative, incompleteGamma } from "./special/gamma";
import { Gamma } from "./gamma";
import { domain } from "./internal/checks";

export class ChiSquared implements Distribution {
  name: string = "chi-squared";
  private n: number;
  private gamma: Gamma;

  constructor(n: number) {
    domain(n, { integer: true, greaterThan: 0 });
    this.n = n;
    let n2 = n / 2;
    this.gamma = new Gamma(n2, 2);
  }

  pdf(x: number, options: PdfOptions = { log: false }): number {
    if (this.n == 1) {
      domain(x, { greaterThan: 0 });
    } else {
      domain(x, { greaterThanOrEqual: 0 });
    }
    let p = gammaDerivative(this.n / 2, x / 2) / 2;
    if (options.log) {
      return Math.log(p);
    } else {
      return p;
    }
  }

  cdf(x: number, options: CdfOptions = { lower: true, log: false }): number {
    if (this.n == 1) {
      domain(x, { greaterThan: 0 });
    } else {
      domain(x, { greaterThanOrEqual: 0 });
    }
    let n2 = this.n / 2;
    let x2 = x / 2;
    let p = incompleteGamma(n2, x2, { lower: options.lower, normalised: true });
    if (options.log) {
      return Math.log(p);
    } else {
      return p;
    }
  }

  random(rng: RandomSource): number;
  random(rng: RandomSource, n: number): number[];
  random(rng: RandomSource, n?: number): number | number[] {
    if (n == undefined) {
      return this.gamma.random(rng);
    } else {
      return this.gamma.random(rng, n);
    }
  }
}
