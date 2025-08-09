---
title: "Crystal Spire #9: Buffing the Worm's nails"
date: 2025-08-09T15:00:00+02:00
---

Small quality-of-life update: There is now a link at the bottom of each post in this series to a runnable version of the app, precisely as it was at the time of writing.

---

The goal this time is to add enemy armor, buffs and debuffs to the dynamic state. The Jaw Worm gains armor and the Strength buff when using _Bellow_, and... hold up, I think I have some inconsistent terminology here.

Double-checking, and yes, it's not called "armor", it's called "block". Let's search, replace and commit: _"Rename 'Armor' to 'Block'"_.

Take two: The goal this time is to add enemy _block_, buffs and debuffs. The Jaw Worm gains block and the Strength buff when using _Bellow_, and gains the Vulnerable debuff when we play _Bash_.

Adding Vulnerable seems most straightforward, since we already have an action that's supposed to add it. We can add a `debuffs` property to the default Jaw Worm enemy object:

```js
{
    name: 'Jaw Worm',
    hp: 42,
    maxHp: 42,
    nextMove: 'Chomp',
    debuffs: []
}
```

Then, we need to update the serialized "enemies" data in our URLs, to make sure they include the `debuffs` array. This is a bit of a pain, as I had to look up how to URI encode JSON again, and the strings I get now have less characters replaced than what's committed from before, which makes me nervous I'm doing it wrong. The data seems to deserialize fine, though, so let's just commit: _"Add 'debuffs' array to enemy state"_.

---

Before we go any further, I want to reduce the pain of updating the URLs. Let's refactor and add some helpful functions. I want a `serialize` function that takes a game state object and serializes it to a URL query string, and I want a `deserialize` function that takes a URL query string and deserializes it to a game state object.

Step one: gather all our state variables into a single object.

```js
let gameState = {
    hp: queryParams.get('hp') ?? 80,
    maxHp: queryParams.get('maxhp') ?? 80,
    block: queryParams.get('block'),
    energy: queryParams.get('energy') ?? 3,
    maxEnergy: queryParams.get('maxenergy') ?? 3,
    hand: queryParams.get('hand')?.split(',') ?? ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'],
    drawPile: queryParams.get('draw')?.split(',') ?? ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'],
    discardPile: queryParams.get('discard')?.split(',') ?? [],
    relics: queryParams.get('relics')?.split(',') ?? ['Burning Blood'],
    enemies: JSON.parse(queryParams.get('enemies')) ?? [
        {
            name: 'Jaw Worm',
            hp: 42,
            maxHp: 42,
            nextMove: 'Chomp',
            debuffs: []
        }
    ]
}
```

This also requires adding `gameState.` in front of everywhere we use these variables, e.g. `<p>HP: ${gameState.hp}/${gameState.maxHp}</p>`. The page still loads fine, so this seems committable: _"Gather game state variables into a gameState object"_.

Step two: move our deserialization code into a `deserialize` function.

```js
function deserialize(queryString) {
    let queryParams = new URLSearchParams(queryString);
    return  {
        hp: queryParams.get('hp') ?? 80,
        maxHp: queryParams.get('maxhp') ?? 80,
        block: queryParams.get('block'),
        energy: queryParams.get('energy') ?? 3,
        maxEnergy: queryParams.get('maxenergy') ?? 3,
        hand: queryParams.get('hand')?.split(',') ?? ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'],
        drawPile: queryParams.get('draw')?.split(',') ?? ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'],
        discardPile: queryParams.get('discard')?.split(',') ?? [],
        relics: queryParams.get('relics')?.split(',') ?? ['Burning Blood'],
        enemies: JSON.parse(queryParams.get('enemies')) ?? [
            {
                name: 'Jaw Worm',
                hp: 42,
                maxHp: 42,
                nextMove: 'Chomp',
                debuffs: []
            }
        ]
    }
}

let gameState = deserialize(window.location.search);
```

Runs fine, commit: _"Extract deserialize(queryString) function"_.

Step three: write a `serialize` function, and use it to generate the URLs we need.

```js
function serialize(gameState) {
    return `?hp=${gameState.hp}`
        + `&maxhp=${gameState.maxHp}`
        + `&block=${gameState.block}`
        + `&energy=${gameState.energy}`
        + `&maxenergy=${gameState.maxEnergy}`
        + `&hand=${String.join(gameState.hand, ',')}`
        + `&draw=${String.join(gameState.drawPile, ',')}`
        + `&discard=${String.join(gameState.discardPile, ',')}`
        + `&relics=${String.join(gameState.relics, ',')}`
        + `&enemies=${JSON.stringify(gameState.enemies)}`;
}
```

I _think_ I did that right, so let's test it out:

