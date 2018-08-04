# caseof

> Elm and Haskell-inspired case-of

[![Package status](https://img.shields.io/npm/v/caseof.svg?style=flat-square)](https://www.npmjs.com/package/caseof)
[![Build status](https://img.shields.io/circleci/project/github/Gipphe/caseof.svg?style=flat-square)](https://circleci.com/gh/Gipphe/caseof)
[![Code coverage](https://img.shields.io/coveralls/Gipphe/caseof.svg?style=flat-square)](https://coveralls.io/github/Gipphe/caseof)
[![License](https://img.shields.io/github/license/Gipphe/caseof.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)

A tiny package imitating a case-of expression from languages like Elm and Haskell.

* [Getting Started](#getting-started)
  * [Installing](#installing)
  * [Usage](#usage)
* [Motivation](#motivation)
* [Contribution](#contribution)
* [Compatibility](#compatibility)
* [Changelog](#changelog)
* [Versioning](#versioning)
* [License](#license)
* [Further reading](#further-reading)

## Getting started

### Installing

Use the following command to add it to your project:

```shell
npm install --save caseof
```

### Usage

<!--transcribe-->

### <a name="otherwise" href="'https://github.com/Gipphe/caseof/blob/master/index.js#L126'">`otherwise :: a -⁠> Boolean`</a>

Simply a function that always returns true. Will always be considered a
"match", and its handler will always be executed if it is encountered.
It is mainly useful as a `default` case.

```javascript
> otherwise ()
true

> otherwise ('foo')
true

> caseOf ((when) => {
.   when (x => x < 20) (x => x + 10)
.   when (otherwise) (() => 0)
. }) (23)
0
```

### <a name="caseOfAll" href="'https://github.com/Gipphe/caseof/blob/master/index.js#L149'">`caseOfAll :: ((a -⁠> Boolean) -⁠> (a -⁠> b) -⁠> Undefined) -⁠> a -⁠> Array b`</a>

Returns the result of all matching cases' handlers. The order will be
the same order as the specification handler was called.

```javascript
> caseOf.all ((when) => {
.   when (x => typeof x === 'number') (x => x + 1)
.   when (x => typeof x === 'number') (x => x - 0)
. }) (1)
[2, 0]

> caseOf.all ((when) => {
.   when (x => x > 0) (x => x - 1)
.   when (x => x < 0) (x => x + 1)
. }) (-4)
[-3]
```

Like `caseOf`, this function throws if none of the cases match.

```javascript
> caseOf.all ((when) => {
.  when (x => x > 3) (x => x)
. }) (0)
! Error None of the cases matches the value
```

### <a name="caseOf" href="'https://github.com/Gipphe/caseof/blob/master/index.js#L189'">`caseOf :: ((a -⁠> Boolean) -⁠> (a -⁠> b) -⁠> Undefined) -⁠> a -⁠> b`</a>

Returns the result of the first matching case. This function is lazy, and
only the first matching handler is run.

```javascript
> caseOf ((when) => {
.   when (x => x === 'foo') (x => x + 'bar')
.   when (x => typeof x === 'string') (x => x.toUpperCase ())
. }) ('foo')
'foobar'

> let fn = caseOf ((when) => {
.   when (x => x % 15 === 0) (() => 'FizzBuzz')
.   when (x => x % 3 === 0) (() => 'Fizz')
.   when (x => x % 5 === 0) (() => 'Buzz')
.   when (() => true) (x => x) // these two
.   when (caseOf.otherwise) (x => x) // are equivalent
. })

> fn (1)
1

> fn (3)
'Fizz'

> fn (5)
'Buzz'

> fn (15)
'FizzBuzz'
```

This function throws an error if none of the cases match.

```javascript
> caseOf ((when) => {
.   when (x => x === 'foo') (x => x + 'bar')
. }) ('quack')
! Error: None of the cases matches the value
```

<!--/transcribe-->

## Motivation

Having used [sanctuary](https://sanctuary.js.org/) quite a lot, we found it
annoying having to repeat this kind of pattern:

```javascript
function whatFoo(x) {
  if (x === 3) {
    return 'foo'
  }
  if (x > 3) {
    return 'bar'
  }
  if (x < 3) {
    return 'foobar'
  }
  return 'quack'
}
```

Inevitably, even with monads encapsulating most of this kind of control flow
for you, you might inevitably find yourself repeating this kind of
"if-stacking" pattern.

To me, this is rather verbose and ugly, and there are a lot of things being
repeated in terms of statements. Keep in mind though: there is absolutely
nothing inherently *wrong* with this kind of "if-stacking".

Because of this, and because we simply adore [Elm](http://elm-lang.org/) and
[Haskell](https://www.haskell.org/)'s `case x of` expressions (aka simply
"Case expressions"), we saw it necessary to implement something along those
lines in Javascript.

So, instead of the "ugly" if-stacking above, we can write

```javascript
function whatFoo(x) {
  return caseOf((when) => {
    when(x => x === 3)(() => 'foo')
    when(x => x > 3)(() => 'bar')
    when(x => x < 3)(() => 'foobar')
    when(() => true)(() => 'quack')
  })(x)
}
```

But, as you can see, `caseOf` (and `caseOf.all`) is a curried function,
meaning is not a function that takes two arguments, like `function fn(x, y)`.
No no, it is a function that takes one argument, and then returns another
function, which subsequently takes another argument:

```javascript
function fn(x) {
  return function(y) {
    ...
  }
}
```

This allows us to just asign to `whatFoo`, instead of wrapping `caseOf`:

```javascript
var whatFoo = caseOf((when) => {
  when(x => x === 3)(() => 'foo')
  when(x => x > 3)(() => 'bar')
  when(x => x < 3)(() => 'foobar')
  when(() => true)(() => 'quack')
})

> whatFoo(3)
'foo'
```

And the predicate functions can just be references, like when you partially
apply a function from sanctuary or ramda:

```javascript
var S = require('sanctuary')
> caseOf((when) => {
  when(S.equals(3))(S.K('foo'))
  when(S.gt(3))(S.K('bar'))
  when(S.lt(3))(S.K('foobar'))
  when(S.K(true))(S.K('quack'))
})(3)
'foo'
```

Give it a little more breathing room,
[like you might do in a language where spaces are function application](https://github.com/sanctuary-js/sanctuary/issues/438),
and you've got yourself some easily readable code:

```javascript
var S = require ('sanctuary')
> caseOf ((when) => {
  when (S.equals (3))
       (S.K ('foo'))

  when (S.gt (3))
       (S.K ('bar'))

  when (S.lt (3))
       (S.K ('foobar'))

  when (S.K (true))
       (S.K ('quack'))
}) (3)
'foo'
```

That is, "easily readable" if you're used to a more Haskell-like style. How
you want to style your code is up to you.

## Contribution

This package is open to pull requests. To set up the development environment,
fork it, clone it, and run

```shell
yarn
```

in the project folder. This will install all necessary dependencies.

Run the command

```shell
yarn test
```

to run unit tests.

This project uses a slightly altered variant of
[sanctuary-style](http://github.com/sanctuary-js/sanctuary-style). You can
lint the project using

```shell
yarn lint
```

## Compatibility

This package is compatible all the way down to Node 6 and IE9. It might be
compatible with older versions of Node/IE, but such guarantees cannot be made.

## Type checking

This library features no actual type checking, other than that you call
`caseOf` and `caseOf.all` as curried functions, as well as that `when` is
passed actual functions as arguments.

As previously mentioned in the "motivation" section, this library is heavily
inspired by the work of [sanctuary-js](https://github.com/sanctuary-js), but
there is one thing that is hard to integrate from their work: `sanctuary-def`
type definitions. `caseOf` technically has a type signature of
`caseOf :: ((a -> Boolean) -> (a -> b) -> Undefined) -> a -> b`, but this type
signature is in practice completely impossible to enforce, even with the help
of `sanctuary-def`. This is because the `when` function that is passed to the
first argument of `caseOf` cannot be expected to check type signatures of each
predicate and handler, given it only calls the handler of which the predicate
is satisfied. Meaning this

```javascript
> let fn = caseOf ((when) => {
.   when (x => x === 'foo') (x => x + 'bar')
.   when (x => x > 3) (x => x - 10)
. })

> fn (14)
4

> fn ('foo')
'foobar'
```

is perfectly valid, and will never complain, even if we utilized
`sanctuary-def` in some way (which we didn't). This is a similar problem you
will see with `sanctuary`'s own `ifElse`:

```javascript
> let fn = S.ifElse
.   (x => x !== 'foo')
.   (() => 'bar')
.   (() => 34)

> fn ('foo')
34

> fn (1)
'bar'
```

This is valid according to its signature,
`ifElse :: (a -> Boolean) -> (a -> b) -> (a -> b) -> a -> b`, because in each
case, `b` isn't checked for the function that doesn't get called. For input
`'foo'`, `b` is `String`, but the result of the `else` function isn't checked
unless it is run (unless it is a function defined with `sanctuary-def`). And
for the second case, where input is `'bar'`, `b` is `Number`, but the `then`
function isn't checked.

All in all, this is a limitation of runtime type checking.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available,
see [the tags on this repository](https://github.com/Gipphe/caseof/tags).

## License

This project is licensed under the MIT License - see the
[LICENSE.md file](https://github.com/Gipphe/caseof/blob/master/LICENSE.md) for
details.

## Further reading

* [Elm Case-expression example](http://elm-lang.org/examples/case)
* [Haskell Case-expression examples](http://zvon.org/other/haskell/Outputsyntax/caseQexpressions_reference.html)
