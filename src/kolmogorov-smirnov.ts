import { Distribution } from "./distribution";

export function kolmogorovSmirnov(xs : number[], dist : Distribution) : number {
    xs.sort((a, b) => a - b);
    let D = 0;
    const n = xs.length;
    for (let i = 0; i < n; ++i) {
        const x = xs[i];
        const p = (i+1)/n;
        const q = dist.cdf(x);
        const d0 = Math.abs(p - q);
        D = Math.max(D, d0);
    }
    return D;
}
