declare global {
    namespace jest {
      interface Matchers<R> {
        toBeRelativelyCloseTo(expected: number, digits?: number): R
      }
    }
  }
  
  export {};