export type Pred<A> = (x: A) => boolean;
export type When<A, B> = (pred: Pred<A>) => (f: (x: A) => B) => void;
export type SpecFn<A, B> = (when: When<A, B>) => void;
declare const otherwise: () => boolean;
declare const caseOfAll: <A, B = A>(specFn: SpecFn<A, B>) => (initialVal: A) => B[];
declare const caseOf: <A, B = A>(specFn: SpecFn<A, B>) => (initialVal: A) => B;
export default caseOf;
export { caseOfAll as all, otherwise, caseOf };
