let _helpersAdded: boolean = false;

export function addHelpers() {
  if (_helpersAdded) {
    return;
  }
  expect.extend({
    toBeRelativelyCloseTo(got: number, expected: number, digits: number = 9) {
      if (got == expected) {
        return {
          pass: true,
          message: () => `${got} should be the same as ${expected} up to ${digits} digits of precision.`,
        };
      }

      if (!Number.isFinite(got) || !Number.isFinite(expected)) {
        return {
          pass: false,
          message: () => `${got} should be the same as ${expected} up to ${digits} digits of precision.`,
        };
      }

      let diff = Math.abs(got - expected);
      let rel = 10 ** -digits;
      let pass: boolean = diff < Math.abs(rel * got) || diff < Math.abs(rel * expected) || (expected == 0 && diff < rel);
      let message = () => `${got} should be the same as ${expected} up to ${digits} digits of precision.`;

      return { pass, message };
    },
  });
  _helpersAdded = true;
}
