import { expect, test, describe } from "@jest/globals";
import * as caseof from "../src";

describe("caseof", () => {
	test("calls matched function, and returns result of said function", () => {
		const res = caseof.caseOf<number>((when) => {
			when((x) => typeof x === "number")((x) => x + 1);
		})(1);
		expect(res).toBe(2);
	});

	test("throws if none of the predicates matched", () => {
		const fn = () =>
			caseof.caseOf<number>((when) => {
				when((x) => x === 2)((x) => x + 1);
			})(3);
		expect(fn).toThrowError(new Error("None of the cases matches the value"));
	});

	test("returns result of first handler", () => {
		const res = caseof.caseOf<number>((when) => {
			when((x) => typeof x === "number")((x) => x + 1);
			when((x) => typeof x === "number")((x) => x - 1);
		})(1);
		expect(res).toBe(2);
	});

	test("function on a pure side-effect basis", () => {
		// eslint-disable-next-line @typescript-eslint/no-inferrable-types
		const foo: string = "foo";
		const res = caseof.caseOf<void, string>((when) => {
			when(() => foo === "bar")(() => "bar");
			when(() => foo === "foo")(() => "foo");
		})();
		expect(res).toBe("foo");
	});

	test("only first matching case is run", () => {
		let side1 = false;
		let side2 = false;
		let side3 = false;
		caseof.caseOf<void>((when) => {
			when(() => true)(() => {
				side1 = true;
			});
			when(() => true)(() => {
				side2 = true;
			});
			when(() => true)(() => {
				side3 = true;
			});
		})();
		expect(side1).toBe(true);
		expect(side2).toBe(false);
		expect(side3).toBe(false);
	});

	test("default case with otherwise", () => {
		const res = caseof.caseOf<number>((when) => {
			when((x) => x < 20)((x) => x + 10);
			when(caseof.otherwise)(() => 0);
		})(23);
		expect(res).toBe(0);
	});
});

describe("caseOf.all", () => {
	test("caseOf.all returns all results", () => {
		const res = caseof.all<number>((when) => {
			when((x) => x === 1)((x) => x + 1);
			when((x) => x === 1)((x) => x - 1);
			when((x) => typeof x !== "number")(() => 5);
		})(1);
		expect(res).toStrictEqual([2, 0]);
	});
});
