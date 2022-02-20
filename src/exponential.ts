import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { gammaDerivative, incompleteGamma, logChoose } from "./special/gamma";

export class Exponential implements Distribution {
  name: string = "gamma";
  private lambda: number;
  private logLambda: number;

  constructor(lambda: number) {
    this.lambda = lambda;
    this.logLambda = Math.log(lambda);
  }

  pdf(x: number, options: PdfOptions = { log: false }): number {
    if (options.log) {
        return this.logLambda  - this.lambda * x;
    } else {
        return this.lambda * Math.exp(-this.lambda*x);
    }
  }

  cdf(x: number, options: CdfOptions = { lower: true, log: false }): number {
      if (options.lower != undefined && options.lower) {
        if (options.log) {
            return Math.log1p(-Math.exp(-this.lambda*x));
        } else {
            return -Math.expm1(-this.lambda*x);
        }
      } else {
        if (options.log) {
            return -this.lambda*x;
        } else {
            return Math.exp(-this.lambda*x);
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
      return -Math.log(rng.random()) / this.lambda;
  }
}
