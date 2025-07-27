---
title: "Slay the Spire #2: Actions and consequences"
date: 2024-07-31T16:10:00+02:00
---

This seems like a good time as any to start talking about what I want out of this project. In-between writing, I've had some time to mull it over.

I want to create a "solver" for Slay the Spire which functions as a **highly interactive analytical tool**. I am imagining it showing the possible actions you can take in any situation, their possible outcomes and their probabilities, and then letting you select an outcome to view and analyze further. I want a tree of past and future game states to move through. I want a search algorithm for optimal actions that is **explainable, auditable, and tunable**. I want to be able to **query** for specific outcomes like "highest possible health remaining" and "highest guaranteed health remaining" and "least turns taken."

So, what I want is less a "solver," something that spits out the solution for you to follow, makes you a passive user, and more a tool that invites you to be an active participant in the analytical process.

I think that's a neat vision to work towards.

---

Today I want to sketch some more HTML and get some essential features in place. Particularly:

- Every possible action you can take in a game state
- Every possible outcome from a given action

Slay the Spire is a card game with a lot of inherent randomness in card draw order, as well as many random card effects, and some randomness in enemy moves. At any time in the game, you likely have many different cards you can play, and you can always end the turn. The game can branch in many different directions depending on the actions you choose, and branches yet again in the random outcomes actions have.

These branching paths are what we are here to explore. We need to display them.

For the opening scenario we've sketched, there are four possible actions we can take:

- Play Bash on Jaw Worm
- Play Strike on Jaw Worm
- Play Defend
- End the turn

One action at a time. Bash is an _attack_ card that costs 2 energy to play, and reads: _"Deal 8 damage. Apply 2 Vulnerable."_ The result of playing it is:

- We go from 3 energy (our starting amount) to 1 energy.
- Bash moves from the hand to the discard pile.
- Jaw Worm goes from 42 to 34 HP.
- Jaw Worm gets 2 turns of the _Vulnerable_ debuff, which causes it to take 50% more damage from attacks.

I realize now I forgot to add energy to the page last time. Better fix that first.

```html
<h2>Player: Ironclad</h2>
<p>HP: 80/80</p>
<p>Energy: 3/3</p>
```

Now. How do we present the action of playing Bash? I suspect this will be first hard and nuanced problem to solve. Let's be naive and continue to use headings for our first draft (and if we're lucky, the naive solution will be good enough):

```html
<h2>Actions</h2>
<h3>Play Bash on Jaw Worm</h3>
```

Now the outcome, which is guaranteed: 

```html
<h3>Play Bash on Jaw Worm</h3>
<ul>
    <li>Energy: -2</li>
    <li>Hand: -1 Bash</li>
    <li>Discard pile: +1 Bash</li>
    <li>Jaw Worm: -8 HP, +2 Vulnerable</li>
</ul>
```

I am terribly, terribly unsure about how to present the outcomes of actions.

We could present them as the complete resulting game state, but that would take a lot of space and make it difficult to see what has changed. So presenting the change seems better.

We could present the change in a number of different ways. We could do "Energy: -2" or "-2 Energy" or "3 → 1 Energy" or "Energy: 1/3." We could do "Hand: -1 Bash" or "Hand: -Bash" or "Hand: Defend, Defend, Defend, Strike" or "Bash: Hand → Discard." Enemy damage has yet more possibilities: "Jaw Worm: -8 HP" or Jaw Worm: 34/42 HP" or "Jaw Worm: -8 (34) HP" or Jaw Worm: 42 → 34 HP." And so on and so on.

How in the world are we to pick a single way to present this? Well, I have some preferences:

- It should be concise. Some actions will have many possible outcomes and many effects per outcome, so we may have to fit dozens of outcomes and hundreds of effects on the page. This data should be as digestible and comparable as possible.
- I was going to write a speculative preference about sets of changes being easy to combine and "do addition on," as I'm curious about modeling the data that way, but it sounded less and less important as I tried to write it. Discarding this idea for now.

Let's aim for concise, digestible, and comparable, then. And for that, the first idea I sketched seems... fine. Good enough to sketch some more. 

Two more card actions. Playing _Strike_ costs 1 energy and deals 6 damage.

```html
<h3>Play Strike on Jaw Worm</h3>
<ul>
    <li>Energy: -1</li>
    <li>Hand: -1 Strike</li>
    <li>Discard pile: +1 Strike</li>
    <li>Jaw Worm: -6 HP</li>
</ul>
```

_Defend_ is a _skill_ card that costs 1 energy and reads "Gain 5 Block." _Block_ prevents the next X damage you would take this turn.

```html
<h3>Play Defend</h3>
<ul>
    <li>Energy: -1</li>
    <li>Armor: +5</li>
    <li>Hand: -1 Defend</li>
    <li>Discard pile: +1 Defend</li>
</ul>
```

Hmm. What if we combined Energy and Armor to one line affecting the player?

```html
<h3>Play Defend</h3>
<ul>
    <li>Player: -1 Energy, +5 Armor</li>
    <li>Hand: -1 Defend</li>
    <li>Discard pile: +1 Defend</li>
</ul>
```

