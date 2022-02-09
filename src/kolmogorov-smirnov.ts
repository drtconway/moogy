import { Distribution } from "./distribution";
import { Empirical } from "./empirical";

export function kolmogorovSmirnov(xs : number[], dist : Distribution) : number {
    let emp = new Empirical(xs);
    let D = 0;
    for (let x of xs) {
        let p = emp.cdf(x);
        let q = dist.cdf(x);
        let d0 = Math.abs(p - q);
        D = Math.max(D, d0);
    }
    return Math.sqrt(xs.length)*D;
}
