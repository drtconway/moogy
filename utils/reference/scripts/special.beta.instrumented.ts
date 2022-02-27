import {
  beta,
  codePaths,
  incompleteBeta,
  incompleteBetaDerivative,
  IncompleteBetaOptions,
} from "../../../src/special/beta";
import { MT19937 } from "../../../src/random";
import { RandomSource } from "../../../src/distribution";
import { Poisson } from "../../../src/poisson";
import { writeFileSync } from "fs";

function param(rng: RandomSource): number {
  let scales: number[] = [0.01, 0.1, 0.1, 1, 10, 100];
  let i = Math.floor(rng.random() * scales.length);
  let s = scales[i];
  let x = 1 / (s * rng.random());
  if (x >= 1 && rng.random() < 0.25) {
    x = Math.floor(x);
  }
  return x;
}

function callIncompleteBeta(
  a: number,
  b: number,
  x: number,
  options: IncompleteBetaOptions
) {
  try {
    incompleteBeta(a, b, x, options);
  } catch (err) {
    // never mind.
  }
}

function runForParams(a: number, b: number, x0: number): void {
  for (let x of [x0, 1 - x0, 0, 1]) {
    let deriv = { value: 0 };
    callIncompleteBeta(a, b, x, { lower: true, normalised: true });
    callIncompleteBeta(a, b, x, {
      lower: true,
      normalised: true,
      derivative: deriv,
    });
    callIncompleteBeta(a, b, x, { lower: true, normalised: false });
    callIncompleteBeta(a, b, x, {
      lower: true,
      normalised: false,
      derivative: deriv,
    });
    callIncompleteBeta(a, b, x, { lower: false, normalised: true });
    callIncompleteBeta(a, b, x, {
      lower: false,
      normalised: true,
      derivative: deriv,
    });
    callIncompleteBeta(a, b, x, { lower: false, normalised: false });
    callIncompleteBeta(a, b, x, {
      lower: false,
      normalised: false,
      derivative: deriv,
    });
  }
}

function main() {
  const N = 10000;
  let R = new MT19937(37);
  let poi = new Poisson(1);
  for (let i = 0; i < N; ++i) {
    let a = param(R);
    let b = param(R);
    let k = 1 + poi.random(R);
    let x = 1;
    for (let j = 0; j < k; ++j) {
      x *= R.random();
    }
    runForParams(0, b, x);
    runForParams(1, b, x);
    runForParams(a, 0, x);
    runForParams(a, 1, x);
    runForParams(0.5, 0.5, x);
    runForParams(a, b, x);
  }
  let covered = [];
  let collected: { [key: string]: any } = {};
  for (let key in codePaths.saved) {
    covered.push(key);
    let item = {...codePaths.saved[key].value["beta"], path: key};
    let s = JSON.stringify(item);
    collected[s] = item;
  }
  let res = [];
  for (let key in collected) {
    res.push(collected[key]);
  }
  writeFileSync("utils/reference/data/beta.json", JSON.stringify(res));
  covered.sort();
  console.log(JSON.stringify(covered));
  console.log(covered.length);
}

main()