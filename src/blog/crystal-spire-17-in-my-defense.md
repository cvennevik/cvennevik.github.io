---
title: "Crystal Spire #17: In my defense"
date: 2026-01-25T16:30:00+01:00
---

I'm pretty sure we'll actually implement `resolveAction()` now. But first: Remove this TODO comment that's now resolved.

```js
// TODO: Test
function getActions(gameState) {
```

Commit: _"Remove resolved TODO comment"_.

Alright. Okay. Let's start off by copy-pasting the part we got to last time, before we stumbled into the action legality issue, and merging it with our new `isLegalAction()` code:

```js
// index.js
function resolveAction(gameState, action) {
    let resultingGameState = {
        ...gameState,
        block: gameState.block + 5,
        energy: gameState.energy - 1
    };
    return [{ gameState: resultingGameState, probability: 1 }];
}

// ... snipped code ...

// Export in Node.js for testing
if (typeof module === 'object' && module != null && 'exports' in module) {
    module.exports = { getActions, isLegalAction, resolveAction };
}
```

```js
// test.mjs
import { getActions, isLegalAction, resolveAction } from './index.js';

// ... snipped code ...

describe('resolveAction()', () => {
    it('resolves Defend', () => {
        fc.assert(
            fc.property(getArbGameState(), gameState => {
                let action = { name: 'Play Defend' };
                let result = resolveAction(gameState, action);
                let sumOfProbabilities = result.reduce((acc, x) => acc + x.probability, 0);
                assert.equal(sumOfProbabilities, 1);
                for (let outcome of result) {
                    assert.equal(outcome.gameState.block, gameState.block + 5);
                    assert.equal(outcome.gameState.energy, gameState.energy - 1);

                    let firstDefendIndex = gameState.hand.indexOf('Defend');
                    let expectedHand = gameState.hand.toSpliced(firstDefendIndex, 1);
                    assert.deepEqual(outcome.gameState.hand, expectedHand);
                }
            })
        );
    });
});
```

A few things to note:

- `resolveAction()` only handles "Play Defend", and even that is only half-implemented, we still need to move Defend from the hand to the discard pile.
- The test is currently _trying_ to assert that Defend is removed from the hand.
- The test looks like a mess to me, oh moly.
- We are still trying to resolve "Play Defend" for game states where it isn't legal.

Let's comment out that last section of the assertion loop (_shudder_) so we get a passing test, and make `resolveAction()` handle illegal actions in a helpful way. For ease of debugging, `resolveAction()` should always check if the action is legal, and if not, throw an error (this is inefficient, but we'll worry about performance when we have a working system).

```js
for (let outcome of result) {
    assert.equal(outcome.gameState.block, gameState.block + 5);
    assert.equal(outcome.gameState.energy, gameState.energy - 1);

    // TODO:
    // - Remove Defend from hand
    // - Add Defend to discard pile
    // let firstDefendIndex = gameState.hand.indexOf('Defend');
    // let expectedHand = gameState.hand.toSpliced(firstDefendIndex, 1);
    // assert.deepEqual(outcome.gameState.hand, expectedHand);
}
```

Cool, passing tests. Add a new failing test: `resolveAction()` should throw errors for illegal moves.

```js
it('throws an error when the action is illegal', () => {
    fc.assert(
        fc.property(getArbGameState(), arbAction, (gameState, action) => {
            fc.pre(!isLegalAction(gameState, action));

            let error = null;
            try {
                resolveAction(gameState, action);
            } catch (e) {
                error = e;
            }

            assert.ok(error);
            assert.match(error.message, /illegal action/);
        })
    );
});
```

`fc.pre()` comes in handy here to filter for illegal gameState-action combinations in one swing. Now, this test fails immediately on `assert.ok(error)` because error is falsy. Let's try to fix it in one swing:

```js
function resolveAction(gameState, action) {
    if (!isLegalAction(gameState, action)) throw new Error('Cannot resolve an illegal action');

    let resultingGameState = {
        ...gameState,
        block: gameState.block + 5,
        energy: gameState.energy - 1
    };

    return [{ gameState: resultingGameState, probability: 1 }];
}
```

Hey, the test passes now, but "resolves Defend" fails now. Let's make "Play Defend" being legal a precondition:

