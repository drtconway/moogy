import {
  incompleteBeta,
  IncompleteBetaOptions,
} from "../../../src/special/beta";
import { MT19937 } from "../../../src/random";
import { RandomSource } from "../../../src/distribution";
import { Poisson } from "../../../src/poisson";
import { writeFileSync } from "fs";
import { CoverageCapture } from "../../../src/internal/capture";

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

async function callIncompleteBeta(cap: CoverageCapture,
  a: number,
  b: number,
  x: number,
  options: IncompleteBetaOptions
) {
  const memento = {a, b, x, inv: !options.lower, norm: options.normalised, deriv: options.derivative != undefined};
  await cap.capture(memento, () => {
    incompleteBeta(a, b, x, options);
  });
}

const lowerNorm : IncompleteBetaOptions = {lower: true, normalised: true};
const lowerNormDeriv : IncompleteBetaOptions = {lower: true, normalised: true, derivative: {value: 0}};
const lower : IncompleteBetaOptions = {lower: true};
const lowerDeriv : IncompleteBetaOptions = {lower: true, derivative: {value: 0}};
const upperNorm : IncompleteBetaOptions = {lower: false, normalised: true};
const upperNormDeriv : IncompleteBetaOptions = {lower: false, normalised: true, derivative: {value: 0}};
const upper : IncompleteBetaOptions = {lower: false};
const upperDeriv : IncompleteBetaOptions = {lower: false, derivative: {value: 0}};

async function runForParams(cap: CoverageCapture, a: number, b: number, x0: number): Promise<void> {
  for (let x of [x0, 1 - x0, 0, 1]) {
    for (let opts of [lowerNorm, lowerNormDeriv, lower, lowerDeriv, upperNorm, upperNormDeriv, upper, upperDeriv]) {
      await callIncompleteBeta(cap, a, b, x, opts);
    }
  }
}

async function main() {
  const cap = new CoverageCapture(4);
  const N = 1000;
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
    console.log(`i=${i}, a=${a}, b=${b}, x=${x}`)
    await runForParams(cap, 0, b, x);
    await runForParams(cap, 1, b, x);
    await runForParams(cap, a, 0, x);
    await runForParams(cap, a, 1, x);
    await runForParams(cap, 0.5, 0.5, x);
    await runForParams(cap, a, b, x);
  }
  let res = cap.summarise();
  console.log(`paths covered: ${res[0]}`);
  writeFileSync("utils/reference/data/beta.json", JSON.stringify(res[2]));
}

main()