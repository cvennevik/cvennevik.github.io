---
title: "Slay the Spire #1: HTML first"
date: 2024-08-30T22:40:00+02:00
---

There are few things as daunting as a blank page.

---

Right now, all my solver project has to show for itself is a little bit of preamble and a vague idea. I do not have a scaffold to work on. I do not have a plan. I do not even have any clearly defined goals.

Before it's too late, let's get something down on the page, so we can look at it and discuss it. Let's write some HTML, in our first file, `index.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Page title</title>
</head>
<body>

</body>
</html>
```

My editor is kind enough to generate an empty HTML snippet for me. Let's replace the title:

```html
<title>Slay the Spire solver</title>
```

And let's add our first heading to the body:

```html
<h1>Slay the Spire solver</h1>
```

It's a thoroughly uninspiring name, and I want to find a more unique and identifiable name soon. Let's delay that until we have a bit of functionality, so we can pick a name that captures what our application actually does. 

Opening the page, everything seems to display as expected! This is our Hello World. We now have something to start adding to.

At this point, I would consider making our first commit to version control. Alas: I do not have a development machine with me. I am coding this on my phone, using the first Android app I was able to find for web development. I do not have any version control set up, nor any command line available. Until I return home from my vacation, our process and tooling will stay exceedingly simple. So: no commiting anything right now. 

Let's proceed to add something interesting. To start analyzing games and available actions and potential outcomes, I will at minimum need to display a game state. Let's start with that.

First, some player data:

```html
<h2>Player: Ironclad</h2>
<p>Health: 80/80</p>
```
Already, I am forced to decide on how to present the data. I could structure this as a table, or as a list, or lists of lists, or sections, or something else entirely.

I've decided on using headings to separate the game state data into labeled sections for a few reasons:

- Headings are important for screen reader navigation.
- Heading levels let me organize the data into a hierarchy of content.
- Headings do not require any "nesting" of markup elements, compared to tables, lists, and lists of lists.

For simple data like player health, I've opted to keep it to a dead simple paragraph tag. In my first sketches of this (_mea culpa_, I did try some of this out without you, before I had the space to write), I tried making it a table, or an unordered list. In the end, it all seemed like too much structure. A single-line paragraph for player health will suffice for now.

Now what other game state exists? There's the cards in hand, cards in draw pile, and cards in discard pile. Let's write up some example lists, for a realistic first turn:

```html
<h3>Hand</h3>
<ul>
    <li>Bash</li>
    <li>Defend</li>
    <li>Defend</li>
    <li>Defend</li>
    <li>Strike</li>
</ul>
<h3>Draw pile</h3>
<ul>
    <li>Defend</li>
    <li>Strike</li>
    <li>Strike</li>
    <li>Strike</li>
    <li>Strike</li>
</ul>
<h3>Discard pile</h3>
<p>Empty</p>
```

Your hand can contain up to 10 cards, and your draw and discard piles can contain any number of cards, so these make sense as lists. Implicitly, I am structuring them as unordered sets, as order in hand does not matter and order in draw pile is typically unknown. Let's sort them alphabetically for consistency.

Though, that draw pile is taking up a lot of screen space for a relatively unimportant piece of information. What if we made it collapsible, in a `<details>` element?

```html
<details>
    <summary>Draw pile</summary>
    <ul>
        <li>Defend</li>
        <li>Strike</li>
        <li>Strike</li>
        <li>Strike</li>
        <li>Strike</li>
    </ul>
</details>
```

Hmm, too little information when collapsed. Maybe if we add the card count to the summary...

```html
<summary>Draw pile (5)</summary>
```

This sits well with me. It also neatly mirrors the game UI, which only shows you the number of cards in draw pile by default.

Let's turn the hand and discard pile into `<details>` elements, too.

```html
<details>
    <summary>Hand (5)</summary>
    <ul>
        <li>Bash</li>
        <li>Defend</li>
        <li>Defend</li>
        <li>Defend</li>
        <li>Strike</li>
    </ul>
</details>
<!-- Draw pile -->
<details>
    <summary>Discard pile (0)</summary>
</details>
```

Ah, but the hand should be open by default, because cards in hand are immediately relevant.

```html
<details open>
```

That looks alright. In the future, I think I will want to add a little extra information to the cards, like energy cost, card type, effect, and such. For the "sketching" I'm doing now, I think it's better to skip it and add more essential things.

One more piece of player data: relics, which grant passive effects.The Ironclad's starting relic is _Burning Blood_, which heals 6 health at the end of every combat.

Ah, correction: It heals 6 _HP_ at the start of every combat, according to the Slay the Spire wiki. I forgot the game uses the term "HP," not "health." Let's fix our display:

```html
<p>HP: 80/80</p>
```

And now, another `<details>` list for relics:

```html
<details>
    <summary>Relics (1)</summary>
    <ul>
        <li>Burning Blood (At the end of combat, heal 6 HP)</li>
    </ul>
</details>
```

You know, I think the description would work well in italics. And though the `<i>` tag doesn't mean "italic" anymore, based on [MDN's usage notes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/i#usage_notes), I think I can swing it as semantically valid.

```html
<li>Burning Blood <i>(At the end of combat, heal 6 HP)</i></li>
```

I think that's every bit of player information. It's enough for our UI to start taking shape, at least.

Let's add the second half of the game state: the enemy. I want to start with the _Jaw Worm_, one of the three enemies you can encounter on the first floor.

```html
<h2>Enemies</h2>
<h3>Jaw Worm</h3>
<p>HP: 42/42</p>
```

We nest the "Jaw Worm" heading under an "Enemies" heading, since encounters can have more than one enemy.

Other than HP, we also know our enemies' _intention_, what move they will make when we end the turn. The Jaw Worm has three possible moves, but always starts with _Chomp_.

```html
<p>Next move: Chomp <i>(Deal 11 damage)</i></p>
```

Huh, I don't really like the italics here. Somehow I like it for relics, but not for enemy moves. Maybe because relics are more memorable and their descriptions are longer.

```html
<p>Next move: Chomp (Deal 11 damage)</p>
```

That's better.

---

It's growing late, so we wrap the post here.

So far, I am happy with how smooth the process is. We've gone from "nothing" to "something," which is major progress. I'm much more comfortable with the default, unstyled HTML look than I expected. At some point I will want to improve the presentation for clarity and usability, but the raw look will serve us well until the document structure stabilizes.

I'm also very happy I started drafting the HTML first instead of diving into JavaScript and writing logic. My C# version of the solver started with game logic, and the UI never graduated beyond printing game state to the console. It's very satisfying to me that this version is already more visually interesting than my last attempt.

More than that, I realize that starting with the HTML is extremely helpful for clarifying what I am making. It takes all my fuzzy, loose thoughts, and puts them in concrete terms on the page. It helps me see them better. It frees up my mind to think of next steps. It lets me start planning what features I want, see where they will fit in, start seeing friction and flaws where I need to adapt the design.

I feel very prepared to expand on this tomorrow. Probably writing more HTML, still: actions and outcomes. Until then!