I kind of like that, "-1 Energy" reads nicer than "Energy: -1." We could make them separate list items instead of bundling them, but enemies can also gain and lose armor, so I like the clarity of writing "Player" and "Jaw Worm" in front of changes to HP, armor, buffs and debuffs.

Let's change the other two actions to match. 

```html
<h3>Play Bash on Jaw Worm</h3>
<ul>
    <li>Player: -2 Energy</li>
    <li>Hand: -1 Bash</li>
    <li>Discard pile: +1 Bash</li>
    <li>Jaw Worm: -8 HP, +2 Vulnerable</li>
</ul>
<h3>Play Strike on Jaw Worm</h3>
<ul>
    <li>Player: -1 Energy</li>
    <li>Hand: -1 Strike</li>
    <li>Discard pile: +1 Strike</li>
    <li>Jaw Worm: -6 HP</li>
</ul>
```

Looks good! 

Okay, now for the big one: "End turn." This causes a few things to happen: 

- We discard our hand to the discard pile.
- The enemy makes their move, hitting us for 11 damage.
- We draw five cards from the draw pile.
  - We have precisely five cards in the draw pile, so we know which cards we will draw.
- We refresh our energy, setting it back to 3.
- The enemy picks a new next move.
  - **This is random.** After using Chomp, the Jaw Worm has:
    - 45% chance of using Bellow (gain 3 Strength and 6 Block)
    - 30% chance of using Thrash (deal 7 damage, gain 5 Block)
    - _Normally_ 25% chance of using Chomp again (deal 11 damage), but it cannot use Chomp twice in a row. The wiki isn't clear on this, but I assume this means that Bellow and Thrash become proportionally more likely, to 60% chance and 40% chance, respectively.

This means that ending the turn has two possible outcomes we need to present! How?

Well, headings seem to have been serving us well, so I see no reason to stop now.

```html
<h3>End turn</h3>
<h4>60%</h4>
<ul>
    <li>Player: -11 HP</li>
    <li>Hand: -1 Bash, -2 Defend, +3 Strike</li>
    <li>Draw pile: -4 Strike, -1 Defend</li>
    <li>Discard pile: +1 Bash, +3 Defend, +1 Strike</li>
    <li>Jaw Worm: next move Bellow (gain 3 Strength and 6 Block)</li>
</ul>
<h4>40%</h4>
<ul>
    <li>Player: -11 HP</li>
    <li>Hand: -1 Bash, -2 Defend, +3 Strike</li>
    <li>Draw pile: -4 Strike, -1 Defend</li>
    <li>Discard pile: +1 Bash, +3 Defend, +1 Strike</li>
    <li>Jaw Worm: next move Thrash (deal 7 damage, gain 5 Block)</li>
</ul>
```

You know, this kind of works? It could be a lot more overwhelming. (It will become more overwhelming as we add more cards.)

Most details of the two outcomes are identical, guaranteed. What if we move the guaranteed bits to right after "End turn," before the probabilities? Would that be better? 

```html
<h3>End turn</h3>
<ul>
    <li>Player: -11 HP</li>
    <li>Hand: -1 Bash, -2 Defend, +3 Strike</li>
    <li>Draw pile: -4 Strike, -1 Defend</li>
    <li>Discard pile: +1 Bash, +3 Defend, +1 Strike</li>
</ul>
<h4>60%</h4>
<ul>
    <li>Jaw Worm: next move Bellow (gain 3 Strength and 6 Block)</li>
</ul>
<h4>40%</h4>
<ul>
    <li>Jaw Worm: next move Thrash (deal 7 damage, gain 5 Block)</li>
</ul>
```

Cons: We've gone from two blocks of changes to three, and need to mentally combine them. Pros: There is less to read, and we can clearly separate between guaranteed effects and random effects.

I think the pros outweigh the cons here. The pro/con calculus might shake out differently as game states get more complicated, but I'm happy to gently commit to this structure.

I'm less sure about how we present large changes to the hand, draw, and discard piles. I find it kind of messy to read. Not so much that I have other ideas I want to try out right now, but enough that I think we should keep an eye on it for later.

The "60%" and "40%" subheadings also look a bit too similar to the action headings with our raw, default HTML style. We will probably want to nest them more visibly under their parent heading very soon.

---

Our little HTML sketch is getting quite fleshed out now. A little less straightforward, a little less certain, and a little more deliberative than last time, but we're still making forward progress.

I think we need, and I can get away with, one more round of HTML sketching before we can start thinking about implementing functionality. Right now, this is purely a document, with no hint of anywhere to interact. I don't know where the buttons will go! Or links? Are we using links? And what will happen when we click them?

Too many questions. Need more answers.

If you're reading this and these problems are getting your mind going as much as mine, feel free to message me [by email](mailto:cvennevik@gmail.com) or [by fedi](https://www.hachyderm.io/@cvennevik). I'm not going to chat the project away outside of my blog, but I welcome ideas and suggestions.

Until next time!

---

_[View this app version](/crystal-spire/v2/)_ | _[Last commit: "#2: Actions and consequences"](https://codeberg.org/cvennevik/crystal-spire/src/commit/2fb0c59bcc6ab0799d350b69c9859b1059b7d95d/index.html)_
