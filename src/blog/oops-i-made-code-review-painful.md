---
title: "Oops, I made code review painful"
date: 2023-04-14T22:15:00+02:00
---

A few months ago I wrote [a post](https://www.cvennevik.no/blog/code-reviews-are-overloaded/) suggesting that you should limit your pull request reviews to their bare essentials, the "bare essentials" here meaning "bugs and irreversible design decisions." I've had the chance to try doing this at work, and now I can share my findings with you:

Boy howdy, I do not enjoy this at all.

---

There is one critical issue I did not consider in my original post: whether or not the different parts of review were any enjoyable or engaging. As it turns out, by trimming out every "non-essential" concern from my reviews, I have trimmed away every bit of the activity that was somewhat enjoyable and engaging. My slimmed-down review process is fast, efficient, and insufferable.

Evaluating and discussing design choices, suggesting renames and refactorings, and taking the time to find and point out things I like - these were all things that engaged the parts of my brain that I enjoy using. It was inefficient and slow and occasionally tiring, but at the end of a review session, I was satisfied with my work.

Now, code reviews come in two variants: the small and easy ones that I can knock out quickly and get out of my sight, and the large and difficult ones that drain the soul out of me. 1000 line diffs used to be tough, multiple-hour review sessions where at the end I would be happy with my effort. This has been replaced with me stumbling away from the monitor trying to reawaken the parts of my brain that shut down halfway through after refusing to process any more of the code that I was jamming through my eye sockets.

At least there is a fun irony in all of happening because I made my reviews "less demanding."

Now that I've subjected myself to my own suggested experiment, my feelings on pull requests reviews have cooled significantly. I do not want to do any more of these "efficient" reviews than I absolutely have to. Yet despite not enjoying it, I do not want to go back to the way I reviewed code before. Even if it is more bearable, it is still slow, inefficient and tiring.

Honestly, at this point, I just want to be subjected to as little code review possible, both as a reviewer and a author. This is something I am working on!

I'm a big fan of the [Ship / Show / Ask](https://martinfowler.com/articles/ship-show-ask.html) model, which makes pull request reviews something authors explicitly opt into. To start pushing the needle away from "ask for review on all changes all the time," I have asked for and received permission to merge low-risk changes without review. And if you haven't tried it before, let me tell you, being able to merge refactoring and test work straight into mainline feels so very freeing. I highly recommend it.
