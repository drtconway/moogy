import { Distribution, PdfOptions, CdfOptions, RandomSource } from "./distribution";
import { logChoose, logAdd } from "./internal/utils";

export class Binomial implements Distribution {
    name: string = "binomial";
    private n: number;
    private p: number;
    private logP: number;
    private q: number;
    private logQ: number;
    private _lcdf: number[];

    constructor(N: number, p: number) {
        this.n = N;
        this.p = p;
        this.logP = Math.log(this.p);
        this.q = 1 - this.p;
        this.logQ = Math.log(this.q);
        this._lcdf = [];
    }

    pdf(k: number, options: PdfOptions = {log: false}) : number {
        const lp = logChoose(this.n, k) + this.logP * k + this.logQ * (this.n - k);
        if (options.log) {
            return lp;
        }
        return Math.exp(lp);
    }

    cdf(k: number, options: CdfOptions = {lower: true, log: false}) : number {
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

    random(rng: RandomSource) : number;
    random(rng: RandomSource, n: number) : number[];
    random(rng: RandomSource, n?: number) : number | number[] {
        if (n == null) {
            return 0;
        } else {
            return [0];
        }
    }

    private makeCdf() {
        let lpi = this.logQ * this.n;
        let lpoc = Math.log(this.p/this.q);
        let ltot = lpi;
        for (let i = 1; i <= this.n; ++i) {
            if (ltot > 0) {
                ltot = 0;
            }
            this._lcdf.push(ltot);
            lpi += lpoc + Math.log((this.n + 1 - i)/i);
            ltot = logAdd(ltot, lpi);
        }
        this._lcdf.push(0);
    }
}