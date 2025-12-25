---
title: "Crystal Spire #14: End of the Yak"
date: 2025-12-25T18:45:00+02:00
---

Happy holidays! Today we're doing property-based testing.

---

Let's kick things off by scrapping our own self-written test runner and switching to Node's. Having our own tests page is cute, but having less code to maintain is cuter.

I have not used Node's test runner before, so I'll have to reference [the documentation](https://nodejs.org/api/test.html). It looks like the `node:test` module exports a `test()` function (also aliased to `it()`) and a `suite()` function (also aliased to `describe()`). Tests fail when they throw an exception, and succeed when they don't. You can write assertions for tests by using the `node:assert` module. You run the tests by calling `node --test` on the command line, and it automatically discovers test files with names matching one of several patterns with "test" in it.

Let's convert our `tests.js` to a `test.js` file for Node. First, we rename it to `test.js`. Then we import `assert`, `describe` and `it` at the top of the file:

```js
import assert from 'node:assert';
import { describe, it } from 'node:test';
```

Oh man it feels good being able to import things. Anyway. Next we declare a test suite with `describe()`:

```js
describe('getActions()', () => {

});
```

Then - we'd better see the test runner in action as soon as we can - we write a failing test:

```js
describe('getActions()', () => {
    it('fails', () => {
        assert.equal(true, false);
    });
});
```

And we run it with `node --test`:

```
$ node --test
(node:49267) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
/home/cvennevik/dev/crystal-spire/test.js:1
import assert from 'node:assert';
^^^^^^

SyntaxError: Cannot use import statement outside a module
```

Ah. `test.js` is not an ES module, so it can't import. I might want to add `"type": "module"` to the package, but that may have unexpected consequences - let's rename it to `test.mjs` for the moment. Then rerun `node --test`:

```
$ node --test
▶ getActions()
  ✖ fails (1.473907ms)
    AssertionError [ERR_ASSERTION]: true == false
```

Yay! A failing test! Then we can change it to pass:

```js
it('passes', () => {
    assert.equal(true, true);
});
```

```
$ node --test
▶ getActions()
  ✔ passes (0.736913ms)
```

Beautiful. Now to convert the actual test. We take our array of test cases:


```js
let testCases = [
    {
        name: 'Can Play Defend and End Turn',
        input: {
            // ... a game state ...
        },
        expectedOutput: [{ name: 'Play Defend' }, { name: 'End Turn' }]
    },
    {
        name: 'Can Play Strike and End Turn',
        input: {
            // ... another game state ...
        },
        expectedOutput: [{ name: 'Play Strike', enemyIndex: 0 }, { name: 'End Turn' }]
    }
];

for (let testCase of testCases) {
    testCase.actualOutput = getActions(testCase.input);
    testCase.passed = deepEqual(testCase.actualOutput, testCase.expectedOutput);
}
```

...and we add equivalent Node tests:

```js
describe('getActions()', () => {
    it('can play Defend and End Turn', () => {
        let gameState = { /* ... a game state ... */ };
        let actions = getActions(gameState);
        assert.deepEqual(actions, [{ name: 'Play Defend' }, { name: 'End Turn' }]);
    });

    it('can play Strike and End Turn', () => {
        let gameState = { /* ... another game state ... */ };
        let actions = getActions(gameState);
        assert.deepEqual(actions, [{ name: 'Play Strike', enemyIndex: 0 }, { name: 'End Turn' }]);
    });
});
```

Then we try to run them:

```
$ node --test
▶ getActions()
  ✖ can play Defend and End Turn (0.831261ms)
    ReferenceError [Error]: getActions is not defined
```

Ah. Right. We need to import `getActions`. Hm.

I am not entirely sure how to go about this. I think if we use `export` in `index.js`, that will give us an error in the browser, since it's not a module. Let's try it to verify:

```js
export function getActions(gameState) {
    // ...
}
```

```
Uncaught SyntaxError: export declarations may only appear at top level of a module
```

Yeah. So that doesn't work. I know there's another way to do exports with Node, though, which is to assign exports to `module.exports`, and we might be able to do that without the browser complaining. Pop this little bad boy at the end of `index.js`:

```js
// Export in Node.js for testing
if (module !== undefined && 'exports' in module) {
    module.exports = { getActions };
}
```

It works! Our page works as normal now. Okay, well, we do still get a nasty `Uncaught ReferenceError: module is not defined` in the console still, so actually, the if-check doesn't work at all. I've heard of [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) being an environment-neutral way to access global variables, though, maybe we can access `module.exports` that way?

```js
// Export in Node.js for testing
if ('module' in globalThis && 'exports' in globalThis.module) {
    globalThis.module.exports = { getActions };
}
```

Browser doesn't complain, so that's one out of two steps passed. Now to try and import it in the test:

```js
import { getActions } from './index.js';
```

```
$ node --test
file:///home/cvennevik/dev/crystal-spire/test.mjs:3
import { getActions } from './index.js';
         ^^^^^^^^^^
SyntaxError: Named export 'getActions' not found. The requested module './index.js' is a CommonJS module, which may not support all module.exports as named exports.
```

Ah. The code fails to actually export `getActions`. Wow, modules aren't straightforward to half-use. I think we need to take a proper research timeout.

...

Okay. Several important facts learned with a few web searches:

- `module.exports` is used by [CommonJS modules](https://nodejs.org/api/modules.html), as opposed to `import`/`export` which are used by [ECMAScript modules](https://nodejs.org/api/esm.html).
  - If we use `module.exports` in one file and `import` in another, then we're mixing CommonJS and ES modules, and we have to rely on Node's [CommonJS/ES module interoperability](https://nodejs.org/api/esm.html#interoperability-with-commonjs).
- CommonJS modules are [executed inside a function wrapper](https://nodejs.org/api/modules.html#the-module-wrapper), and variables like `module` and `require` are parameters of that function. That explains why we can't access those variables through `globalThis`.
- [The `typeof` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) works on undeclared variables!

Putting this all together, we can solve the export problem like this:

```js
// Export in Node.js for testing
if (typeof module === 'object' && module != null && 'exports' in module) {
    module.exports = { getActions };
}
```

The HTML page loads without error! What about the command line tests?

```
$ node --test
▶ getActions()
  ✔ can play Defend and End Turn (1.18629ms)
  ✔ can play Strike and End Turn (0.149797ms)
▶ getActions() (2.403152ms)
ℹ tests 2
ℹ suites 1
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 58.991965
```

Oh bless. It actually works. That was significantly more work that I thought this would be.

Halfway there. The other half is saying goodbye to the old test code:

- We remove the link to `tests.html` from our rendered HTML.
- We remove `tests.html`.
- We remove `tests.css`.
- We remove the leftover code from `test.mjs`.

And a couple finishing touches to `package.json`:

- Add `"type": "commonjs"` to explicitly declare that `.js` files are CommonJS modules, as I saw recommended in the Node.js documentation.
  - We can still use `.mjs` for ES modules, like we do with `test.mjs`.
- Add a "test" script for `node --test` to document how we run our tests, and to make the `npm test` command work.

```json
{
  "name": "crystal-spire",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "test": "node --test"
  },
  "devDependencies": {
    "fast-check": "^4.5.2"
  }
}
```

And commit: _"Migrate tests to Node.js test runner"_.

Whew.

---

I said we're doing property-based testing today, and I'm sticking to my word. We're not stopping until we're there.

From my understanding, property-based testing is about writing properties that should hold for any possible input, then running the code against random possible inputs to test that the properties hold.

Let's begin by reading through [`fast-check`'s Getting Started guide](https://fast-check.dev/docs/introduction/getting-started/)...

- `fast-check` "works in any test runner without needing any specific change".
  - ...putting a pin in that thought, but moving on...
- It suggests importing the library like `import fc from 'fast-check'`.
- Inside any test in your test runner of choice, you call `fc.assert`, which "takes a **property** and runs it multiple times".
  - In case of failure, it will try to "shrink" the input value to the simplest possible value that causes the failure. This is neat.
- Inside `fc.assert`, we declare properties using `fc.property`, which takes a list of **arbitraries** to generate inputs with, and a **predicate** to test the inputs with.

Okay! This seems like a manageable set of concepts. It looks like the final piece we need is defining our own arbitraries. Browsing the [arbitraries documentation](https://fast-check.dev/docs/core-blocks/arbitraries/), `fast-check` has:

- Primitives, like `fc.boolean()`, `fc.integer()`, `fc.string()`, and so on, with parameters to customize their range of values.
- Composites, like `fc.tuple()`, `fc.array()`, `fc.func()`, `fc.object()`, and so on.
- Combiners, like `fc.constant()`, `fc.subarray()`, `fc.option()`, and chaining methods like `.filter()` and `.map()`.

Let's jump into the deep end, then, and define an arbitrary for game states. For generating objects with specific properties, we'll want to use `fc.record()`:

```js
let arbGameState = fc.record({
    hp: 'todo',
    maxHp: 'todo',
    block: 'todo',
    energy: 'todo',
    maxEnergy: 'todo',
    hand: 'todo',
    drawPile: 'todo',
    discardPile: 'todo',
    relics: 'todo',
    enemies: 'todo'
});
```

For the numbers, we can use `fc.nat()` for all non-negative integer values:

```js
let arbGameState = fc.record({
    hp: fc.nat(),
    maxHp: fc.nat(),
    block: fc.nat(),
    energy: fc.nat(),
    maxEnergy: fc.nat(),
    hand: 'todo',
    drawPile: 'todo',
    discardPile: 'todo',
    relics: 'todo',
    enemies: 'todo'
});
```

...although, no, this will generate invalid states where `hp` is greater than `maxHp`, and weird states where `energy` is in the hundreds of millions.

We could pass a max value to some of these, but for the sake of finding available moves, some of these never matter, so let's leave those a constant instead:

```js
let arbGameState = fc.record({
    hp: fc.nat({ max: 80 }),
    maxHp: fc.constant(80),
    block: fc.constant(0),
    energy: fc.nat({ max: 999 }),
    maxEnergy: fc.constant(3),
    hand: 'todo',
    drawPile: 'todo',
    discardPile: 'todo',
    relics: 'todo',
    enemies: 'todo'
});
```

Then we have the hand and piles. We can define an arbitrary for cards:

```js
let arbCard = fc.constantFrom('Strike', 'Defend', 'Bash');
```

Then define arrays using `fc.array()` - though, again, only cards in hand matter here, so `drawPile` and `discardPile` can be left as constant empty arrays, and relics also don't matter, so let's throw an empty array in there at the same time:

```js
let arbGameState = fc.record({
    hp: fc.nat({ max: 80 }),
    maxHp: fc.constant(80),
    block: fc.constant(0),
    energy: fc.nat({ max: 999 }),
    maxEnergy: fc.constant(3),
    hand: fc.array(arbCard, { minLength: 0, maxLength: 10 }),
    drawPile: fc.constant([]),
    discardPile: fc.constant([]),
    relics: fc.constant([]),
    enemies: 'todo'
});
```

Finally, the `enemies` array. That will need an arbitrary for enemies:

```js
let arbEnemy = fc.record({
    name: 'todo',
    hp: 'todo',
    maxHp: 'todo',
    block: 'todo',
    nextMove: 'todo',
    moveHistory: 'todo',
    buffs: 'todo',
    debuffs: 'todo'
});
```

...and I don't know of any relevant enemy variations, so let's make them all constants:

```js
let arbEnemy = fc.record({
    name: fc.constant('Jaw Worm'),
    hp: fc.constant(42),
    maxHp: fc.constant(42),
    block: fc.constant(0),
    nextMove: fc.constant([]),
    moveHistory: fc.constant([]),
    buffs: fc.constant([]),
    debuffs: fc.constant([])
});
```

Then we can use it with `fc.array()` to specify `enemies`. I'm not sure whether the minimum number of enemies should be one or zero. I think killing the last enemy gets you to a game state with zero enemies, so let's make the lower bound zero:

```js
let arbGameState = fc.record({
    hp: fc.nat({ max: 80 }),
    maxHp: fc.constant(80),
    block: fc.constant(0),
    energy: fc.nat({ max: 999 }),
    maxEnergy: fc.constant(3),
    hand: fc.array(arbCard, { minLength: 0, maxLength: 10 }),
    drawPile: fc.constant([]),
    discardPile: fc.constant([]),
    relics: fc.constant([]),
    enemies: fc.array(arbEnemy, { minLength: 0, maxLength: 5 })
});
```

There! We have an arbitrary for game states that hopefully works.

Now we write our first property-based test. Let's test for a property that I suspect will not pass: "If the player has zero HP, the only available action is defeat."

```js
it('only has Defeat available when HP is zero', () => {
    fc.assert(
        fc.property(arbGameState, gameState => {
            if (gameState.hp === 0) {
                let actions = getActions(gameState);
                assert.deepEqual(actions, [{ name: 'Defeat' }]);
            }
        })
    );
})
```

I don't think this is the ideal way to write the test - maybe, instead, the arbitrary should have `hp` as a constant of zero. But I think this will still work, and it's readable, and we can reconsider our approach when we have more tests.

Deep breath. Time to run it. Does it work?

```
$ node --test
▶ getActions()
  ✔ can play Defend and End Turn (1.208453ms)
  ✔ can play Strike and End Turn (0.146097ms)
  ✖ only has Defeat available when HP is zero (7.154977ms)
    Error: Property failed after 10 tests
    { seed: -288422701, path: "9:0:0:0:0", endOnFailure: true }
    Counterexample: [{"hp":0,"maxHp":80,"block":0,"energy":0,"maxEnergy":3,"hand":[],"drawPile":[],"discardPile":[],"relics":[],"enemies":[]}]
    Shrunk 4 time(s)
```

Haha!! It's alive!! We're doing property-based testing!!

Ahem. Now we can implement the fix:

```js
function getActions(gameState) {
    if (gameState.hp === 0) {
        return [{ name: 'Defeat' }];
    }
    // ...
}
```

Then rerun the test:

```
$ node --test
▶ getActions()
  ✔ can play Defend and End Turn (1.166435ms)
  ✔ can play Strike and End Turn (0.140492ms)
  ✔ only has Defeat available when HP is zero (7.334557ms)
```

We're green. We TDD'd with PBT. Our yak is shaved.

Commit: _"Add 'Defeat' action"_.

---

I am really excited! We can finally return to implementing our solver, with the support of a testing tool I've wanted to try out for years. I'm stoked to figure out the design for this. Last time I did this in C# it got really involved, with a lot of files and a lot of tests. This time, I think we'll go with quite different strategies for both implementation and testing. I don't know what they will be yet! It'll be fun to find out!

See you next time :)

---

_[View this app version](/crystal-spire/v14/)_ | _[Last commit: Add 'Defeat' action](https://codeberg.org/cvennevik/crystal-spire/src/commit/1d04289fe180582797ccd23e595212791dafb02c)_
