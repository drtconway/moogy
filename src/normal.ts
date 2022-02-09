import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { erfc } from "./special/erf";

export class Normal implements Distribution {
  name: string = "normal";
  private mu: number;
  private sigma: number;
  private logPdfDen: number;
  private randomBuffer: number[] = [];

  constructor(mu: number, sigma: number) {
    this.mu = mu;
    this.sigma = sigma;
    this.logPdfDen = Math.log(this.sigma) + Math.log(Math.sqrt(2 * Math.PI));
  }

  pdf(x: number, options: PdfOptions = { log: false }): number {
    const lp = -((x - this.mu) ** 2 / (2 * this.sigma * this.sigma)) - this.logPdfDen;
    if (options.log) {
      return lp;
    }
    return Math.exp(lp);
  }

  cdf(x: number, options: CdfOptions = { lower: true, log: false }): number {
    let lower = true;
    if (options.lower != undefined) {
      lower = options.lower;
    }
    let log = false;
    if (options.log != undefined) {
      log = options.log;
    }
    let z0 = (x - this.mu) / (this.sigma * Math.SQRT2);
    if (lower) {
      if (log) {
        if (z0 > 5.4) {
            let q = 0.5 * erfc(z0);
            return Math.log1p(-q);
        }
        let p = 0.5 * erfc(-z0);
        return Math.log(p);
      } else {
        let p = 0.5 * erfc(-z0);
        return p;
      }
    } else {
      if (log) {
          if (z0 < -5.4) {
            let q = 0.5 * erfc(-z0);
            return Math.log1p(-q);
          }
          let p = 0.5 * erfc(z0);
        return Math.log(p);
      } else {
        let p = 0.5 * erfc(z0);
        return p;
      }
    }
  }

  random(rng: RandomSource): number;
  random(rng: RandomSource, n: number): number[];
  random(rng: RandomSource, n?: number): number | number[] {
    if (n == null) {
      this.ensureRandoms(rng);
      return this.randomBuffer.pop() as number;
    } else {
      let xs: number[] = [];
      while (n > 0) {
        this.ensureRandoms(rng);
        xs.push(this.randomBuffer.pop() as number);
        n -= 1;
      }
      return xs;
    }
  }

  private ensureRandoms(rng: RandomSource): void {
    if (this.randomBuffer.length > 0) {
      return;
    }
    let u = 2 * rng.random() - 1;
    let v = 2 * rng.random() - 1;
    let w = u * u + v * v;
    while (w > 1) {
      u = 2 * rng.random() - 1;
      v = 2 * rng.random() - 1;
    }
    let z = Math.sqrt((-2 * Math.log(w)) / w);
    this.randomBuffer.push(u * z);
    this.randomBuffer.push(v * z);
  }
}
