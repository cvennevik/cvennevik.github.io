---
title: "Crystal Spire #15: Back into actions"
date: 2025-12-28T13:00:00+02:00
---

Good day, one and all. It's time to make progress on our Slay the Spire solver. I'm not entirely clear on what needs doing, so let's make a list:

1. Finish implementing `getActions()`.
2. Implement a function to resolve actions - something like `resolveAction(gameState, action)`?
3. Compute and render real actions on the page.
4. Something something implement a solver.
  - We'll think more about this one when we get to it.

Having it written down helps! It also helps clarifying the design here - I think every action returned by `getActions()` should be valid input to `resolveAction()`. Hence, "Defeat" and "Victory" do not make any sense as actions, instead there should be no actions available when you win or lose.

Let's update the test we wrote last time to expect an empty list instead:

```js
it('offers no actions when HP is zero', () => {
    fc.assert(
        fc.property(arbGameState, gameState => {
            if (gameState.hp === 0) {
                let actions = getActions(gameState);
                assert.deepEqual(actions, []);
            }
        })
    );
});
```

```
$ node --test
▶ getActions()
  ✔ can play Defend and End Turn (1.181773ms)
  ✔ can play Strike and End Turn (0.146242ms)
  ✖ offers no actions HP is zero (7.617366ms)
    Error: Property failed after 23 tests
    { seed: -1695486517, path: "22:0:0:0", endOnFailure: true }
    Counterexample: [{"hp":0,"maxHp":80,"block":0,"energy":0,"maxEnergy":3,"hand":[],"drawPile":[],"discardPile":[],"relics":[],"enemies":[]}]
    Shrunk 3 time(s)
```

Nice. Writing these tests feels really smooth. Then we update getActions to match:

```js
if (gameState.hp === 0) {
    return [];
}
```

Tests pass! Commit: _"getActions(): return no actions when dead"_.

Our solver will have to implement a separate function to check for victory and defeat now, but that sounds sensible. Oh, speaking of victory, we win when there are no enemies left:

```js
    it('offers no actions when no enemies are left', () => {
        fc.assert(
            fc.property(arbGameState, gameState => {
                if (gameState.enemies.length === 0) {
                    let actions = getActions(gameState);
                    assert.deepEqual(actions, []);
                }
            })
        );
    });
```

Test failed, so then we update the implementation:

```js
if (gameState.hp === 0 || gameState.enemies.length === 0) {
    return [];
}
```

Tests pass, commit: _"getActions(): return no actions when no enemies left"_.

I'm noticing that our test logic looks suspiciously similar to our implementation logic. I'm also noticing that we have an `if`-check in our test. I have gotten the impression that tests should be as simple and explicit as possible, to make sure you understand what they are asserting, and to minimize the risk of logic errors. This is typically easy with example-based testing - given a specific input, expect a specific output, no logic to check for. But now we're asserting for properties that only hold for certain conditions, so we cannot write the test quite that simply. I'm smelling the risk of writing slightly tricky logic into the test, introducing an error, and writing that very same error into the implementation.

