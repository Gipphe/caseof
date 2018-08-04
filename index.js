// UMD setup ripped straight from Q.js

(function(definition) {
	'use strict';

	// This file will function properly as a <script> tag, or a module
	// using CommonJS and NodeJS or RequireJS module formats. In
	// Common/Node/RequireJS, the module exports the caseof API and when
	// executed as a simple <script>, it creates a caseof global instead.

	/* istanbul ignore next */

	// Montage Require
	if (typeof bootstrap === 'function') {
		/* global bootstrap: false */
		bootstrap ('promise', definition);

	// CommonJS
	} else if (typeof exports === 'object' && typeof module === 'object') {
		module.exports = definition ();

	// RequireJS
	} else if (typeof define === 'function' && define.amd) {
		define (definition);

	// SES (Secure EcmaScript)
	} else if (typeof ses !== 'undefined') {
		/* global ses: true */
		if (!ses.ok ()) {
			return;
		} else {
			ses.makeCaseof = definition;
		}

	// <script>
	} else if (typeof window !== 'undefined' || typeof self !== 'undefined') {
		/* global window: true */
		// Prefer window over self for add-on scripts. Use self for
		// non-windowed contexts.
		var global = typeof window !== 'undefined' ? window : self;

		// Get the `window` object, save the previous caseof global
		// and initialize caseof as a global.
		var previousCaseof = global.caseof;
		global.caseof = definition ();

		// Add a noConflict function so caseof can be removed from the
		// global namespace.
		global.caseof.noConflict = function() {
			global.caseof = previousCaseof;
			return this;
		};

	} else {
		throw new Error ('This environment was not anticipated by caseof. ' +
			'Please file a bug.');
	}

} (function() {
'use strict';

function assertIsFunction(x, msg) {
	if (typeof x !== 'function') {
		throw new Error (msg);
	}
}

function assertIsFunctionWithMsg(x) {
	assertIsFunction (x, 'First argument must be a function');
}

function assertIsNotPassedThrowWithDefaultMessage(x, name) {
	if (typeof x !== 'undefined') {
		throw new Error (name + ': ' + name + ' is a curried ' +
			'function, and as such only takes one argument. ' +
			'Received two. The proper way to call ' + name + ': ' +
			'"fn (x) (y)", instead of ' +
			'"fn (x, y)"');
	}
}

function assertMatchesNotEmpty(x) {
	if (x.length === 0) {
		throw new Error ('None of the cases matches the value');
	}
}

function when(matches) {
	return function(value) {
		return function(pred, x) {
			assertIsNotPassedThrowWithDefaultMessage
				(x, 'the specification handler');
			assertIsFunction (pred, 'when: predicate must be a function');
			return function(handler) {
				assertIsFunction (handler, 'when: handler must be a function');
				if (pred (value)) {
					matches.push (handler (value));
				}
			};
		};
	};
}

function lazyWhen(continuationFn) {
	return function(matches) {
		return function(value) {
			return function(pred, x) {
				assertIsNotPassedThrowWithDefaultMessage
					(x, 'the specification handler');
				assertIsFunction (pred, 'when: predicate must be a function');
				return function(handler) {
					assertIsFunction
						(handler, 'when: handler must be a function');
					if (!continuationFn (matches)) {
						return;
					}
					if (pred (value)) {
						matches.push (handler (value));
					}
				};
			};
		};
	};
}

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
function otherwise() {
	return true;
}

//# caseOfAll :: ((a -> Boolean) -> (a -> b) -> Undefined) -> a -> Array b
//.
//. Returns the result of all matching cases' handlers. The order will be
//. the same order as the specification handler was called.
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
function caseOfAll(specFn, x) {
	assertIsNotPassedThrowWithDefaultMessage (x, 'caseOfAll');
	assertIsFunctionWithMsg (specFn);

	return function(value) {
		var matches = [];
		var boundWhen = when (matches) (value);
		specFn (boundWhen);
		assertMatchesNotEmpty (matches);
		return matches;
	};
}

//# caseOf :: ((a -> Boolean) -> (a -> b) -> Undefined) -> a -> b
//.
//. Returns the result of the first matching case. This function is lazy, and
//. only the first matching handler is run.
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
function caseOf(specFn, x) {
	'use strict';
	assertIsNotPassedThrowWithDefaultMessage (x, 'caseOf');
	assertIsFunctionWithMsg (specFn);
	return function(value) {
		var matches = [];
		var boundWhen = lazyWhen
			(function(m) { return m.length === 0; })
			(matches)
			(value);
		specFn (boundWhen);
		assertMatchesNotEmpty (matches);
		return matches[0];
	};
}
caseOf.all = caseOfAll;
caseOf.otherwise = otherwise;

return caseOf;

}));
