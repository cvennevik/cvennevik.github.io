---
title: "Slay the Spire #5: Going dynamic"
date: 2024-08-04T16:15:00+02:00
summary: "A little less HTML, a little more JavaScript."
---

---

Hello! I am now, for the first time, writing this at a desktop computer. I'm kind of uncomfortable with how quickly I am able to write (I tend to stumble mentally when my typing catches up to my thinking), but this should make the development process a lot smoother.

Today we're going to have some fun. We're going to make our page content dynamic, based on the page URL.

To do that, we have to commit to an approach for rendering dynamic HTML.

---

I'm a professional web developer. As is the way of things, of modern web development, I've only ever really worked with JavaScript frameworks. My experience with authoring dynamic web pages is mainly by using Vue. Building this project as a Vue app would be familiar and easy to me.

Here's the rub: I don't want to use a JavaScript framework for this project.

There's a mix of reasons for this, some more frivolous than others. If I'm being honest, the core reason is a certain sense of _craft snobbishness_. I like to author lean web pages that are fast to transfer, fast to parse, fast to run. Wherever possible, I like to build things myself using the features of the platform, instead of introducing dependencies like frameworks and libraries. I like to keep the total technology stack simple, shallow, shelf-stable.

I know, rationally, that it won't make a difference to user experience if I author this using a performant framework like Svelte or Solid. It would probably be less code to write, in total. I might get things done quicker. Be more productive.

But I don't wanna. I don't even wanna install any npm packages. I wanna try doing this all with vanilla JavaScript. Call it a learning experience, because I've never rendered dynamic UI in vanilla JavaScript before. But by God I am going to stumble my way through this and drag you with me.

---

I did a little bit of research to see what approaches exist for changing the DOM with JavaScript. Of the ones I found, one stood out as being the least fuss to get started with: `innerHTML`.

Here's what we do: Add a little script to the bottom of our document...

```html
<script>

</script>
```

...and set `document.body.innerHTML`.

```html
<script>
    document.body.innerHTML = "<h1>Hello World</h1>";
</script>
```

Now our page says "Hello World"! We've successfully changed the page content with JavaScript, in one line of fairly uncomplicated code. Sadly, this also replaces all the HTML we've written up to this point, but we're about to fix that.

Bear with me. The next step may not be for the faint of heart.

```html
<body>
    <!-- Cut... -->
</body>
<script>
    // ...and paste.
    document.body.innerHTML = `
        <h1>Slay the Spire solver</h1>
        <h2>Player: Ironclad</h2>
        <p>HP: 80/80</p>
        <p>Energy: 3/3</p>
        <details open>
            <summary>Hand (5)</summary>
            <ul>
                <li>Bash</li>
                <li>Defend</li>
                <li>Defend</li>
                <li>Defend</li>
                <li>Strike</li>
            </ul>
        </details>
        <details>
            <summary>Draw pile (5)</summary>
            <ul>
                <li>Defend</li>
                <li>Strike</li>
                <li>Strike</li>
                <li>Strike</li>
                <li>Strike</li>
            </ul>     
        </details>
        <details>
            <summary>Discard pile (0)</summary>
        </details>
        <details>
            <summary>Relics (1)</summary>
            <ul>
                <li>Burning Blood <i>(At the end of combat, heal 6 HP)</i></li>
            </ul>
        </details>
        <h2>Enemies</h2>
        <h3>Jaw Worm</h3>
        <p>HP: 42/42</p>
        <p>Next move: Chomp (Deal 11 damage)</p>
        <h2>Actions</h2>
        <h3><a href="#">Play Bash on Jaw Worm</a></h3>
        <ul>
            <li>Player: -2 Energy</li>
            <li>Hand: -1 Bash</li>
            <li>Discard pile: +1 Bash</li>
            <li>Jaw Worm: -8 HP, +2 Vulnerable</li>
        </ul>
        <h3><a href="#">Play Strike on Jaw Worm</a></h3>
        <ul>
            <li>Player: -1 Energy</li>
            <li>Hand: -1 Strike</li>
            <li>Discard pile: +1 Strike</li>
            <li>Jaw Worm: -6 HP</li>
        </ul>
        <h3><a href="#">Play Defend</a></h3>
        <ul>
            <li>Player: -1 Energy, +5 Armor</li>
            <li>Hand: -1 Defend</li>
            <li>Discard pile: +1 Defend</li>
        </ul>
        <h3>End turn</h3>
        <ul>
            <li>Player: -11 HP</li>
            <li>Hand: -1 Bash, -2 Defend, +3 Strike</li>
            <li>Draw pile: -4 Strike, -1 Defend</li>
            <li>Discard pile: +1 Bash, +3 Defend, +1 Strike</li>
        </ul>
        <h4><a href="#">End turn 1 (60% chance)</a></h4>
        <ul>
            <li>Jaw Worm: next move Bellow (gain 3 Strength and 6 Block)</li>
        </ul>
        <h4><a href="#">End turn 2 (40% chance)</a></h4>
        <ul>
            <li>Jaw Worm: next move Thrash (deal 7 damage, gain 5 Block)</li>
        </ul>
    `;
</script>
```

Now - as long as you have JavaScript enabled - the page looks just like before. We've committed a slight crime against HTML by turning it into a JavaScript string, but hey, we're still authoring HTML, just uh, not in the actual HTML itself.

Oh, we should leave a note for visitors with JavaScript disabled...

```html
<body>
    <noscript>
        This application only works with JavaScript enabled.
    </noscript>
</body>
```

