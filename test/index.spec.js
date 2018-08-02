import test from 'ava';
import caseof from '../';

test ('throws when supplied something other than a function as the first argument', (t) => {
	const err = t.throws (() => caseof ({}) (), Error);
	t.is (err.message, 'First argument must be a function');
});

test ('calls matched function, and returns result of said function', (t) => {
	const res = caseof ((when) => {
		when (x => typeof x === 'number') (x => x + 1);
	}) (1);
	t.is (res, 2);
});

test ('throws if none of the predicates matched', (t) => {
	const fn = () => caseof ((when) => {
		when (x => x === 2) (x => x + 1);
	}) (3);
	const err = t.throws (fn, Error);
	t.is (err.message, 'None of the cases matches the value');
});

test ('returns result of first handler', (t) => {
	const res = caseof ((when) => {
		when (x => typeof x === 'number') (x => x + 1);
		when (x => typeof x === 'number') (x => x - 1);
	}) (1);
	t.is (res, 2);
});

test ('function on a pure side-effect basis', (t) => {
	const foo = 'foo';
	const res = caseof ((when) => {
		when (() => foo === 'bar') (() => 'bar');
		when (() => foo === 'foo') (() => 'foo');
	}) ();
	t.is (res, 'foo');
});

test ('throws when specification handler is passed more than 1 argument as a time', (t) => {
	const fn = () => caseof ((when) => {
		when (() => {}, () => {});
	}) ();
	const err = t.throws (fn, Error);
	t.is (err.message, 'the specification handler: the specification handler ' +
		'is a curried function, and as such only takes one argument. ' +
		'Received two. The proper way to call the specification ' +
		'handler: "fn(x)(y)", instead of ' +
		'"fn(x, y)"');
});

test ('caseOf.all returns all results', (t) => {
	const res = caseof.all ((when) => {
		when (x => x === 1) (x => x + 1);
		when (x => x === 1) (x => x - 1);
		when (x => typeof x !== 'number') (() => 'foo');
	}) (1);
	t.deepEqual (res, [2, 0]);
});

test ('only first matching case is run', (t) => {
	let side1 = false;
	let side2 = false;
	let side3 = false;
	caseof ((when) => {
		when (() => true) (() => { side1 = true; });
		when (() => true) (() => { side2 = true; });
		when (() => true) (() => { side3 = true; });
	}) ();
	t.is (side1, true);
	t.is (side2, false);
	t.is (side3, false);
});
