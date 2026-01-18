---
title: "Crystal Spire #16: Is this legal?"
date: 2026-01-18T22:10:00+01:00
---

Good day, one and all. Today we start implementing `resolveAction()`.

First, a little design talk: What is the interface of `resolveAction()`? It needs to take two parameters:
- A game state
- An action

All actions resolve to a set of possible game states (at least one), with different probabilities. The combined probability of all the possible game states is 100%. To satisfy this, `resolveAction()` can return an array of objects, where each object has a `gameState` property and a `probability` property.

So far, the design just seems like a repeat of my C# attempt at this problem. Same minds think alike, huh? But it will do.

Ho-kay, let's test-drive this thing. First, a new test suite in `test.mjs`:

```js
describe('resolveAction()', () => {
    // Tests go here
});
```

Then... hm, I'm not quite sure how best to do this. We have a few general properties we want to assert, like "the probability of all possible game states sums to 100%". Then there are properties like "playing a card removes it from our hand" or "playing a card puts it in the discard pile", but these properties come with some big asterisks down the line when certain cards and abilities come into play. Even "playing Defend gives you 5 armor" comes with asterisks (what if you have Dexterity? or Frail? or you get damaged when you play a card?). All this is making me feel uncertain of how good a fit property-based testing actually is for our project. But hey, the arbitraries for generating test data are nice, and at worst we're bringing an example-based mindset to a property-based tool, which still does the job.

Bah, we can handle the asterisks when we get to them. Let's test a simple action first: "Play Defend".

```js
it('resolves Defend', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let action = { name: 'Play Defend' };
            let result = resolveAction(gameState, action);
        })
    );
});
```

Now, the test fails because `resolveAction` is not defined yet, so let's implement and export that in `index.js`:

```js
function resolveAction(gameState, action) {
    return []; // TODO: Implement this :)
}
```

```js
// Export in Node.js for testing
if (typeof module === 'object' && module != null && 'exports' in module) {
    module.exports = { getActions, resolveAction };
}
```

Then import it in `test.mjs`:

```js
import { getActions, resolveAction } from './index.js';
```

Test passes! Let's expand it to actually assert some things about the result. How about asserting the sum of probabilities?

```js
it('resolves Defend', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let action = { name: 'Play Defend' };
            let result = resolveAction(gameState, action);
            let sumOfProbabilities = result.reduce((acc, x) => acc + x.probability, 0);
            assert.equal(sumOfProbabilities, 1);
        })
    );
});
```

Fails - the sum is 0. Let's make `resolveAction()` slightly more correct:

```js
function resolveAction(gameState, action) {
    return [{ gameState, probability: 1 }];
}
```

Test passes! Yet it resolves all actions to the same game state. We need to assert some things about how it changes, like block increasing by 5.

```js
it('resolves Defend', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let action = { name: 'Play Defend' };
            let result = resolveAction(gameState, action);
            let sumOfProbabilities = result.reduce((acc, x) => acc + x.probability, 0);
            assert.equal(sumOfProbabilities, 1);
            for (let outcome of result) {
                assert.equal(outcome.gameState.block, gameState.block + 5);
            }
        })
    );
});
```

Oof, my test complexity senses are tingling. But hey, failing test. So, make it pass...

```js
function resolveAction(gameState, action) {
    let resultingGameState = {
        ...gameState,
        block: gameState.block + 5
    };
    return [{ gameState: resultingGameState, probability: 1 }];
}
```

Slowly getting somewhere. It also needs to reduce our energy by 1:

```js
assert.equal(outcome.gameState.energy, gameState.energy - 1);
```

```js
function resolveAction(gameState, action) {
    let resultingGameState = {
        ...gameState,
        block: gameState.block + 5,
        energy: gameState.energy - 1
    };
    return [{ gameState: resultingGameState, probability: 1 }];
}
```

A new fail and a new pass. Then, also, it needs to move Defend from our hand to the discard pile. Uh... How do we assert that?

```js
let firstDefendIndex = gameState.hand.indexOf('Defend');
let expectedHand = gameState.hand.toSpliced(firstDefendIndex, 1);
assert.deepEqual(outcome.gameState.hand, expectedHand);
```

Okay, yeah, this really looks like the wrong way to write this test, but I want to see where this train wreck will lead us.

The test fails... for a hand containing just Strike. Mm. Right. Design question time: How should `resolveAction` handle illegal actions? Should it...

- ...reject them with an exception?
- ...return an error message?
- ...return an empty array?
- ...assume it will not receive illegal actions and resolve them anyway?

The last option would be best for performance (no extra logic to run at the top of each call), but until we have a rules engine that even works, I really believe the code ought to help us catch errors. The error should describe what was wrong, so we want some sort of error message. Making `resolveAction()` return a string when it fails might be weird to handle... I think throwing an exception is the right option.