```
<a href="${encodeURI(serialize({ ...gameState, energy: 1, hand: ['Defend', 'Defend', 'Defend', 'Strike'], discardPile: ['Bash'], enemies: [{ ...gameState.enemies[0], hp: 34 }]}))}">
    Play Bash on Jaw Worm
</a>
```

Still some effort to write out, but somewhat easier to read and modify. Testing it out, we get an error in the console: _"Uncaught TypeError: String.join is not a function"_. Whoops, I forgot how joining an array into a string works. This should work instead:

```js
        + `&hand=${gameState.hand.join(',')}`
        + `&draw=${gameState.drawPile.join(',')}`
        + `&discard=${gameState.discardPile.join(',')}`
        + `&relics=${gameState.relics.join(',')}`
```

Success! The page renders, the URL looks alright, and clicking on it renders a correctly updated page! ...mostly.

Below player HP it now says:

```
Block: null
```

That doesn't look right. When we don't have block, it gets serialized as the string "null". Having no block probably shouldn't be stored as `null`. Storing it as 0 sounds correct, and since 0 is falsy, the templating logic we've written should still work.

Update `deserialize` to default `block` to 0:

```js
        block: queryParams.get('block') ?? 0,
```

Bingo! Works like a charm now. Let's rewrite the remaining four URLs:

```js
<a href="${encodeURI(serialize({ ...gameState, energy: 2, hand: ['Bash', 'Defend', 'Defend', 'Defend'], discardPile: ['Strike'], enemies: [{ ...gameState.enemies[0], hp: 36 }] }))}">
    Play Strike on Jaw Worm
</a>
```

```js
<a href="${encodeURI(serialize({ ...gameState, block: 5, energy: 2, hand: ['Bash', 'Defend', 'Defend', 'Strike'], discardPile: ['Defend'] }))}">
    Play Defend
</a>
```

```js
<a href="${encodeURI(serialize({ ...gameState, hp: 69, hand: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'], discardPile: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'] }))}">
    End turn 1 (60% chance)
</a>
```

```js
<a href="${encodeURI(serialize({ ...gameState, hp: 69, hand: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'], discardPile: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'] }))}">
    End turn 2 (40% chance)
</a>
```

Yes, far more readable. And it all seems to work! Though, clicking around, it seems that by using `gameState` to produce our URLs, we can now end up in game states that partially combine the effects of each action. For instance, clicking "Play Strike on Jaw Worm" then "Play Defend" puts us in a state where we have 5 Block _and_ the Jaw Worm has 36 HP. It's not a valid state, since we still have 2 Energy left and Strike in hand, but hey, kind of neat. Commit: _"Create URLs with new serialize function"_.

Neat as that bug is, let's clean it up by creating a `defaultGameState` and basing default state and the action URLs on that.

```js
let defaultGameState = {
    hp: 80,
    maxHp: 80,
    block: 0,
    energy: 3,
    maxEnergy: 3,
    hand: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'],
    drawPile: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'],
    discardPile: [],
    relics: ['Burning Blood'],
    enemies: [
        {
            name: 'Jaw Worm',
            hp: 42,
            maxHp: 42,
            nextMove: 'Chomp',
            debuffs: []
        }
    ]
};
```

Now we can use that state if the URL has no query string, and remove the default values from `deserialize`, since every query string will now have fully serialized game state data:

```js
let gameState = window.location.search ? deserialize(window.location.search) : defaultGameState;
```

```js
function deserialize(queryString) {
    let queryParams = new URLSearchParams(queryString);
    return {
        hp: queryParams.get('hp'),
        maxHp: queryParams.get('maxhp'),
        block: queryParams.get('block'),
        energy: queryParams.get('energy'),
        maxEnergy: queryParams.get('maxenergy'),
        hand: queryParams.get('hand')?.split(','),
        drawPile: queryParams.get('draw')?.split(','),
        discardPile: queryParams.get('discard')?.split(','),
        relics: queryParams.get('relics')?.split(','),
        enemies: JSON.parse(queryParams.get('enemies'))
    }
}
```

Seems to work. Commit: _"Replace defaults in deserialize() with defaultGameState object"_. Then, replace our use of `gameState` with `defaultGameState` when generating URLs, like so:

```js
<a href="${encodeURI(serialize({ ...defaultGameState, energy: 1, hand: ['Defend', 'Defend', 'Defend', 'Strike'], discardPile: ['Bash'], enemies: [{ ...defaultGameState.enemies[0], hp: 34 }] }))}">
    Play Bash on Jaw Worm
</a>
```

Now the URLs stay consistent regardless of current game state. Commit: _"Base URLs on defaultGameState instead of current gameState"_.

Whoops. Seems to be a bug now where zero block gets deserialized as the string `"0"`, so the page says "Block: 0". Let's update `deserialize` to convert strings to numbers where appropriate:

