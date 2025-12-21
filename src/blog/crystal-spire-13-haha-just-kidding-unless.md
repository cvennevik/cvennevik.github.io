---
title: "Crystal Spire #13: Haha, just kidding... unless?"
date: 2025-12-21T21:49:00+02:00
---

I want property-based tests for our project. Just a few hurdles to overcome:

- I have never written a property-based test before.
- The most visible and actively maintained property-based testing library for JavaScript, [fast-check](https://fast-check.dev/), gives zero indication of being able to run standalone in a browser, and I don't want to add Node as a dependency if we can get away with it.
- From what I can tell, implementing a decent property-based testing library is complicated.

There's a ways we can go about this:

1. Implement our own testing library. We'd be able to ensure it satisfies our requirements, and it would be a great learning experience. On the other hand, implementing a good enough library may take so much effort, it would take years before this series returns to actually implementing a Slay the Spire solver. It would be a massive [yak shave](https://projects.csail.mit.edu/gsb/old-archive/gsb-archive/gsb2000-02-11.html).
2. Find a way to run an existing library in the browser. It would let us get on with writing tests, and doing any property-based testing at all is still a great learning experience. On the other hand, the project wouldn't be as "pure" in terms of solving everything ourselves, and we'd be taking on a large amount of JavaScript to run our tests. Also it may not be possible.
3. Give up on running this project with just a browser and start relying on Node.
4. Give up on property-based tests and go back to example-based testing.

Option 1 seems inappropriately ambitious. Option 2 seems potentially doable, although it may not give us the best tool for the job. Option 3 would mean getting access to a local JavaScript runtime and a package manager, which in turn gives us access to some of the best tools for both this job and many other jobs, but...

Okay, let's take a moment to consider. *Why* do I value keeping this project buildless and free of external dependencies?

- I want the code to be accessible to newcomers who do not already have all kinds of toolchains installed.
- I want the code to be easy to copy into different contexts, without assuming a given framework or runtime.
- I want the software to be [cold-blooded](https://dubroy.com/blog/cold-blooded-software/), so I can leave it for months and years and pick it up again just the way I left it.

Not having to install anything extra to run the code is good! Building on a stable platform is good! Yet some things that are worth doing are not practical to do without extra dependencies. Some things require a web server. Some things require a database. Some things require a local JavaScript runtime like Node. Scratch that, _a lof of things_ require a local JavaScript runtime like Node.

I also wonder if now, by the end of 2025, that Node qualifies as [boring technology](https://mcfunley.com/choose-boring-technology). It's 16 years old, ubiquitious, and seemingly fairly stable by now. I also wonder if property-based testing does _not_ count as boring technology, and that we cannot realistically adopt it without paying the tax of an npm dependency.

And, unexpectedly, this self-imposed restriction is making me feel _lonely_. My setup today is a weird fringe thing that modern libraries and browser security mechanisms do not make space for. I have to make awkward workarounds and compromises and give up things that are table stakes for most developers. Doing web application development with no tooling, as it turns out, is not a path I want to invite others to follow. Certainly not for a project with such limited development time as this one.

Okay. Enough crisis of faith. It's time to bite the bullet.

Commit: _"Add package.json"_

Commit: *"Add node_modules to .gitignore"*

And we add our first dependency to `package.json`:

```json
{
  "name": "crystal-spire",
  "version": "1.0.0",
  "devDependencies": {
    "fast-check": "^4.5.2"
  }
}
```

```
> npm i

added 2 packages, and audited 3 packages in 658ms
```

Oh hey, `fast-check` actually only has a single transitive dependency, so our `node_modules` directory has a grand total of _two_ packages in it. That's pretty neat!

Commit: _"Add fast-check to devDependencies"_

That's enough excitement for one post. I still don't feel comfortable with this decision, but I accept the risk of regret.

Next time: property-based testing, for real this time.

---

_[View this app version](/crystal-spire/v12/)_ | _[Last commit: Add fast-check to devDependencies](https://codeberg.org/cvennevik/crystal-spire/src/commit/7183037e5a9185f72cd023a585041bf2a7cc10d6)_