You know, this legality thing sounds interesting enough that we should implement an `isLegalAction()` function first. Let's scrap all our changes and start over. New test:

```js
describe('isLegalAction()', () => {
    it('handles Play Defend', () => {
        fc.assert(
            fc.property(getArbGameState(), gameState => {
                let result = isLegalAction(gameState, { name: 'Play Defend' });
            })
        );
    });
});
```

Fails because `isLegalAction` is not defined, so let's implement, export and import it:

```js
function isLegalAction(gameState, action) {
    return true; // TODO: specify laws
}

// ...

// Export in Node.js for testing
if (typeof module === 'object' && module != null && 'exports' in module) {
    module.exports = { getActions, isLegalAction };
}
```

Alright, now to assert what the result ought to be:

```js
describe('isLegalAction()', () => {
    it('handles Play Defend', () => {
        fc.assert(
            fc.property(getArbGameState(), gameState => {
                let result = isLegalAction(gameState, { name: 'Play Defend' });
                let expectedResult = gameState.hand.includes('Defend') && gameState.energy >= 1;
                assert.equal(result, expectedResult);
            })
        );
    });
});
```

Fails! Then let's implement it the simplest way to pass:

```js
function isLegalAction(gameState, action) {
    return gameState.hand.includes('Defend') && gameState.energy >= 1;
}
```

Test passes. Cool. Now to do Play Strike:

```js
it('handles Play Strike', () => {
    fc.assert(
        fc.property(getArbGameState(), fc.integer({ min: -1, max: 10 }), (gameState, enemyIndex) => {
            let result = isLegalAction(gameState, { name: 'Play Strike', enemyIndex });
            let expectedResult = gameState.hand.includes('Strike')
                && gameState.energy >= 1
                && enemyIndex >= 0
                && enemyIndex < gameState.enemies.length;
            assert.equal(result, expectedResult);
        })
    );
});
```

Test fails, make it pass (with proper distinction between the two actions now):

```js
function isLegalAction(gameState, action) {
    if (action.name === 'Play Strike') {
        return gameState.hand.includes('Strike')
            && gameState.energy >= 1
            && typeof action.enemyIndex === 'number'
            && gameState.enemies[action.enemyIndex] != null;
    } else if (action.name === 'Play Defend') {
        return gameState.hand.includes('Defend')
            && gameState.energy >= 1;
    } else {
        return false;
    }
}
```

Test passes. Now we do Play Bash, same pattern:

```js
it('handles Play Bash', () => {
    fc.assert(
        fc.property(getArbGameState(), fc.integer({ min: -1, max: 10 }), (gameState, enemyIndex) => {
            let result = isLegalAction(gameState, { name: 'Play Bash', enemyIndex });
            let expectedResult = gameState.hand.includes('Bash')
                && gameState.energy >= 2
                && enemyIndex >= 0
                && enemyIndex < gameState.enemies.length;
            assert.equal(result, expectedResult);
        })
    );
});
```

Red...

```js
/* ... */
else if (action.name === 'Play Bash') {
    return gameState.hand.includes('Bash')
        && gameState.energy >= 2
        && typeof action.enemyIndex === 'number'
        && gameState.enemies[action.enemyIndex] != null;
}
/* ... */
```

...green. Now End Turn.

```js
it('handles End Turn', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let result = isLegalAction(gameState, { name: 'End Turn' });
            let expectedResult = true;
            assert.equal(result, expectedResult);
        })
    );
});
```

```js
/* ... */
else if (action.name === 'End Turn') {
    return true;
}
/* ... */
```

Red, green. That's all we need for now. We could add tests and checks for the game being over, but I believe it's enough that `getActions()` checks for it. I think we can do a slight refactor before we commit, because this function really looks like it ought to be a switch statement:

```js
function isLegalAction(gameState, action) {
    switch (action.name) {
        case 'Play Strike':
            return gameState.hand.includes('Strike')
                && gameState.energy >= 1
                && typeof action.enemyIndex === 'number'
                && gameState.enemies[action.enemyIndex] != null;
        case 'Play Bash':
            return gameState.hand.includes('Bash')
                && gameState.energy >= 2
                && typeof action.enemyIndex === 'number'
                && gameState.enemies[action.enemyIndex] != null;
        case 'Play Defend':
            return gameState.hand.includes('Defend')
                && gameState.energy >= 1;
        case 'End Turn':
            return true;
        default:
            return false;
    }
}
```

Cool cool cool. Commit: _"Add isLegalAction()"_

---

Now - I see some potential here to go back and write the tests for `getActions()` a bit differently now, using this function. First we'll need an arbitrary to generate actions:

```js
let arbAction = fc.oneof(
    fc.record({
        name: fc.constant('Play Strike'),
        enemyIndex: fc.integer({ min: 0, max: 9 })
    }),
    fc.record({
        name: fc.constant('Play Bash'),
        enemyIndex: fc.integer({ min: 0, max: 9 })
    }),
    fc.constant({ name: 'Play Defend' }),
    fc.constant({ name: 'End Turn' })
);
```