```js
    hp: Number(queryParams.get('hp')),
    maxHp: Number(queryParams.get('maxhp')),
    block: Number(queryParams.get('block')),
    energy: Number(queryParams.get('energy')),
    maxEnergy: Number(queryParams.get('maxenergy')),
```

That fixes it. Commit: _"Correctly deserialize number properties as numbers instead of strings"_

---

Whew. I think that's enough refactoring done to the point where we can continue adding the Vulnerable debuff.

We need to store two aspects of debuffs in state: which debuff it is (by its name, probably), and how many "stacks" it has. Most buffs and debuffs are stackable, which either intensifies it (in Strength's case) or increases its duration (in Vulnerable's case).

Going off of this, we could represent the Vulnerable debuff as an object:

```js
{ name: 'Vulnerable', stacks: 2 }
```

Add it to the enemy's `debuffs` when playing _Bash_:

```js
<a href="${encodeURI(serialize({ ...defaultGameState, energy: 1, hand: ['Defend', 'Defend', 'Defend', 'Strike'], discardPile: ['Bash'], enemies: [{ ...defaultGameState.enemies[0], hp: 34, debuffs: [{ name: 'Vulnerable', stacks: 2 }] }] }))}">
    Play Bash on Jaw Worm
</a>
```

Then for each enemy, render `enemy.debuffs` similarly to how we render cards and relics:
```js
<details open>
    <summary>Debuffs (${enemy.debuffs.length})</summary>
    <ul>
        ${enemy.debuffs.map(debuff =>
            `<li>${debuff.name} (${debuff.stacks})</li>`
        ).join('')}
    </ul>
</details>
```

Putting it all together, it works! That was easy enough. Though I'm not sure I like displaying a collapsible list of zero debuffs, so let's only render it when the enemy has at least one debuff:

```js
${enemy.debuffs.length > 0 ?
`<details open>
    <summary>Debuffs (${enemy.debuffs.length})</summary>
    <ul>
        ${enemy.debuffs.map(debuff => `<li>${debuff.name} (${debuff.stacks})</li>`).join('')}
    </ul>
</details>`
: ''}
```

Looks better. Now we can commit: _"Add Vulnerable debuff when playing Bash"_.

---

For adding enemy block and Strength, none of the existing links in our template should lead to that, as the Jaw Worm is not about to use _Bellow_. To work around this, we can add a test link to the bottom of the page.

```js
<h2>Test links</h2>
<a href="${encodeURI(serialize({ ...defaultGameState /* TODO: assign strength and block */ }))}">
    Jaw Worm with 3 Strength and 6 Block
</a>
```

Enemy block can be a `block` property, enemy buffs can be a `buffs` property, and each buff can have a `name` and `stacks`, just like debuffs.

We add the properties to our default game state:

```js
{
    name: 'Jaw Worm',
    hp: 42,
    maxHp: 42,
    block: 0,
    nextMove: 'Chomp',
    buffs: [],
    debuffs: []
}
```

Update `block` and `buffs` in our test link:

```js
<a href="${encodeURI(serialize({ ...defaultGameState, enemies: [{ ...defaultGameState.enemies[0], block: 6, buffs: [{ name: 'Strength', stacks: 3 }] }] }))}">
    Jaw Worm with 3 Strength and 6 Block
</a>
```

Then render enemy block and buffs like we render player block and enemy debuffs:

```js
${enemy.block ? `<p>Block: ${enemy.block}</p>` : ''}
```

```js
${enemy.buffs.length > 0 ?
`<details open>
    <summary>Buffs (${enemy.buffs.length})</summary>
    <ul>
        ${enemy.buffs.map(buff => `<li>${buff.name} (${buff.stacks})</li>`).join('')}
    </ul>
</details>`
: ''}
```

Save, reload the page - curious, the page fails to render, and we have an error in the console: _"Uncaught TypeError: can't access property "length", enemy.buffs is undefined"_. Turns out I have an old serialied state in the URL where `buffs` doesn't exist yet. Clearing the query string fixes it.

Now, clicking the test link, it says the Jaw Worm has 6 Block and a 3 Strength. Success! We can commit: _"Add enemy block and buffs, add test link for this"_.

---

I'm fairly happy with progress this time. We have more maintainable code for serializing and deserializing game state, our action links are easier to keep up-to-date, and a little more of the game state is now representable.

If my counting is correct, the only piece of game state missing to be able to represent any moment in the Jaw Worm fight is the Jaw Worm's next move and its history of previous moves (to determine possible next moves). A good task for next time.

---

_[View this app version](/crystal-spire/v9/)_ | _[Last commit: Set 'enemies' array based on query parameter](https://codeberg.org/cvennevik/crystal-spire/src/commit/e7139b1d6117008c221f849c19d693bec3404e32)_