import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { logChoose } from "./special/gamma";
import { logAdd } from "./internal/utils";

export class InversionBinomialRandomGenerator {
  private t: number;
  private p: number;
  private r0: number;

  constructor(t: number, p: number) {
    this.t = t;
    this.p = p;
    this.r0 = Math.pow(1 - p, t);
  }

  random(rng: RandomSource): number {
    const eps = 1e-20;
    const q = 1 - this.p;
    const s = this.p / q;
    const a = (this.t + 1) * s;
    let r = this.r0;
    let u = rng.random();
    let x = 0;
    while (u > r) {
      u -= r;
      x += 1;
      let r1 = (a / x - s) * r;
      if (r1 < eps && r1 < r) {
        break;
      }
      r = r1;
    }
    return x;
  }
}

export class RejectionBinomialRandomGenerator {
  private t: number;
  private p: number;
  private m: number;
  private r: number;
  private nr: number;
  private npq: number;
  private rootNpq: number;
  private b: number;
  private a: number;
  private c: number;
  private alpha: number;
  private vR: number;
  private uRvR: number;
  private table: number[] = [
    0.08106146679532726, 0.04134069595540929, 0.02767792568499834, 0.02079067210376509, 0.01664469118982119, 0.01387612882307075,
    0.01189670994589177, 0.01041126526197209, 0.009255462182712733, 0.008330563433362871,
  ];

  constructor(t: number, p: number) {
    this.t = t;
    this.p = p;
    this.m = Math.floor(t * p);
    this.r = p / (1 - p);
    this.nr = (t + 1) * this.r;
    this.npq = t * p * (1 - p);
    this.rootNpq = Math.sqrt(this.npq);
    this.b = 1.15 + 2.53 * this.rootNpq;
    this.a = -0.0873 + 0.0248 * this.b + 0.01 * p;
    this.c = t * p + 0.5;
    this.alpha = (2.83 + 5.1 / this.b) * this.rootNpq;
    this.vR = 0.92 - 4.2 / this.b;
    this.uRvR = 0.86 * this.vR;
  }

  random(rng: RandomSource): number {
    let attempts = 0;
    while (true) {
      attempts += 1;
      if (attempts > 100) {
        throw new Error(`rejection method failed after 100 attempts.`);
      }
      let v = rng.random();

      if (v < this.uRvR) {
        let u = v / this.vR - 0.43;
        return Math.floor(((2 * this.a) / (0.5 - Math.abs(u)) + this.b) * u + this.c);
      }

      let u;
      if (v >= this.vR) {
        u = rng.random() - 0.5;
      } else {
        u = v / this.vR - 0.93;
        u = (u < 0 ? -0.5 : 0.5) - u;
        v = rng.random() * this.vR;
      }

      let us = 0.5 - Math.abs(u);
      let k = Math.floor(((2 * this.a) / us + this.b) * u + this.c);
      if (k < 0 || k > this.t) {
        continue;
      }
      v = (v * this.alpha) / (this.a / (us * us) + this.b);
      let km = Math.abs(k - this.m);
      if (km <= 15) {
        let f = 1;
        if (this.m < k) {
          let i = this.m;
          while (true) {
            i += 1;
            f *= this.nr / i - this.r;
            if (i == k) {
              break;
            }
          }
        } else if (this.m > k) {
          let i = k;
          while (true) {
            i += 1;
            f *= this.nr / i - this.r;
            if (i == this.m) {
              break;
            }
          }
        }
        if (v <= f) {
          return k;
        }
      } else {
        v = Math.log(v);
        let rho = (km / this.npq) * (((km / 3 + 0.625) * km + 1 / 6) / this.npq + 0.5);
        let t = (-km * km) / (2 * this.npq);
        if (v < t - rho) {
          return k;
        }
        if (v > t + rho) {
          continue;
        }
        let nm = this.t - this.m + 1;
        let h = (this.m + 0.5) * Math.log((this.m + 1) / (this.r * nm)) + this.fc(this.m) + this.fc(this.t - this.m);
        let nk = this.t - k + 1;
        if (v <= h + (this.t + 1) * Math.log(nm / nk) + (k + 0.5) * Math.log((nk * this.r) / (k + 1)) - this.fc(k) - this.fc(this.t - k)) {
          return k;
        }
      }
    }
  }

  // correction factor for stirling's approximation.
  private fc(k: number): number {
    if (k < 10) {
      return this.table[k];
    } else {
      const ikp1 = 1 / (k + 1);
      return (1 / 12 - (1 / 360 - (1 / 1260) * (ikp1 * ikp1)) * (ikp1 * ikp1)) * ikp1;
    }
  }
}

type BinomialRandomGenerator = { kind: "inversion", generator: InversionBinomialRandomGenerator } | { kind: "rejection", generator: RejectionBinomialRandomGenerator };

export class Binomial implements Distribution {
  name: string = "binomial";
  private n: number;
  private p: number;
  private logP: number;
  private q: number;
  private logQ: number;
  private _lcdf: number[];
  private gen: BinomialRandomGenerator;

  constructor(N: number, p: number) {
    this.n = N;
    this.p = p;
    this.logP = Math.log(this.p);
    this.q = 1 - this.p;
    this.logQ = Math.log(this.q);
    this._lcdf = [];
    let m = Math.floor(N*p);

    let p0 = (0.5 < p) ? 1 - p : p;
    if (m < 11) {
      this.gen = {kind: "inversion", generator: new InversionBinomialRandomGenerator(N, p0)};
    } else {
      this.gen = {kind: "rejection", generator: new RejectionBinomialRandomGenerator(N, p0)};
    }
  }

  pdf(k: number, options: PdfOptions = { log: false }): number {
    const lp = logChoose(this.n, k) + this.logP * k + this.logQ * (this.n - k);
    if (options.log) {
      return lp;
    }
    return Math.exp(lp);
  }

  cdf(k: number, options: CdfOptions = { lower: true, log: false }): number {
    if (this._lcdf.length == 0) {
      this.makeCdf();
    }
    let lower = true;
    if (options.lower != undefined) {
      lower = options.lower;
    }
    let log = false;
    if (options.log != undefined) {
      log = options.log;
    }
    if (lower) {
      let lp = this._lcdf[k];
      if (log) {
        return lp;
      } else {
        return Math.exp(lp);
      }
    } else {
      let lp = this._lcdf[k];
      let p = Math.exp(lp);
      if (log) {
        return Math.log1p(-p);
      } else {
        return 1 - p;
      }
    }
  }

  random(rng: RandomSource): number;
  random(rng: RandomSource, n: number): number[];
  random(rng: RandomSource, n?: number): number | number[] {
    if (n == null) {
      return this.makeOneVariate(rng);
    } else {
      let xs : number[] = [];
      for (let i = 0; i < n; ++i) {
        xs.push(this.makeOneVariate(rng));
      }
      return xs;
    }
  }

  private makeOneVariate(rng: RandomSource) : number {
    let x = this.gen.generator.random(rng);
    return (0.5 < this.p) ? this.n - x : x;
  }

  private makeCdf() {
    let lpi = this.logQ * this.n;
    let lpoc = Math.log(this.p / this.q);
    let ltot = lpi;
    for (let i = 1; i <= this.n; ++i) {
      if (ltot > 0) {
        ltot = 0;
      }
      this._lcdf.push(ltot);
      lpi += lpoc + Math.log((this.n + 1 - i) / i);
      ltot = logAdd(ltot, lpi);
    }
    this._lcdf.push(0);
  }
}