Hoping I'm using `fc.oneof()` correctly here. Then we write the test:

```js
it('returns legal actions', () => {
    fc.assert(
        fc.property(getArbGameState(), arbAction, (gameState, action) => {
            let actions = getActions(gameState);
            let matches = actions.filter(x => deepEqual(x, action)).length;
            let expectedMatches = isLegalAction(gameState, action) ? 1 : 0;
            assert.equal(matches, expectedMatches);
        })
    );
});
```

Yes. Yes, here we have it. For every game state and action, if the action is legal, `getActions()` should return it, otherwise, it should not. This can replace our four action-specific tests _and_ the duplicates test! Well, I hope it can, at least. The test passes, but let's prod at `getActions()` to see if this test actually catches bugs.

- If we don't return "End Turn", it fails. Nice.
- If we change the "Play Bash" to check for 3 energy instead of 2, it passes.
    - Wait. Oh no.

Right, okay, the test's not quite as strong as I'd like. Does it not run enough times to hit the case where we have Bash in hand, two energy, and a valid target? Do we need to up the run count?

```js
it('returns legal actions', () => {
    fc.assert(
        fc.property(getArbGameState(), arbAction, (gameState, action) => {
            let actions = getActions(gameState);
            let matches = actions.filter(x => deepEqual(x, action)).length;
            let expectedMatches = isLegalAction(gameState, action) ? 1 : 0;
            assert.equal(matches, expectedMatches);
        }),
        { numRuns: 10000 }
    );
});
```

Apparently `numRuns` is 100 by default. A test that covers this much ground definitely ought to run more often than that. Give it a spin and... Yeah, there we go, property failed after 1674 tests. Now if we remove the error, it does take 160 milliseconds to pass instead of 4 milliseconds, so it has a cost, but it's still near-instant enough for my taste.

I'm curious whether we could and should split it into two tests, though... I saw the docs say something about preconditions, using `.filter` or `fc.pre`. Let's try the latter one:

```js
it('returns legal actions', () => {
    fc.assert(
        fc.property(getArbGameState(), arbAction, (gameState, action) => {
            fc.pre(isLegalAction(gameState, action));
            let actions = getActions(gameState);
            let matches = actions.filter(x => deepEqual(x, action)).length;
            assert.equal(matches, 1);
        }),
        { numRuns: 5000 }
    );
});

it('does not return illegal actions', () => {
    fc.assert(
        fc.property(getArbGameState(), arbAction, (gameState, action) => {
            fc.pre(!isLegalAction(gameState, action));
            let actions = getActions(gameState);
            let matches = actions.filter(x => deepEqual(x, action)).length;
            assert.equal(matches, 0);
        }),
        { numRuns: 5000 }
    );
});
```

One test for legal actions, one test for illegal actions. Tidy! `fc.pre()` cancels the test if the precondition does not hold. Unfortunately, this looks like it doubles the run time - I guess it generates a ton of extra cases now that get canceled. It was a fun experiment, but let's roll it back to a single test.

I'm wondering now about test "efficiency" and distribution between different test cases. Maybe testing actions with enemyIndex above 5 is wasteful. And maybe we do not need to test "End Turn" so often. Apparently `fc.oneof` lets you pass weights?

```js
let arbAction = fc.oneof(
    {
        weight: 5,
        arbitrary: fc.record({
            name: fc.constant('Play Strike'),
            enemyIndex: fc.integer({ min: 0, max: 5 })
        })
    },
    {
        weight: 5,
        arbitrary: fc.record({
            name: fc.constant('Play Bash'),
            enemyIndex: fc.integer({ min: 0, max: 5 })
        })
    },
    { weight: 2, arbitrary: fc.constant({ name: 'Play Defend' }) },
    { weight: 1, arbitrary: fc.constant({ name: 'End Turn' }) }
);
```

Testing this with the Bash energy change, and it doesn't really make a dramatic difference. If I turn the weight way up for "Play Bash" specifically, then it tends to find it in slightly fewer, but it's still within an order of magnitude. Let's roll this back too (but still lower the `enemyIndex` limit to 5).

Enough experimenting, time to commit: _"Replace getActions() tests with 'returns valid actions'"_

---

Small progress, but I'm happy. We learned a bit more about how we can use fast-check, and we found a design for our code that makes more sense with property-based testing. I didn't have a `isValidAction` function when we did this in C#! The tests were way different! Exciting differences!

Next time: implementing `resolveAction()`, for reals this time (probably)!

---

_[View this app version](/crystal-spire/v16/)_ | _[Last commit: Replace getActions() tests with 'returns valid actions'](https://codeberg.org/cvennevik/crystal-spire/src/commit/3622385a73d24475bc96e95c0882af4ae0dcec29)_
