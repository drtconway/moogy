import { CoverageInstrumenter, V8Coverage } from "collect-v8-coverage";

export class CoverageCapture {
  sourcePrefix: string;
  N: number;
  saved: { [key: string]: { count: number; values: any[] } };
  all: Set<string>;

  constructor(N: number) {
    this.N = N;
    this.sourcePrefix = `file://${process.cwd()}/`;
    this.saved = {};
    this.all = new Set<string>();
  }

  async capture(memento: any, closure: () => void): Promise<void> {
    const inst = new CoverageInstrumenter();
    await inst.startInstrumenting();
    let succeeds : boolean = false;
    try {
      closure();
      succeeds = true;
    } catch (err) {
      // ignore!
    }
    const m = {...memento, succeeds};
    const covs = await inst.stopInstrumenting();
    for (let loc of this.locations(covs)) {
      this.save(loc, m);
    }
  }

  private locations(covs: V8Coverage): string[] {
    let res: string[] = [];
    for (let cov of covs) {
      if (!cov.url.startsWith(this.sourcePrefix)) {
        continue;
      }
      if (cov.url.startsWith(this.sourcePrefix + "node_modules")) {
        continue;
      }
      for (let func of cov.functions) {
        let base = `${cov.url}/${func.functionName}`;
        for (let range of func.ranges) {
            let loc = `${base}#${range.startOffset}-${range.endOffset}`;
            this.all.add(loc);
          if (range.count == 0) {
            continue;
          }
          res.push(loc);
        }
      }
    }
    return res;
  }

  /**
   * We maintain saved mementos using reservoir sampling.
   * @param key the location
   * @param value the memento
   * @returns nothing.
   */
  private save(key: string, value: any): void {
    if (!(key in this.saved)) {
      this.saved[key] = { count: 1, values: [value] };
      return;
    }
    const item = this.saved[key];
    item.count += 1;
    if (item.count < this.N) {
      item.values.push(value);
    }
    let i = Math.floor(Math.random() * item.count);
    if (i < this.N) {
      item.values[i] = value;
    }
  }
  summarise() : [number, number, any[]] {
      let n = 0;
      let m = 0;
      let idx : {[key:string]: any} = {};
      for (let loc in this.saved) {
          n += 1;
          let itm = this.saved[loc];
          for (let mem of itm.values) {
              m += 1;
              let s = JSON.stringify(mem);
              idx[s] = mem;
          }
      }
      let res: any[] = [];
      for (let s in idx) {
          res.push(idx[s]);
      }
      let p = n / this.all.size;
      return [p, res.length / m, res];
  }
}
