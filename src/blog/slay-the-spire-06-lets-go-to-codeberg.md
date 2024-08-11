---
title: "Slay the Spire #6: Let's go to Codeberg!"
date: 2024-08-11T22:30:00+02:00
summary: "Setting up version control."
---

---

It's been a week since the last post of this series now, so I can definitely say that the pace of this series is slowing down after the end-of-holiday rush.

I've been thinking, for this project, that I want to make things fit into little steps, little sessions. If all I have is a little less than an hour, then I want to be able to fit writing a post and making some progress into that little hour. I have a few minutes to spare this evening, so let's see if we can put something out this week and give this thing a little heartbeat.

---

I think it's time we set up version control for this. I want to have the file backed up somewhere else, I want to have a version history I can look back through, and I want to be able to link to specific snapshots of the code in these posts. No time better than now to get that set up.

Currently I host all my code on GitHub. I've thought about moving to a different host for anti-GitHub-Microsoft-monopoly reasons, but...

I was going to say I don't have time to set it up elsewhere right now, but do I know that's true? Let's set this project up on another Git hosting service I've been vaguely aware of: [Codeberg](https://codeberg.org/). It's a "democratic, community-driven non-profit." Sounds neat!

## Step 1: Create account

- Took me a couple of minutes, mostly waiting for the "confirm your account" email to show up.

## Step 2: Go to settings and set up the SSH keys I expect I'll need

- Oh hey I can set my pronouns for my profile here! Neat.
- I already have an SSH public/private key pair set up locally, so probably I can just add my public key to Codeberg...?
- Yup! Looks like it worked.

## Step 3: Create a repository for our project

- Gah, I already have a project named "slay-the-spire-solver" from my 2022 go at this. And naming it generically would be _boring_.
- I think... I can make a swing for it an pick a name for the project now. What about...
- **Crystal Spire?**
- It's _just_ unique enough (searching for it online gives me results for a World of Warcraft quest/item, I'm fine colliding with that), and crystal is a sort of material you can see through, but can also split light many, many ways? Sort of like we want to look through battles throughout the Spire?
- That's it, I'm committing to it. [cvennevik/crystal-spire](https://codeberg.org/cvennevik/crystal-spire) created. Description: "A tool for analyzing combat encounters in Slay the Spire."

## Step 4: Initialize the repository with our code

- Okay so I want to do something here that will make this step harder. I want to create commits, retroactively, for the state of the code after each of the blog posts that I've written so far. I think it would be fun to follow the evolution of the project step by step like that.
- I'll create a fresh "crystal-spire" directory on my computer and initialize the Git repository there.
- Then, following my old blog posts, copying and pasting, let's see what we get...
    - First post. Create an initial index.html. [Commit: _"#1: HTML first"_](https://codeberg.org/cvennevik/crystal-spire/commit/13ea21e15f66564b20ea0972187ce772c4437653).
    - Second post. [Commit: _"#2: Actions and consequences"_](https://codeberg.org/cvennevik/crystal-spire/commit/2fb0c59bcc6ab0799d350b69c9859b1059b7d95d).
    - Third post. [Commit: _"#3: Introducing links"_](https://codeberg.org/cvennevik/crystal-spire/commit/12d6098e07ecd5de448b3d76e96805c9496145bb).
    - Fourth post has no code changes.
    - Fifth post. Phew, here I can just copy and paste my latest version. [Commit: _"#5: Going dynamic"_](https://codeberg.org/cvennevik/crystal-spire/commit/f6b46cd46502af1e872869ac2c8f6de71cfaa657).

And... that's it. The project is now version controlled. This is very comforting to me, as I like to use Git to keep track of current changes, and I commit frequently. When something's broken or half-done, it's stressful to me to have a lot of code in the air. I like being able to scrap everything I've done and return to a last known healthy point. Especially for a project like this that I want to make friendly to my short attention spans.

I'm going to go back and put links to these in all the previous posts. Ideally, I'd also want a link to the live version of the code at each version, so you can check it out and play around, but that looks non-trivial. Another time, maybe.

Now. One extra commit. To make the naming consistent.

```html
<title>Crystal Spire</title>
```

```html
<h1>Crystal Spire</h1>
```

Commit: "Rename to Crystal Spire".

That's nice.

---

_[Last commit: "Rename to Crystal Spire"](https://codeberg.org/cvennevik/crystal-spire/src/commit/2110563631b80369ec3d862d730d0b902e77a8b3/index.html)_
