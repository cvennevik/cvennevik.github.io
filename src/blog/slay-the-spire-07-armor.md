---
title: "Slay the Spire #7: Armor"
date: 2024-08-24T11:30:00+02:00
---

---

We're back! Nearly two weeks since the last post now. Hard to find time to write as a working parent.

Currently, our page is a bit of dynamically rendered HTML. Some of the content is based on the query string, others are hard-coded. The next logical step is making a little bit less of it hard-coded. Adding armor seems like a nice way to warm up.

Hmm. First I want to do a little refactoring. I want to extract our JavaScript to a separate file. It's not strictly necessary, and has a couple of cons (like adding another round-trip time on first page load, and not being able to throw our whole project around as a single HTML file), but it has several pros that I want right now:
- We can look at all the already-getting-quite-hairy parsing logic and templating without looking at all the HTML wrapping it.
- We can comfortably remove one level of indentation.
- Down the line, we want to be able to _test_ the code, and having a separate file we can import the code from will help us out a lot.

So, creating a file... What's the default name people give JavaScript files now, anyway? script.js? main.js? index.js? index.js lines up neatly with index.html in the file explorer, so let's go with that.

Wow, I've forgotten how to link to external JavaScript files from HTML, it's been so long since I set up a new project without a build system. Quick jump to the [MDN `<script>` element page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)...

Whew, there's quite a few attributes to choose from nowadays! But after copying and pasting our JavaScript to the new file, it looks like we don't need any of the `type` or `async` or `defer` stuff, all we need to write is:

```html
<script src="index.js"></script>
```

I'm wondering if we should also add `type="module"`. JavaScript modules are the modern way of structuring code, but a quick scan of [the JavaScript modules page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) reminds me that, yeah, it only really matters for exporting and importing code, and I'm not planning on splitting index.js into multiple files anytime soon. Let's keep it dead simple and omit it.

Commit: "Extract JavaScript to index.js".

Back to armor. Let's start by sketching it up in hardcoded HTML:

```html
<p>Armor: 5</p>
```

Yeah, that's simple. And when there is no armor, we want to omit that paragraph entirely. Let's make it dynamic by adding a query parameter for "armor":

```js
let armor = queryParams.get('armor');
```

We're not assigning a fallback value here if "armor" is missing, because a `null` value is going to work fine the way we'll use it:

```js
${armor ? `<p>Armor: ${armor}</p>` : ''}
```

JavaScript type coercion is great, actually. If `armor` is any kind of [falsy value](https://developer.mozilla.org/en-US/docs/Glossary/Falsy), like `null`, `undefined`, or `0`, it evaluates to `false` and we render an empty string. If it has a [truthy value](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) - in other words, if we have any kind of armor - we render it in a paragraph. This is really handy and terse! But we need to see that it works, first. Let's add `&armor=5` to our "Play Defend" query string:

```html
<a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&armor=5&energy=2&hand=Bash,Defend,Defend,Strike&draw=Defend,Strike,Strike,Strike,Strike&discard=Defend">
    Play Defend
</a>
```

Wow, these URLs are getting terribly long. But it works! We get "Armor: 5" on that page, and nothing on the others. Commit: "Render armor based on query parameter"

Ah, my hour is already up. Small progress, but progress nonetheless.

---

_[Last commit: Render armor based on query parameter](https://codeberg.org/cvennevik/crystal-spire/src/commit/bc434acde371050735ad5e59736efdcb6ca71861/)_