Maybe we can mitigate this risk by specifying the logic differently in our tests and our implementation. Maybe [that `.map()` chaining method](https://fast-check.dev/docs/core-blocks/arbitraries/combiners/any/#map) can help us here.

```js
it('offers no actions when HP is zero', () => {
    fc.assert(
        fc.property(arbGameState.map(x => ({ ...x, hp: 0 })), gameState => {
            let actions = getActions(gameState);
            assert.deepEqual(actions, []);
        })
    );
});

it('offers no actions when no enemies are left', () => {
    fc.assert(
        fc.property(arbGameState.map(x => ({ ...x, enemies: [] })), gameState => {
            let actions = getActions(gameState);
            assert.deepEqual(actions, []);
        })
    );
});
```

Yeah, that works. I mean, ideally, we'd change the game state arbitrary so that it didn't produce a variety of values for `hp` and `enemies` that we just discard, but this looks like an improvement. Speaking of improvement, I think "it returns no actions" sounds better than "offers no actions", so let's change that as well. Commit: _"Refactor property-based tests"_.

While we're at it, let's rewrite the other tests too: "can play Defend and End Turn" and "can play Strike and End Turn". These tests do not translate as cleanly, and I believe we need to test for a full handful of properties to replace them.

Given that both the player and enemies are alive:

- You can end the turn.
- If you have Defend in hand and at least 1 Energy, you can play Defend.
- If you have Strike in hand and at least 1 Energy, you can play Strike on any of the enemies.
- If you have Bash in hand and at least 2 Energy, you can play Bash on any of the enemies.
- You never get duplicate actions.

There, work cut out for us. And we'll need a more powerful way to specify arbitrary game state variants to do it. How about a little arbitrary factory?

```js
function getArbGameState(options = {}) {
    let defaults = {
        hp: fc.integer({ min: 1, max: 80 }),
        maxHp: fc.constant(80),
        block: fc.constant(0),
        energy: fc.nat({ max: 999 }),
        maxEnergy: fc.constant(3),
        hand: fc.array(arbCard, { minLength: 0, maxLength: 10 }),
        drawPile: fc.constant([]),
        discardPile: fc.constant([]),
        relics: fc.constant([]),
        enemies: fc.array(arbEnemy, { minLength: 1, maxLength: 5 })
    };
    return fc.record({ ...defaults, ...options });
}
```

Now we have a set of useful defaults (the player is alive, enemies are alive) with an optional parameter to specify new arbitraries for any property. Then we update our tests:

```js
it('returns no actions when HP is zero', () => {
    fc.assert(
        fc.property(getArbGameState({ hp: fc.constant(0) }), gameState => {
            let actions = getActions(gameState);
            assert.deepEqual(actions, []);
        })
    );
});

it('returns no actions when no enemies are left', () => {
    fc.assert(
        fc.property(getArbGameState({ enemies: fc.constant([]) }), gameState => {
            let actions = getActions(gameState);
            assert.deepEqual(actions, []);
        })
    );
});
```

Tests pass! Commit: _"tests: add getArbGameState() function"_.

Now we can write all the tests we want. First, we can always end the turn:

```js
it('returns End Turn', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let actions = getActions(gameState);
            // ... how do we assert this??
        })
    );
});
```

Okay we're not quite there yet. Uh. We want to assert that actions contains an object with one specific property with a specific value. It sounds like we need our `deepEqual()` function again. Time to dig through the Git log to recover it... [Ah, found it](https://codeberg.org/cvennevik/crystal-spire/commit/09da913d5bc97495c5417f97726a65803ef52a46#diff-df6a091d1844505b07e077d5ec678869b3067b5a).

Lil' copy-paste back into the project, and we can write:

```js
it('returns End Turn', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let actions = getActions(gameState);
            return actions.some(x => deepEqual(x, { name: 'End Turn' }));
        })
    );
});
```

Nice! That passes. Though, I haven't seen it fail, and we're returning true/false now instead of using an `assert` function, so I'm paranoid that it doesn't actually test it properly. Let me just change the implementation to call it 'Finish Turn' instead to see that it fails... Okay yeah it fails, loudly, this works fine, undo the text change.

Next, let's ensure there are never any duplicate actions.

```js
it('does not return duplicate actions', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let actions = getActions(gameState);
            return actions.every(x => {
                let matches = actions.filter(y => deepEqual(x, y));
                return matches.length === 1;
            });
        })
    );
});
```

Passes - the quadratic complexity makes me frown, but it's the simplest solution I see, and I'll take a simple test over a slightly more efficient test. Let's return the "Play Bash" action twice to make sure it fails... Yeah, it fails, undo the error.

Cool! Next up, Defend.

```js
it('returns Play Defend', () => {
    fc.assert(
        fc.property(getArbGameState({
            hand: fc.array(arbCard, { minLength: 0, maxLength: 9 }).map(x => x.concat('Defend')),
            energy: fc.integer({ min: 1, max: 999 })
        }), gameState => {
            let actions = getActions(gameState);
            return actions.some(x => deepEqual(x, { name: 'Play Defend' }));
        })
    );
});
```

Passes! That way of specifying "any hand of cards including Defend" is clunky, though, and we'll have to repeat that pattern. Can we improve it? Do the docs offer a cleaner solution? ...three minutes of browsing say "no". Let's extract a function, then.

```js
function getArbHand(options = {}) {
    let includedCards = options?.with ?? [];
    let constraints = { minLength: 0, maxLength: 10 - includedCards.length };
    return fc.array(arbCard, constraints).map(x => x.concat(includedCards));
}
```

```js
it('returns Play Defend', () => {
    fc.assert(
        fc.property(getArbGameState({
            hand: getArbHand({ with: ['Defend'] }),
            energy: fc.integer({ min: 1, max: 999 })
        }), gameState => {
            let actions = getActions(gameState);
            return actions.some(x => deepEqual(x, { name: 'Play Defend' }));
        })
    );
});
```

Passes! We move on.

Next, Strike. This one's different, because when we have multiple enemies, we can have multiple actions with different targets. Our current code doesn't even support multiple targets yet. We can start with a test constrained to a single enemy:

```js
it('returns Play Strike', () => {
    fc.assert(
        fc.property(getArbGameState({
            hand: getArbHand({ with: ['Strike'] }),
            energy: fc.integer({ min: 1, max: 999 }),
            enemies: fc.tuple(arbEnemy)
        }), gameState => {
            let actions = getActions(gameState);
            return actions.some(x => deepEqual(x, { name: 'Play Strike', enemyIndex: 0 }));
        })
    );
});
```

Cool, that passes. But we also want to assert there are not additional "Play Strike" actions with invalid enemy indexes. Maybe like this?

```js
it('returns Play Strike', () => {
    fc.assert(
        fc.property(getArbGameState({
            hand: getArbHand({ with: ['Strike'] }),
            energy: fc.integer({ min: 1, max: 999 }),
            enemies: fc.tuple(arbEnemy)
        }), gameState => {
            let actions = getActions(gameState);
            let strikeActions = actions.filter(x => x.name === 'Play Strike').toSorted((a, b) => a.enemyIndex - b.enemyIndex);
            assert.deepEqual(strikeActions, [{ name: 'Play Strike', enemyIndex: 0 }]);
        })
    );
});
```

Oof, it's getting a bit involved, but it works. We can complicate the code even more so it tests multiple enemies:

```js
it('returns Play Strike', () => {
    fc.assert(
        fc.property(getArbGameState({
            hand: getArbHand({ with: ['Strike'] }),
            energy: fc.integer({ min: 1, max: 999 })
        }), gameState => {
            let actions = getActions(gameState);
            let strikeActions = actions
                .filter(x => x.name === 'Play Strike')
                .toSorted((a, b) => a.enemyIndex - b.enemyIndex);
            let expectedStrikeActions = [...gameState.enemies.entries()]
                .map(([idx, _value]) => ({ name: 'Play Strike', enemyIndex: idx }))
                .toSorted((a, b) => a.enemyIndex - b.enemyIndex);
            assert.deepEqual(strikeActions, expectedStrikeActions);
        })
    );
});
```

Oof, ouch, this is setting off my "test is too complicated" sensors. I would never do this with example-based testing. But, I mean, it works:

```
AssertionError [ERR_ASSERTION]: Expected values to be loosely deep-equal:
    
    [
      {
        enemyIndex: 0,
        name: 'Play Strike'
      }
    ]
    
    should loosely deep-equal
    
    [
      {
        enemyIndex: 0,
        name: 'Play Strike'
      },
      {
        enemyIndex: 1,
        name: 'Play Strike'
      }
    ]
```

Sooo... Maybe it's fine? Maybe it's fine. We can fix the implementation now:

```js
if (gameState.hand.includes('Strike') && gameState.energy >= 1) {
    for (let i = 0; i < gameState.enemies.length; i++) {
        actions.push({ name: 'Play Strike', enemyIndex: i });
    }
}
```

Green! Onwards to Bash. It works the same way as Strike, except it costs two energy:

```js
it('returns Play Bash', () => {
    fc.assert(
        fc.property(getArbGameState({
            hand: getArbHand({ with: ['Bash'] }),
            energy: fc.integer({ min: 2, max: 999 })
        }), gameState => {
            let actions = getActions(gameState);
            let bashActions = actions
                .filter(x => x.name === 'Play Bash')
                .toSorted((a, b) => a.enemyIndex - b.enemyIndex);
            let expectedBashActions = [...gameState.enemies.entries()]
                .map(([idx, _value]) => ({ name: 'Play Bash', enemyIndex: idx }))
                .toSorted((a, b) => a.enemyIndex - b.enemyIndex);
            assert.deepEqual(bashActions, expectedBashActions);
        })
    );
});
```

Yup, fails as expected. Implement fix:

```js
if (gameState.hand.includes('Bash') && gameState.energy >= 2) {
    for (let i = 0; i < gameState.enemies.length; i++) {
        actions.push({ name: 'Play Bash', enemyIndex: i });
    }
}
```

And the tests pass! I think this means `getActions()` is fully implemented for our Jaw Worm fight. Yay!

I notice now that these tests only assert the presence of actions when they should be there, and not the absence of actions when they should not be there. For instance, our tests pass if we do not require energy to play Bash. I mean. We could test this too. We could... maybe...

```js
it('returns Play Bash', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let actions = getActions(gameState);
            let bashActions = actions
                .filter(x => x.name === 'Play Bash')
                .toSorted((a, b) => a.enemyIndex - b.enemyIndex);
            let canPlayBash = gameState.hand.includes('Bash') && gameState.energy >= 2;
            let expectedBashActions = canPlayBash
                ? [...gameState.enemies.entries()]
                    .map(([idx, _value]) => ({ name: 'Play Bash', enemyIndex: idx }))
                    .toSorted((a, b) => a.enemyIndex - b.enemyIndex)
                : [];
            assert.deepEqual(bashActions, expectedBashActions);
        })
    );
});
```

Lord almighty. I mean, um, both arrays are already sorted by enemyIndex, so we could trim the sorting...?

```js
it('returns Play Bash', () => {
    fc.assert(
        fc.property(getArbGameState(), gameState => {
            let actions = getActions(gameState);
            let bashActions = actions.filter(x => x.name === 'Play Bash');
            let canPlayBash = gameState.hand.includes('Bash') && gameState.energy >= 2;
            let expectedBashActions = canPlayBash
                ? [...gameState.enemies.entries()]
                    .map(([idx, _value]) => ({ name: 'Play Bash', enemyIndex: idx }))
                : [];
            assert.deepEqual(bashActions, expectedBashActions);
        })
    );
});
```

You know what? Sure. Let's go with this. It's significantly less transparent than splitting it up into multiple tests, but it asserts exactly when we can play Bash, and it does it in a single test. We might get punished for this later, but we will take that punishment when it happens.

Let's rewrite the rest of the tests to the same style, extract a `getIndexes()` function, inline a few variables, and give the remaining variables similar names:

```js
function getIndexes(array) {
    return [...array.entries()].map(([idx, _value]) => idx);
}

describe('getActions()', () => {
    it('returns no actions when HP is zero', () => {
        fc.assert(
            fc.property(getArbGameState({ hp: fc.constant(0) }), gameState => {
                let actions = getActions(gameState);
                assert.deepEqual(actions, []);
            })
        );
    });

    it('returns no actions when no enemies are left', () => {
        fc.assert(
            fc.property(getArbGameState({ enemies: fc.constant([]) }), gameState => {
                let actions = getActions(gameState);
                assert.deepEqual(actions, []);
            })
        );
    });

    it('does not return duplicate actions', () => {
        fc.assert(
            fc.property(getArbGameState(), gameState => {
                let actions = getActions(gameState);
                return actions.every(x => {
                    let matches = actions.filter(y => deepEqual(x, y));
                    return matches.length === 1;
                });
            })
        );
    });

    it('returns End Turn', () => {
        fc.assert(
            fc.property(getArbGameState(), gameState => {
                let actions = getActions(gameState).filter(x => x.name === 'End Turn');
                let expectedActions = [{ name: 'End Turn' }];
                assert.deepEqual(actions, expectedActions);
            })
        );
    });

    it('returns Play Defend', () => {
        fc.assert(
            fc.property(getArbGameState(), gameState => {
                let actions = getActions(gameState).filter(x => x.name === 'Play Defend');
                let expectedActions = gameState.hand.includes('Defend') && gameState.energy >= 1
                    ? [{ name: 'Play Defend' }]
                    : [];
                assert.deepEqual(actions, expectedActions);
            })
        );
    });

    it('returns Play Strike', () => {
        fc.assert(
            fc.property(getArbGameState(), gameState => {
                let actions = getActions(gameState).filter(x => x.name === 'Play Strike');
                let expectedActions = gameState.hand.includes('Strike') && gameState.energy >= 1
                    ? getIndexes(gameState.enemies).map(idx => ({ name: 'Play Strike', enemyIndex: idx }))
                    : [];
                assert.deepEqual(actions, expectedActions);
            })
        );
    });

    it('returns Play Bash', () => {
        fc.assert(
            fc.property(getArbGameState(), gameState => {
                let actions = getActions(gameState).filter(x => x.name === 'Play Bash');
                let expectedActions = gameState.hand.includes('Bash') && gameState.energy >= 2
                    ? getIndexes(gameState.enemies).map(idx => ({ name: 'Play Bash', enemyIndex: idx }))
                    : [];
                assert.deepEqual(actions, expectedActions);
            })
        );
    });
});
```

That looks like a fairly comprehensive test suite to me. Commit: _"getActions(): support targetting different enemies"_.

---

We can now cross `getActions()` off our to-do list. The list is now:

1. Implement `resolveAction(gameState, action)`.
2. Compute and render real actions on the page.
3. Implement a solver.

`resolveAction()` is going to be significantly more complicated. That's good. We can handle a challenge.

Until next time!

---

_[View this app version](/crystal-spire/v15/)_ | _[Last commit: getActions(): support targetting different enemies](https://codeberg.org/cvennevik/crystal-spire/src/commit/95e799fc29b6452b2210ccc71cd6302adfdc225b)_
