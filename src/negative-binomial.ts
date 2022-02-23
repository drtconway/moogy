import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { Gamma } from "./gamma";
import { domain } from "./internal/checks";
import { Poisson } from "./poisson";
import { incompleteBeta } from "./special/beta";
import { logGamma } from "./special/gamma";

export class NegativeBinomial implements Distribution {
  name: string = "negative-binomial";
  private r: number;
  private p: number;
  private logP: number;
  private logQ: number;
  private logGammaR: number;
  private gamma: Gamma;

  constructor(r : number, p: number) {
    domain(p, { greaterThan: 0, lessThanOrEqual: 1 });
    this.r = r;
    this.p = p;
    this.logP = Math.log(p);
    this.logQ = Math.log1p(-p);
    this.logGammaR = logGamma(r);
    this.gamma = new Gamma(r, (1-p)/p);
  }

  pdf(k: number, options: PdfOptions = { log: false }): number {
    domain(k, { integer: true, greaterThanOrEqual: 0 });
    let logGammaPart = logGamma(this.r + k) - this.logGammaR - logGamma(k+1);
    let powerPart = this.r * this.logP + k * this.logQ;
    if (options.log) {
      return logGammaPart + powerPart;
    } else {
      return Math.exp(logGammaPart) * Math.exp(powerPart);
    }
  }

  cdf(k: number, options: CdfOptions = { lower: true, log: false }): number {
    domain(k, { integer: true, greaterThanOrEqual: 0 });
    let r = incompleteBeta(this.r, k + 1, this.p, {lower: options.lower});
    if (options.log) {
        return Math.log(r);
    } else {
        return r;
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
      let lam = this.gamma.random(rng);
      let poi = new Poisson(lam);
      return poi.random(rng);
  }
}
