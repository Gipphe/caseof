# caseof

> Elm and Haskell-inspired case-of

[![Package status](https://img.shields.io/npm/v/caseof.svg?style=flat-square)](https://www.npmjs.com/package/caseof)
[![Build status](https://img.shields.io/circleci/project/github/Gipphe/caseof.svg?style=flat-square)](https://circleci.com/gh/Gipphe/caseof)
[![Code coverage](https://img.shields.io/coveralls/Gipphe/caseof.svg?style=flat-square)](https://coveralls.io/github/Gipphe/caseof)
[![License](https://img.shields.io/github/license/Gipphe/caseof.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

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

### <a name="caseOfAll" href="'https://github.com/Gipphe/caseof/blob/master/index.js#L65'">`caseOfAll :: ((a -⁠> Boolean) -⁠> (a -⁠> b) -⁠> Undefined) -⁠> a -⁠> Array b`</a>

Returns the result of all matching cases' handlers. The order will be
the same order as the specification handler was called.

```javascript
> caseOf.all((when) => {
.   when(x => typeof x === 'number')(x => x + 1)
.   when(x => typeof x === 'number')(x => x - 0)
. })(1)
[2, 0]

> caseOf.all((when) => {
.   when(x => x > 0)(x => x - 1)
.   when(x => x < 0)(x => x + 1)
. })(-4)
[-3]
```

### <a name="caseOf" href="'https://github.com/Gipphe/caseof/blob/master/index.js#L96'">`caseOf :: ((a -⁠> Boolean) -⁠> (a -⁠> b) -⁠> Undefined -⁠> a -⁠> b`</a>

Returns the result of the first matching case. This function is lazy, and
only the first matching handler is run.

```javascript
> caseOf((when) => {
.   when(x => x === 'foo')(x => x + 'bar')
.   when(x => typeof x === 'string')(x => x.toUpperCase())
. })('foo')
'foobar'

let fn = caseOf((when) => {
.   when(x => x % 15 === 0)(() => 'FizzBuzz')
.   when(x => x % 3 === 0)(() => 'Fizz')
.   when(x => x % 5 === 0)(() => 'Buzz')
.   when(() => true)(x => x)
. })

> fn(1)
1

> fn(3)
'Fizz'

> fn(5)
'Buzz'

> fn(15)
'FizzBuzz'
```

This function throws an error if none of the cases match.

```javascript
> caseOf((when) => {
.   when(x => x === 'foo')(x => x + 'bar')
. })('quack')
! Error: None of the cases matches the value
```

<!--/transcribe-->
