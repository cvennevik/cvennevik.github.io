---
title: "Slay the Spire #3: Introducing links"
date: 2024-08-01T12:40:00+02:00
summary: "For good and ill."
---

---

So I've been thinking. 

Last time, I said we were aiming to explore the branching paths a game of Slay the Spire can take. A key feature - maybe _the_ key feature - would be to view the resulting state of an action's outcome. And I think that means selecting an outcome, then having that outcome's state displayed on the screen, with all of its actions and all of their outcomes. And then you should be able to view a _next_ outcome a level deeper, and again, and you should be able to move back to a previous one you have viewed.

This app needs to let you **navigate between states.**

That means links. With custom behavior. And messing with the browser history so back/forward buttons work as expected.

I mean, _maybe_ we can avoid that? Maybe the links can have query strings defining the complete next state? But no, no, the page should show you the path from the initial state, dozens and dozens of actions deep, with links to jump back to them. We can't fit all of that data into a query string, because I'm pretty sure browsers won't guarantee what happens when URLs exceed 2048 characters. And there's all kinds of other persistent state we may want.

I think there's no way around it.

Boy, what a can of worms we have in store for us.

---

Thankfully, to sketch out the HTML, we can leave that can of worms on the table, unopened. That's all implementation details, and we're not implementing anything yet.

So. Every outcome wants a link. Every link wants text that describes the page it leads to. The outcome headings are precisely that. Let's reuse them.

```html
<h3><a href="">Play Bash on Jaw Worm</a></h3>
```

Yeah, visually, that looks good to me. I'm unsure about the `href` value - I know that `href="#"` is safe for links that shouldn't take you off the current page, but `href=""` seems to have the same effect. Let me look up what the difference is.

Huh. Hard to test on my phone, but some people say that `href=""` actually reloads the page, while `href="#"` jumps to the top of the page? The latter seems like less trouble. If it's the wrong approach, it should be easy to fix later.

```html
<h3><a href="#">Play Bash on Jaw Worm</a></h3>
```

Now for Strike:

```html
<h3><a href="#">Play Strike on Jaw Worm</a></h3>
```

And Defend:

```html
<h3><a href="#">Play Defend</a></h3>
```

And end turn... uh oh:

```html
<h3>End turn</h3>
<ul>
    <li>Player: -11 HP</li>
    <li>Hand: -1 Bash, -2 Defend, +3 Strike</li>
    <li>Draw pile: -4 Strike, -1 Defend</li>
    <li>Discard pile: +1 Bash, +3 Defend, +1 Strike</li>
</ul>
<h4><a href="#">60%</a></h4>
<ul>
    <li>Jaw Worm: next move Bellow (gain 3 Strength and 6 Block)</li>
</ul>
<h4><a href="#">40%</a></h4>
<ul>
    <li>Jaw Worm: next move Thrash (deal 7 damage, gain 5 Block)</li>
</ul>
```

I mean. It _works_. But "60%" and "40%" seem like terrible link texts, especially when we get more outcomes on the page with the same probabilities. I want link texts, taken out of context of where they are on the page, to give a decent idea of what they lead to, and to be unique.

Maybe if we expand the headings, swallow the cost of duplicating some text, it would be better.

```html
<h4><a href="#">End turn (60%)</a></h4>
<h4><a href="#">End turn (40%)</a></h4>
```

Yeah. Better. And actually makes the page more readable to me. Still, the links won't be unique in the cases where they have the same probability.

Could we, uh, number them?

```html
<h4><a href="#">End turn 1 (60%)</a></h4>
<h4><a href="#">End turn 2 (40%)</a></h4>
```

Looks... kind of weird, but I don't have a better idea for making them unique. Now we have two unexplained numbers right next to each other. It reads confusing to me, the meaning of the percentage looks _more_ ambiguous now.

Would adding more text help us, again?

```html
<h4><a href="#">End turn 1 (60% chance)</a></h4>
<h4><a href="#">End turn 2 (40% chance)</a></h4>
```

It's all subjective, so I don't know if other people finds this clearer, but this is my favorite so far. I'm happy to proceed with this.

Nice! The headings look better, and we now have links that promise us that we can explore all the ways the game can go. I like the look of this!

We actually have enough HTML sketched up now that we could stop it here and start working on implementing the logic, making this skeleton come alive. I think that's the right thing to do. Sketching up more features at this point would help surface design issues we will run into, but I trust our ability to solve them later better than our ability to prepare for them now.

---

A lovely thing about these blog posts, these dev logs, is that it forces me to put each and every little thing I do into words. It forces me to justify my decisions. As a result, my development so far has been more deliberative, more steady and well-reasoned, than anything I can remember developing in private. I am very happy with every little step we've made along the way, even if - or maybe _because_ - it's very small pieces of work, all in all.

These posts also crystallize my train of thought in a way where it's easy for me to pick up where I left off. If - sorry, _when_ - I stop working on this project for a while, I have enough context made permanent on these pages that I should be able to pick it up exactly where I left off, even if it has been years.

I wonder if I'll have to put that theory to the test someday. Oh well.

Next time, let's write some JavaScript. Let's make things _change_.

---

_[Last commit: "#3: Introducing links"](https://codeberg.org/cvennevik/crystal-spire/src/commit/12d6098e07ecd5de448b3d76e96805c9496145bb/index.html)_
