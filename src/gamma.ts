import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { Exponential } from "./exponential";
import { gammaDerivative, incompleteGamma, logChoose } from "./special/gamma";

export class Gamma implements Distribution {
  name: string = "gamma";
  private shape: number;
  private scale: number;
  private expo: Exponential;
  private p: number;

  constructor(shape: number, scale: number) {
    this.shape = shape;
    this.scale = scale;
    this.expo = new Exponential(1);
    this.p = Math.exp(1) / (this.shape + Math.exp(1));
  }

  pdf(x: number, options: PdfOptions = { log: false }): number {
    let p = gammaDerivative(this.shape, x / this.scale) / this.scale;
    if (options.log) {
      return Math.log(p);
    }
    return p;
  }

  cdf(x: number, options: CdfOptions = { lower: true, log: false }): number {
    let p = incompleteGamma(this.shape, x / this.scale, { lower: options.lower, normalised: true });
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
    const a = this.shape;
    if (a == 1) {
      return this.expo.random(rng) * this.scale;
    } else if (a > 1) {
      for (let k = 0; k < 100; ++k) {
        let y = Math.tan(Math.PI * rng.random());
        let x = Math.sqrt(2 * this.shape - 1) * y + this.shape - 1;
        if (x <= 0) {
          continue;
        }
        let am1 = this.shape - 1;
        if (rng.random() > (1 + y * y) * Math.exp(am1 * Math.log(x / am1) - Math.sqrt(2 * this.shape - 1) * y)) {
          continue;
        }
        return x * this.scale;
      }
      throw new Error(`gamma random failed to converge (${this.shape}, ${this.scale}).`);
    } else {
      for (let k = 0; k < 100; ++k) {
        let u = rng.random();
        let y = this.expo.random(rng);
        let x;
        let q;
        if (u < this.p) {
          x = Math.exp(-y / this.shape);
          q = this.p * Math.exp(-x);
        } else {
          x = 1 + y;
          q = this.p + (1 - this.p) * Math.pow(x, this.shape - 1);
        }
        if (u >= q) {
          continue;
        }
        return x * this.scale;
      }
      throw new Error(`gamma random failed to converge (${this.shape}, ${this.scale}).`);
    }
  }
}
