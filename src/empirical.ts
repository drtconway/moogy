import { CdfOptions, Distribution, PdfOptions, RandomSource } from "./distribution";

export class Empirical implements Distribution {
  name: string = "empirical";
  readonly mean: number;
  readonly stddev: number;
  private values: number[];

  constructor(values: number[]) {
    this.values = [...values].sort((a, b) => a - b);
    const n = this.values.length;
    let s = 0;
    let s2 = 0;
    for (let x of this.values) {
      s += x;
      s2 += x * x;
    }
    this.mean = s / n;
    this.stddev = Math.sqrt(s2 / n - this.mean * this.mean);
  }

  pdf(x: number, options: PdfOptions = { log: false }): number {
    throw new Error("no pdf method for empirical distributions.");
  }

  cdf(x: number, options: CdfOptions = { lower: true, log: false }): number {
    const n = this.values.length;

    if (x < this.values[0]) {
      if (options.lower == undefined || options.lower) {
        if (options.log) {
          return -Infinity;
        }
        return 0;
      } else {
        if (options.log) {
          return 0;
        }
        return 1;
      }
    }

    if (x >= this.values[n - 1]) {
      if (options.lower == undefined || options.lower) {
        if (options.log) {
          return 0;
        }
        return 1;
      } else {
        if (options.log) {
          return -Infinity;
        }
        return 0;
      }
    }
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      let mid = (lo + hi) >> 1;
      if (this.values[mid] <= x) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    lo -= 1;
    const p = lo / n;
    if (options.lower == undefined || options.lower) {
      if (options.log) {
        return Math.log(p);
      }
      return p;
    } else {
      if (options.log) {
        return Math.log1p(-p);
      }
      return 1 - p;
    }
  }

  random(rng: RandomSource): number;
  random(rng: RandomSource, n: number): number[];
  random(rng: any, n?: any): number | number[] {
    if (n == null) {
      let u = Math.floor(rng.random() * this.values.length);
      return this.values[u];
    } else {
      const xs: number[] = [];
      for (let i = 0; i < n; ++i) {
        let u = Math.floor(rng.random() * this.values.length);
        xs.push(this.values[u]);
      }
      return xs;
    }
  }
}
