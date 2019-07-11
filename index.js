//    assertIsFunction :: a -> String -> Undefined!
const assertIsFunction = x => msg => {
	if (typeof x !== 'function') {
		throw new Error (msg);
	}
};

//    assertIsFunctionAndExplain :: a -> Undefined!
const assertIsFunctionAndExplain = x => {
	assertIsFunction (x) ('First argument must be a function');
};

//    assertWasCalledWithOneParameterAndExplain :: a -> String -> Undefined!
const assertWasCalledWithOneParameterAndExplain = x => name => {
	if (typeof x !== 'undefined') {
		throw new Error (name + ': ' + name + ' is a curried ' +
			'function, and as such only takes one argument. ' +
			'Received two. The proper way to call ' + name + ': ' +
			'"fn (x) (y)", instead of ' +
			'"fn (x, y)"');
	}
};

//    assertMatchesNotEmpty :: [a] -> Undefined!
const assertMatchesNotEmpty = x => {
	if (x.length === 0) {
		throw new Error ('None of the cases matches the value');
	}
};

//    when :: [a] -> a -> (a -> Bool) -> (a -> b) -> Undefined!
const when = matches => value => (pred, x) => {
	assertWasCalledWithOneParameterAndExplain (x) ('when');
	assertIsFunction (pred) ('when: predicate must be a function');
	return handler => {
		assertIsFunction (handler) ('when: handler must be a function');
		if (pred (value)) {
			matches.push (handler (value));
		}
	};
};

//    lazyWhen :: ([a] -> Bool) -> [a] -> a -> (a -> Bool) -> Undefined!
const lazyWhen = continuationFn => matches => value => (pred, x) => {
	assertWasCalledWithOneParameterAndExplain (x) ('when');
	assertIsFunction (pred) ('when: predicate must be a function');
	return handler => {
		assertIsFunction (handler) ('when: handler must be a function');
		if (!continuationFn (matches)) {
			return;
		}
		if (pred (value)) {
			matches.push (handler (value));
		}
	};
};

//# otherwise :: a -> Boolean
//.
//. Simply a function that always returns true. Will always be considered a
//. "match", and its handler will always be executed if it is encountered.
//. It is mainly useful as a `default` case.
//.
//. ```javascript
//. > otherwise ()
//. true
//.
//. > otherwise ('foo')
//. true
//.
//. > caseOf ((when) => {
//. .   when (x => x < 20) (x => x + 10)
//. .   when (otherwise) (() => 0)
//. . }) (23)
//. 0
//. ```
const otherwise = () => true;

//# caseOfAll :: ((a -> Boolean) -> (a -> b) -> Undefined) -> a -> Array b
//.
//. Returns the result of all matching cases' handlers. The order will be
//. the same order as `when` was called.
//.
//. ```javascript
//. > caseOf.all ((when) => {
//. .   when (x => typeof x === 'number') (x => x + 1)
//. .   when (x => typeof x === 'number') (x => x - 0)
//. . }) (1)
//. [2, 0]
//.
//. > caseOf.all ((when) => {
//. .   when (x => x > 0) (x => x - 1)
//. .   when (x => x < 0) (x => x + 1)
//. . }) (-4)
//. [-3]
//. ```
//.
//. Like `caseOf`, this function throws if none of the cases match.
//.
//. ```javascript
//. > caseOf.all ((when) => {
//. .  when (x => x > 3) (x => x)
//. . }) (0)
//. ! Error None of the cases matches the value
//. ```
const caseOfAll = (specFn, x) => {
	assertWasCalledWithOneParameterAndExplain (x) ('caseOfAll');
	assertIsFunctionAndExplain (specFn);

	return value => {
		const matches = [];
		const boundWhen = when (matches) (value);
		specFn (boundWhen);
		assertMatchesNotEmpty (matches);
		return matches;
	};
};

//# caseOf :: ((a -> Boolean) -> (a -> b) -> Undefined) -> a -> b
//.
//. Returns the result of the first matching case. This function is lazy,
//. and only the first matching handler is run.
//.
//. ```javascript
//. > caseOf ((when) => {
//. .   when (x => x === 'foo') (x => x + 'bar')
//. .   when (x => typeof x === 'string') (x => x.toUpperCase ())
//. . }) ('foo')
//. 'foobar'
//.
//. > let fn = caseOf ((when) => {
//. .   when (x => x % 15 === 0) (() => 'FizzBuzz')
//. .   when (x => x % 3 === 0) (() => 'Fizz')
//. .   when (x => x % 5 === 0) (() => 'Buzz')
//. .   when (() => true) (x => x) // these two
//. .   when (caseOf.otherwise) (x => x) // are equivalent
//. . })
//.
//. > fn (1)
//. 1
//.
//. > fn (3)
//. 'Fizz'
//.
//. > fn (5)
//. 'Buzz'
//.
//. > fn (15)
//. 'FizzBuzz'
//. ```
//.
//. This function throws an error if none of the cases match.
//.
//. ```javascript
//. > caseOf ((when) => {
//. .   when (x => x === 'foo') (x => x + 'bar')
//. . }) ('quack')
//. ! Error: None of the cases matches the value
//. ```
const caseOf = (specFn, x) => {
	assertWasCalledWithOneParameterAndExplain (x) ('caseOf');
	assertIsFunctionAndExplain (specFn);
	return value => {
		const matches = [];
		const boundWhen = lazyWhen (m => m.length === 0) (matches) (value);
		specFn (boundWhen);
		assertMatchesNotEmpty (matches);
		return matches[0];
	};
};
caseOf.all = caseOfAll;
caseOf.otherwise = otherwise;

module.exports = caseOf;
