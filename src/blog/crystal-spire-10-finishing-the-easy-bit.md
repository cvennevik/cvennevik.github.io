---
title: "Crystal Spire #10: Finishing the easy bit"
date: 2025-08-16T14:30:00+02:00
---

Happy Saturday! Let's round up this game state business.

So, I'd forgotten that we already _do_ have enemies' next move stored in state and rendered in the HTML. We just need to add their move history. Let's call it `moveHistory`.

```js
{
    name: 'Jaw Worm',
    hp: 42,
    maxHp: 42,
    block: 0,
    nextMove: 'Chomp',
    moveHistory: [],
    buffs: [],
    debuffs: []
}
```

Then, for the "end turn" actions, add 'Chomp' to their move history:

```js
<a href="${encodeURI(serialize({
    ...defaultGameState,
    hp: 69,
    hand: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'],
    discardPile: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'],
    enemies: [{ ...defaultGameState.enemies[0], moveHistory: ['Chomp'] }]
}))}">
    End turn 1 (60% chance)
</a>
```

```js
<a href="${encodeURI(serialize({
    ...defaultGameState,
    hp: 69,
    hand: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'],
    discardPile: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'],
    enemies: [{ ...defaultGameState.enemies[0], moveHistory: ['Chomp'] }]
}))}">
    End turn 2 (40% chance)
</a>
```

Then finally, per enemy, display their move history:

```js
${enemy.moveHistory.length > 0 ? `<p>Past moves: ${enemy.moveHistory.join(', ')}</p>` : ''}
```

Neat! Now the resulting states from the "end turn" action say "Past moves: Chomp"! Commit: _"Add moveHistory to enemies"_.

I noticed we don't update the Jaw Worm's next move in those URLs, so we need to fix that as well:

```js
enemies: [{ ...defaultGameState.enemies[0], moveHistory: ['Chomp'], nextMove: 'Bellow' }]
```

```js
enemies: [{ ...defaultGameState.enemies[0], moveHistory: ['Chomp'], nextMove: 'Thrash' }]
```

And then we'll need to update `moveDescriptions`:

```js
let moveDescriptions = {
    'Chomp': 'Deal 11 damage',
    'Thrash': 'Deal 7 damage, gain 5 Block',
    'Bellow': 'Gain 3 Strength and 6 Block'
};
```

Done! Commit: _"Update enemy nextMove in action URLs"_.

We're now able to render any game state in the fight based on URL parameters. Nice.

---

The next step will be a little more complicated. Those hardcoded actions and outcomes need to go, and we need to generate real ones based on the current game state. Once we have that, we'll be truly able to navigate through the entire fight.

I've been thinking about this a lot since last time, so let's establish some key concepts:

- An **action** is something the player can do anytime they're offered a choice. Examples:
    - Play a card
    - Use a potion
    - End the turn
    - Make a choice an effect asks of them (e.g. after drawing a card, _Warcry_ asks you to place a card in hand back on top of the deck )
- An **outcome** is a resulting game state from an action.
    - An action may have multiple potential outcomes when randomness is involved (e.g. which cards you draw, what next move the enemy picks, etc.)

Based on this, I think we want two functions:
- `getActions(gameState)` returns the actions you can take in a given game state.
- `getOutcomes(gameState, action)` returns the potential outcomes of an action, including the probability of each outcome.

There's lots of ways we could structure the return values of these. In my first go implementing this in C#, "action" objects were tied to the game state they came from, and could `.Resolve()` to their potential outcomes. I'm going to try restricting actions and outcomes to be pure data this time around, on the hunch that shuffling pure data around will be easier to optimize for performance later than shuffling functions or methods around.

We can start out with this simple schema for actions:

```js
{ name: 'Play Defend' }
```

Every action has a `name` property. Some actions may have additional properties:

```js
{ name: 'Play Strike', enemyIndex: 0 }
```

We can write our `getOutcomes` function to read the additional properties only as needed, with different blocks of logic running depending on the action's `name`, which leaves a lot of flexibility for implementing future actions.

The outcome schema can be similarly simple:

```js
{ gameState: gameState, probability: 0.6 }
```

Given this rough plan, we can break it down into three sequential steps:

1. Implement `getActions`
2. Implement `getOutcomes`
3. Update our rendering logic to use these.

Starting with step 1... "Implement `getActions`" seems a lot more complicated than anything we've done so far. Let's describe the requirements in plain English first, as far as they apply to the Jaw Worm fight:

- If we have _Strike_ in hand and 1 or more Energy, we can 'Play Strike' on the Jaw Worm.
- If we have _Bash_ in hand and 2 or more Energy, we can 'Play Bash' on the Jaw Worm.
- If we have _Defend_ in hand and 1 or more Energy, we can 'Play Defend'.
- We can always 'End Turn'.

Oh. When we put it like this, it looks really straightforward to implement, actually.

```js
function getActions(gameState) {
    let actions = [];
    if (gameState.hand.includes('Strike') && gameState.energy >= 1) {
        actions.push({ name: 'Play Strike', enemyIndex: 0 });
    }
    if (gameState.hand.includes('Bash') && gameState.energy >= 2) {
        actions.push({ name: 'Play Bash', enemyIndex: 0 });
    }
    if (gameState.hand.includes('Defend') && gameState.energy >= 1) {
        actions.push({ name: 'Play Defend' });
    }
    actions.push('End Turn');
    return actions;
}
```

Although, now I realize there are lots of cases our requirements don't handle. What if we're dead? What if we have multiple enemies?

And for that matter, how do we check that this code even works? So far, we've been refreshing the page, clicking around and seeing if everything looks correct, but now we have a lot more cases to check, and this isn't even wired up to the page yet.

I think this is the signal to start writing tests. For now, let's leave a comment above the function:

```js
// TODO: Test
```

And commit: _"Add getActions function_".

Next time: setting up our first tests!

---

_[View this app version](/crystal-spire/v10/)_ | _[Last commit: Add getActions function](https://codeberg.org/cvennevik/crystal-spire/src/commit/3ef1ac5b8d289ab1352c6abde946c20c29fa527e)_
