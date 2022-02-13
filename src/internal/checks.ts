export interface DomainCriteria {
  integer?: boolean;
  lessThan?: number;
  lessThanOrEqual?: number;
  greaterThanOrEqual?: number;
  greaterThan?: number;
  satisfies?: (x: number) => (true | string);
}

export class DomainError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export function domain(x: number, criteria: DomainCriteria, msgClosure?: () => string): void {
  let msg = (m: string) => {
    if (msgClosure) {
      return msgClosure();
    } else {
      return m;
    }
  };

  if (criteria.integer != undefined && criteria.integer) {
    if (Math.floor(x) != x) {
      throw new DomainError(msg(`integer required, ${x} given.`));
    }
  }

  if (criteria.lessThan != undefined && !(x < criteria.lessThan)) {
    throw new DomainError(msg(`violated constraint: ${x} < ${criteria.lessThan}`));
  }

  if (criteria.lessThanOrEqual != undefined && !(x <= criteria.lessThanOrEqual)) {
    throw new DomainError(msg(`violated constraint: ${x} <= ${criteria.lessThanOrEqual}`));
  }

  if (criteria.greaterThanOrEqual != undefined && !(x >= criteria.greaterThanOrEqual)) {
    throw new DomainError(msg(`violated constraint: ${x} >= ${criteria.greaterThanOrEqual}`));
  }

  if (criteria.greaterThan != undefined && !(x > criteria.greaterThan)) {
    throw new DomainError(msg(`violated constraint: ${x} > ${criteria.greaterThan}`));
  }

  if (criteria.satisfies != undefined) {
    let val = criteria.satisfies(x);
    if (val !== true) {
      throw new DomainError(msg(val));
    }
  }
}

export class OverflowError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class UnderflowError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class ConvergenceError extends Error {
    constructor(msg: string) {
      super(msg);
    }
  }
  