```js
it('resolves Defend', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let action = { name: 'Play Defend' };
            fc.pre(isLegalAction(gameState, action));
            // ... rest of test ...
        })
    );
});
```

There we go, test passes again. Though I'm curious - my editor told me the Error constructor has a second "options" parameter? Could we pass more useful context there, like what the illegal gameState plus action was?

[MDN says no](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error). That's disappointing. Maybe we can make an error subclass for that instead, then? Is that allowed?

```js
class IllegalActionError extends Error {
    constructor(gameState, action) {
        super('IllegalActionError: Tried to resolve a game state with an illegal action.')
        this.gameState = gameState;
        this.action = action;
    }
}
```

```js
if (!isLegalAction(gameState, action)) throw new IllegalActionError(gameState, action);
```

That works, but will the properties show in my test runner when a test fails? Let's remove the if-check and always throw an error on `resolveAction()` to find out.

```
  Error: Property failed after 1 tests
  { seed: 1896921034, path: "0:0:1:0:4:3:3:3", endOnFailure: true }
  Counterexample: [{"hp":1,"maxHp":80,"block":0,"energy":1,"maxEnergy":3,"hand":["Defend"],"drawPile":[],"discardPile":[],"relics":[],"enemies":[{"name":"Jaw Worm","hp":42,"maxHp":42,"block":0,"nextMove":[],"moveHistory":[],"buffs":[],"debuffs":[]}]}]
  Shrunk 7 time(s)
  
  Hint: Enable verbose mode in order to have the list of all failing values encountered during the run
      -- snipped stack trace -- {
    [cause]: Error: IllegalActionError: Tried to resolve a game state with an illegal action.
        -- snipped stack trace -- {
      gameState: { hp: 1, maxHp: 80, block: 0, energy: 1, maxEnergy: 3, hand: [Array], drawPile: [], discardPile: [], relics: [], enemies: [Array] },
      action: { name: 'Play Defend' }
    }
  }
```

Hey! It does show up! That's lovely, let's keep it this way, I have a feeling it may come in handy later. Also, we can change our "throws an error" test to assert for a specific error class instead of a specific error message (right after returning the if-check and exporting and importing the class):

```js
it('throws an IllegalActionError when the action is illegal', () => {
    fc.assert(
        fc.property(getArbGameState(), arbAction, (gameState, action) => {
            fc.pre(!isLegalAction(gameState, action));

            let error = null;
            try {
                resolveAction(gameState, action);
            } catch (e) {
                error = e;
            }

            assert.ok(error instanceof IllegalActionError);
        })
    );
});
```

Nice stuff, test passes. Okay. Back to resolving Defend. Reinstate the assertion to remove it from the hand:

```js
let firstDefendIndex = gameState.hand.indexOf('Defend');
let expectedHand = gameState.hand.toSpliced(firstDefendIndex, 1);
assert.deepEqual(outcome.gameState.hand, expectedHand);
```

Fails, Defend is still in hand. Implement the fix:

```js
function resolveAction(gameState, action) {
    if (!isLegalAction(gameState, action)) throw new IllegalActionError(gameState, action);

    let firstDefendIndex = gameState.hand.indexOf('Defend');
    let resultingGameState = {
        ...gameState,
        block: gameState.block + 5,
        energy: gameState.energy - 1,
        hand: gameState.hand.toSpliced(firstDefendIndex, 1)
    };

    return [{ gameState: resultingGameState, probability: 1 }];
}
```

Yeaurgh, the test and implementation are uncomfortably similar. Holding my nose and asserting the discard pile situation just the same:

```js
let expectedDiscardPile = [...gameState.discardPile, 'Defend'];
assert.deepEqual(outcome.gameState.discardPile, expectedDiscardPile);
```

Test fails, implement fix:

```js
function resolveAction(gameState, action) {
    if (!isLegalAction(gameState, action)) throw new IllegalActionError(gameState, action);

    let firstDefendIndex = gameState.hand.indexOf('Defend');
    let resultingGameState = {
        ...gameState,
        block: gameState.block + 5,
        energy: gameState.energy - 1,
        hand: gameState.hand.toSpliced(firstDefendIndex, 1),
        discardPile: [...gameState.discardPile, 'Defend']
    };

    return [{ gameState: resultingGameState, probability: 1 }];
}
```

Test passes. I think that's everything that happens when you play Defend. We can successfully resolve it now.

