import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { domain } from "./internal/checks";
import { gamma, incompleteGamma, logGamma } from "./special/gamma";

export class Poisson implements Distribution {
  name: string = "poisson";
  private lambda: number;
  private expml: number;
  private logLambda: number;

  constructor(lambda: number) {
    domain(lambda, { greaterThan: 0 });
    this.lambda = lambda;
    this.expml = Math.exp(-lambda);
    this.logLambda = Math.log(lambda);
  }

  pdf(k: number, options: PdfOptions = { log: false }): number {
    domain(k, { integer: true, greaterThanOrEqual: 0 });
    if (options.log) {
      return k * this.logLambda - logGamma(k + 1) - this.lambda;
    } else {
      return (this.expml * Math.pow(this.lambda, k)) / gamma(k + 1);
    }
  }

  cdf(k: number, options: CdfOptions = { lower: true, log: false }): number {
    domain(k, { integer: true, greaterThanOrEqual: 0 });
    let lower = false;
    if (options.lower != undefined) {
        lower = !options.lower;
    }
    let p = incompleteGamma(k + 1, this.lambda, { lower: lower, normalised: true });
    if (options.log) {
      return Math.log(p);
    }
    return p;
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
    let l = this.expml;
    let k = 0;
    let p = 1;
    while (true) {
      let u = rng.random();
      p *= u;
      if (p <= l) {
        return k;
      }
      k += 1;
    }
  }
}
