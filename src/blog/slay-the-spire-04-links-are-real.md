---
title: "Slay the Spire #4: Links are real, and strong, and they are my friend"
date: 2024-08-03T21:26:00+02:00
summary: "Maybe fake links are bad, actually?"
---

---

The thing about doing a project as daily writing-and-coding sessions is you get a lot of time inbetween sessions to mull things over. Two things have been stuck in my mind since last time:

1. My unease with the navigation issue, overriding and re-implementing link behavior.
2. How to dynamically render the HTML based on game state.

I have a good idea for that second issue now, but I just returned from holiday, and lack the time and energy to finish it today. Ideally, I'd like to get a bit of coding done in each post I do, but if I leave this post in the pipes for a third day in a row, I'm going to feel constipated.

Today, we're only talking navigation.

---

To recap the navigation issue: I concluded that we want to navigate between game states, as if they were pages, and that links are the most appropriate UI control for that. I also concluded that _we will have too much state to keep all the data in URLs_, meaning we have to override normal link behavior and re-implement it all to work with our application state.

I was aware, at the time, that it would be messy and difficult to do right. Having sat with it for a day, it now looks _even worse_ in my mind. 

When pages have state stored outside the URL, and links modify that state instead of navigating to a URL, here are all the affordances I can think of that we lose:

- Page history
- Navigating to the next/previous page
- Opening links in a new tab
- Reloading pages without losing data
- Browser bookmarks
- Sharing page links with others

Some of those items sound like a pain to re-implement to the standard of normal links. The rest of them sound _impossible_ to re-implement to the same standard.

These affordances are _useful_ and _expected_. Messing them up would make our app _kind of crap_. I don't want to make this project kind of crap, I want to make it _nice_. Messing with link behavior would make a mess that we cannot clean up.

However. I was struck with an idea. I think it _is_ possible to fit all the necessary page state in less than a couple thousand characters. And if we accomplish that, the constraint that pushed us down this dark path in the first place is gone.

In other words:

**Plain links are back on menu!**

---

_[Last commit: "#3: Introducing links"](https://codeberg.org/cvennevik/crystal-spire/src/commit/12d6098e07ecd5de448b3d76e96805c9496145bb/index.html)_