Okay. Let's review the test code. What's the damage?

```js
it('resolves Defend', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let action = { name: 'Play Defend' };
            fc.pre(isLegalAction(gameState, action));

            let result = resolveAction(gameState, action);
            let sumOfProbabilities = result.reduce((acc, x) => acc + x.probability, 0);
            assert.equal(sumOfProbabilities, 1);
            for (let outcome of result) {
                assert.equal(outcome.gameState.block, gameState.block + 5);
                assert.equal(outcome.gameState.energy, gameState.energy - 1);

                let firstDefendIndex = gameState.hand.indexOf('Defend');
                let expectedHand = gameState.hand.toSpliced(firstDefendIndex, 1);
                assert.deepEqual(outcome.gameState.hand, expectedHand);

                let expectedDiscardPile = [...gameState.discardPile, 'Defend'];
                assert.deepEqual(outcome.gameState.discardPile, expectedDiscardPile);
            }
        })
    );
});
```

I mean, it could be worse. But it could be better. We can make the result assertion stronger and assert it always returns one outcome:

```js
let result = resolveAction(gameState, action);
assert.equal(result.length, 1);
```

That lets us simplify and get rid of the for-loop:

```js
it('resolves Defend', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let action = { name: 'Play Defend' };
            fc.pre(isLegalAction(gameState, action));

            let result = resolveAction(gameState, action);
            assert.equal(result.length, 1);

            let outcome = result[0];
            assert.equal(outcome.probability, 1);
            assert.equal(outcome.gameState.block, gameState.block + 5);
            assert.equal(outcome.gameState.energy, gameState.energy - 1);

            let firstDefendIndex = gameState.hand.indexOf('Defend');
            let expectedHand = gameState.hand.toSpliced(firstDefendIndex, 1);
            assert.deepEqual(outcome.gameState.hand, expectedHand);

            let expectedDiscardPile = [...gameState.discardPile, 'Defend'];
            assert.deepEqual(outcome.gameState.discardPile, expectedDiscardPile);
        })
    );
});
```

Okay. I'll take it. I don't see an immediate improvement to make here. I suspect we can add some helper functions to assert expected hands and discard piles when we have more tests that check the same thing, but adding them now seems premature.

We've done a lot of work now, it's high time to commit, but let's leave one little TODO note since we still have a weird `resolveAction()` implementation:

```js
// TODO: Resolve other actions than Play Defend
function resolveAction(gameState, action) {
```

There. Commit: _"Implement resolveAction() for Play Defend"_.

---

Progress is slow, I will admit. Live-blogging the thought process and every little code change slows everything right down. I'm also not sure what I value more - progress on the project, or progress on this blog series.

Factors to consider:

- I only have the opportunity to work on this 1-2 hours a week, at most.
- I have taken breaks for months at a time and will do it again.
- The blog posts make the progress of each work session more concrete and tangible.
- The blog posts help me recover my train of thought between long breaks.
- Writing forces me to justify my decisions and stay on track.
- Writing a blog post will always take some time!
- If I take a break from writing this style of post and make progress outside of them, it will break the continuous train of thought that you can follow along from the very start of the series.

I see three options:

1. Continue code-liveblogging like this, maybe taking slightly coarser steps.
2. Change the series from a liveblogging style to more of a devlog style, only sharing select snippets of code.
    - This would split the coding and writing activities into two separate chunks, giving me a backlog of progress to write about. I think this would make it harder to sit down and knock out another post and a bit of progress.
3. Drop the series entirely and work in private.
    - This has the highest odds of killing the project. Having the project out in public on my website is a persistent encouragement to continue working on it.

In other words, there's no good option here but to keep trucking and tolerate that this be a slow-paced project. This does rhyme with how [Ron Jeffries](https://ronjeffries.com/) (who inspired me to start this series) makes progress on his own projects, though he's written a _lot_ more posts than me and hence accumulated a lot more progress.

Ah well. As long as the time spent feels meaningful.

---

Next time: Strike! Bash! Probably not End Turn quite yet because that's a whole can of worms!

---

_[View this app version](/crystal-spire/v17/)_ | _[Last commit: Implement resolveAction() for Play Defend](https://codeberg.org/cvennevik/crystal-spire/src/commit/a86fd3833ad0b906710a156b3d504f3c482e469c)_