Testing it by disabling JavaScript in the browser devtools. Yeah, it works.

Now what was the point of this crime? Well, now we can do this:

```html
<script>
    let queryString = window.location.search;
    document.body.innerHTML = `
        <h1>Slay the Spire solver</h1>
        <p>Query string: ${queryString}</p>
        ...
    `;
</script>
```

Opening `index.html`, and the new paragraph just says "Query string". But if we open `index.html?hello=world`, we get "Query string: ?hello=world"! **We can now use the query string to change page contents!**

Okay okay let's roll back that example and do something useful with this. Let's try setting the player HP using `?hp=80`.

```js
let queryParams = new URLSearchParams(window.location.search);
let hp = queryParams.get('hp');
document.body.innerHTML = `
    ...
    <p>HP: ${hp}/80</p>
    ...
`;
```

Visiting `index.html?hp=80`, it works! Oh, but visiting `index.html` it now says "HP: null/80". We had better fall back to a default value when it's not set.

```js
let hp = queryParams.get('hp') ?? 80;
```

There, back to normal. We can do the same for energy:

```js
let energy = queryParams.get('energy') ?? 3;
// ...
<p>Energy: ${energy}/3</p>
```

For cards in hand it's not as straightforward because it's a list. We could do `?hand=Bash,Defend,Defend,Defend,Strike`, and generate the list like this:

```js
let hand = queryParams.get('hand')?.split(',') ?? ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'];
// ...
<details open>
    <summary>Hand (${hand.length})</summary>
    <ul>
        ${hand.map(card =>
            `<li>${card}</li>`
        ).join('')}
    </ul>
</details>
```

Same for discard pile and draw pile!

```js
let drawPile = queryParams.get('draw')?.split(',') ?? ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'];
let discardPile = queryParams.get('discard')?.split(',') ?? [];
// ...
<details>
    <summary>Draw pile (${drawPile.length})</summary>
    <ul>
        ${drawPile.map(card =>
            `<li>${card}</li>`
        ).join('')}
    </ul>
</details>
<details>
    <summary>Discard pile (${discardPile.length})</summary>
    <ul>
        ${discardPile.map(card =>
            `<li>${card}</li>`
        ).join('')}
    </ul>
</details>
```

And for completeness, though we won't change them our scenario, let's set maximum HP, maximum energy, and relics.

```js
let maxHp = queryParams.get('maxhp') ?? 80;
let maxEnergy = queryParams.get('maxenergy') ?? 3;
let relics = queryParams.get('relics')?.split(',') ?? ['Burning Blood'];
// ...
<p>HP: ${hp}/${maxHp}</p>
<p>Energy: ${energy}/${maxEnergy}</p>
// ...
<details>
    <summary>Relics (${relics.length})</summary>
    <ul>
        ${relics.map(relic =>
            `<li>${relic}</li>`
        ).join('')}
    </ul>
</details>
```

Sweet. All the player data can be controlled by query string now. Oh, but we lost one thing in the process: the description for Burning Blood. I think we could write relic descriptions in an object, and look it up from there:

```js
let relicDescriptions = { 'Burning Blood': 'At the end of combat, heal 6 HP' };
// ...
`<li>${relic} <i>(${relicDescriptions[relic]})</i></li>`
```

Yeah, works fine!

Next up would be enemy state, but I'm running out of time and energy for the day, and it looks tricky enough that I want to make it its own session. Before we wrap, let's make our links do something. We can't set all of the state yet, so we will just set the parts we are able to:

```html
<h3>
    <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&energy=1&hand=Defend,Defend,Defend,Strike&draw=Defend,Strike,Strike,Strike,Strike&discard=Bash">
        Play Bash on Jaw Worm
    </a>
</h3>
<h3>
    <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&energy=2&hand=Bash,Defend,Defend,Defend&draw=Defend,Strike,Strike,Strike,Strike&discard=Strike">
        Play Strike on Jaw Worm
    </a>
</h3>
<h3>
    <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&energy=2&hand=Bash,Defend,Defend,Strike&draw=Defend,Strike,Strike,Strike,Strike&discard=Defend">
        Play Defend
    </a>
</h3>
<h4>
    <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=69&energy=3&hand=Defend,Strike,Strike,Strike,Strike&draw=&discard=Bash,Defend,Defend,Defend,Strike">
        End turn 1 (60% chance)
    </a>
</h4>
<h4>
    <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=69&energy=3&hand=Defend,Strike,Strike,Strike,Strike&draw=&discard=Bash,Defend,Defend,Defend,Strike">
        End turn 2 (40% chance)
    </a>
</h4>
```

Now we have it! We have links to different game states! 🎉

There's just a few things left to fix before the scenario is fully-functioning, for some strained definition of "just a few":
1. Controlling enemy state via query string
2. Adding player armor
3. Adding enemy armor and debuffs
4. Generating valid actions based on the current state

The first item will probably be one session of work, and the second and third another session. The fourth might take a little bit longer. Probably longer than all the work to that point put together.

Caveats before closing:

- `innerHTML` is very simple and fun to work with. Setting it is also a **security risk** in case of malicious user input. Here, we're interpolating query parameters directly into the HTML, so it's trivial to craft URLs that add _anything_ to the document. It's not ideal, but I'm choosing to accept this risk for now.
- This simple scheme of using query parameters for each part of the state takes a lot of characters, and complex game states may need thousands of characters in the query string. Down the line, we'll want to encode this data in a more compact way.

Mmh. Tired now. Write more later.