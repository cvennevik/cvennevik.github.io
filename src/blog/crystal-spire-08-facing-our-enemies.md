---
title: "Crystal Spire #8: Facing our enemies"
date: 2025-02-01T17:38:00+02:00
---

Happy new year! Parenting is going great. We just moved my home computer out of the living room and into my office, so now, for the first time in a long while, I have comfortable spot to code in. The baby is napping longer and more consistently, too, so let's use a little of that time to chip away at this again. Dust off those programming muscles.

There's still a fair bit of game state to make dynamic, namely the enemy. This fight has one enemy, but there can be several enemies, and each of them has:
- A name
- HP
- Armor
- Buffs and debuffs
- Its next move
- A history of previous moves
    - This affects which move it may choose next

All of these need to be made into a variable (an array of "enemy" objects, most likely), and then we need a way to encode it into the query string. Let's save the tricky bit for later, and hard-code the data first:

```js
let enemies = [
    {
        name: 'Jaw Worm',
        hp: 42,
        maxHp: 42,
        nextMove: 'Chomp'
    }
];
```

Then use the data in our templating:

```js
<h2>Enemies</h2>
${enemies.map(enemy => `
    <h3>${enemy.name}</h3>
    <p>HP: ${enemy.hp}/${enemy.maxHp}</p>
    <p>Next move: ${enemy.nextMove}</p>
`).join('')}
```

Looks okay, but we're missing the move description now. I don't think this is the long-term solution, but let's make a dictionary of descriptions, just like we did for relics, to keep it out of the dynamic state.

```js
let moveDescriptions = { 'Chomp': 'Deal 11 damage' };
// ...
<p>Next move: ${enemy.nextMove} (${moveDescriptions[enemy.nextMove]})</p>
```

Oh yeah, this is going to be a problem very soon. The Jaw Worm deals more than 11 damage when it gains strength, so a static dictionary of descriptions is not going to cut it. That's a future problem though, and an interesting one at that. Future us can spend a whole session figuring that out.

Commit: "Render enemies based on 'enemies' array".

Now the difficult part. We need to encode this data, this array of objects, into our query string. We've only handled simple values and lists of simple values to this point. We need a different method for handling a list of objects.

Starting with the simplest thing that will possibly work... Can we just parse it as JSON?

```js
let enemies = JSON.parse(queryParams.get('enemies')) ?? [
    {
        name: 'Jaw Worm',
        hp: 42,
        maxHp: 42,
        nextMove: 'Chomp'
    }
];
```

Well, the fallback value works correctly when "enemies" is missing from the query string.

Now what if we add `?enemies=[]` to it? Aha! No enemies!

Then what about `?enemies=[{"name": "Jaw Worm", "hp": 30, "maxHp": 42, "nextMove": "Chomp"}]`? Goodness, me, it works. Didn't even need to deal with URI encoding.

Let's add this query parameter to our sketched action links, so we can finally see our attacks dealing damage:

```js
<a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&energy=1&hand=Defend,Defend,Defend,Strike&draw=Defend,Strike,Strike,Strike,Strike&discard=Bash&enemies=%5B%7B%22name%22%3A%20%22Jaw%20Worm%22%2C%20%22hp%22%3A%2034%2C%20%22maxHp%22%3A%2042%2C%20%22nextMove%22%3A%20%22Chomp%22%7D%5D">
    Play Bash on Jaw Worm
</a>
// ...
<a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&energy=2&hand=Bash,Defend,Defend,Defend&draw=Defend,Strike,Strike,Strike,Strike&discard=Strike&enemies=%5B%7B%22name%22%3A%20%22Jaw%20Worm%22%2C%20%22hp%22%3A%2036%2C%20%22maxHp%22%3A%2042%2C%20%22nextMove%22%3A%20%22Chomp%22%7D%5D">
    Play Strike on Jaw Worm
</a>
```

Had to URI-encode the array to fit it into the HTML, but the JSON parsing still works. And these links work! We're dealing damage!

Commit: "Set 'enemies' array based on query parameter".

All this URL parsing is very space-inefficient, but I don't think it the URL will grow long enough to cause issues while we're only running the Jaw Worm fight. It's good enough for now.

Hm, I keep excusing design flaws that I imagine we will fix later. I wonder if that's necessary.

Anyway. Next time: enemy armor, buffs, and debuffs.

---

_[Last commit: Set 'enemies' array based on query parameter](https://codeberg.org/cvennevik/crystal-spire/src/commit/fe7c1d1bcd8ecaa20f4ef01108a4854c0cb896b9)_