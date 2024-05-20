---
title: "Code reviews are overloaded"
date: 2023-01-08T09:55:00+11:00
summary: "On the pains of mandated code reviews, and how to reduce them."
---

## Code reviews are effective

**Code reviews are effective for uncovering bugs.** We have multiple large studies backing this claim, estimating that the bug-detection rate of code reviews is in the ballpark of 50%. This is better evidence than we have for most software development practices. From [the Wikipedia article on code review](https://en.wikipedia.org/wiki/Code_review#Efficiency_and_effectiveness_of_reviews):

> Capers Jones' ongoing analysis of over 12,000 software development projects showed that the latent defect discovery rate of formal inspection is in the 60-65% range. For informal inspection, the figure is less than 50%. The latent defect discovery rate for most forms of testing is about 30%. A code review case study published in the book Best Kept Secrets of Peer Code Review found that lightweight reviews can uncover as many bugs as formal reviews, but were faster and more cost-effective in contradiction to the study done by Capers Jones.

In addition to their primary value in discovering bugs, they can also be used to assess and improve many other aspects of the code. Design, readability, maintainability, code quality, test quality and coverage, consistency with project style guidelines and documentation are all areas where reviewers can find issues and suggest improvements. The act of reviewing and giving feedback can even help transfer knowledge between developers and be a tool for mentoring and learning.

On account of these benefits, code reviews have become wildly popular, and most software projects mandate that all changes must be approved by one or more reviewers. This virtually always means a _pull request based workflow_, where developers branch out from mainline, make some changes, then open a pull request that requires approval from a reviewer to merge back into mainline. At time of writing, this is the predominant way of working in our industry.

## Branching causes problems

In projects using pull requests, the most popular strategy for branching is _feature branching_, creating a branch for a single feature and opening a pull request when the feature is complete. This is a convenient and intuitive way of organizing changes. However, these feature branches tend to be long-lived (on the order of days or weeks), and long-lived branches cause some serious issues.

In part four of Thierry de Pauw's article series [On the Evilness of Feature Branching](https://thinkinglabs.io/articles/2021/04/26/on-the-evilness-of-feature-branching.html), he goes into [the problems](https://thinkinglabs.io/articles/2022/05/30/on-the-evilness-of-feature-branching-the-problems.html) of feature branching. The article is worth reading in full, but to summarize some of its points:

- **It delays feedback** on how well changes integrate with other team members' work and how it runs in production.
- **It causes rework** through merge conflicts.
- **It discourages refactoring** as they have a high risk of causing merge conflicts.
- **It introduces batch work and inventory**, trapping valuable work in the system and worsening the throughput, quality, stability and lead time of changes.
- **It increases risks** by batching changes into large sets which are more likely to break, and harder to find the cause of when they do.

Key to these issues is that they are more frequent and more severe the longer the branches live and the larger the changes are. Conversely, shorter-lived branches and smaller changes cause less issues. We can nearly eliminate the branching issues by pushing this all the way to [continuous integration](https://martinfowler.com/articles/branching-patterns.html#continuous-integration), where everyone's work is merged into mainline every day, potentially even multiple times an hour.

Code reviews make this infeasible for most software teams.

## Mandatory code reviews encourage long-lived branches

When merging your work requires another developer to review and approve it, merging _will_ happen less frequently, and pull requests _will not_ shrink beyond a certain size. Dragan Stepanović explains this best in his article [From Async Code Reviews to Co-Creation Patterns](https://www.infoq.com/articles/co-creation-patterns-software-development/).

In short, code reviews introduce long wait times to the integration process. First, after a pull request is opened, the author waits for a review. Then, if the reviewer discovers any issues they think the author should handle, the reviewer waits for the author to respond to the feedback. This cycle repeats some number of times until the reviewer is satisfied and approves the pull request.

These wait times encourage developers to start new work in the meanwhile (increasing work-in-progress), and to batch their changes into larger pull requests. This, again, makes each review take longer, making it harder for developers to find time to review them, and increasing the odds of multiple rounds of review - increasing wait times even more! This vicious cycle results in pull requests often taking multiple days before they are able to be merged.

If a team still tries to make a push for continuous integration in this environment, they are fighting against the stream. The more frequently team members try to integrate, the more often they have to interrupt each other to review and respond to reviews. Developer attention bounces between multiple tasks, flow efficiency (time spent _working_ to time spent _waiting_) plummets, and productivity drops. Every team will hit a point where the pain of this is too high and will stop integrating their changes any more frequently - typically stopping well short of continuous integration.

## Code reviews are hard to replace

Many developers who recognize these problems assert that this kind of code review is a net negative and should be done away with altogether. Dave Farley, co-author of _Continuous Delivery_, insists that [you are better off not branching at all](https://www.davefarley.net/?p=247):

> - Don't Branch!
> - Don't Branch!
> - Don't Branch!

Instead of doing after-the-fact code review, he and others recommend that you support the quality of your software through other practices. The top recommendations are pair programming and mob/ensemble programming, which function as a sort of continuous code review while boosting the flow of work and knowledge sharing within your team. Test-driven development and a "_[No Bugs](https://www.jamesshore.com/v2/books/aoad2/no_bugs)_", root-cause eliminating attitude help reduce bug rates even further. By employing these practices, you may achieve better results than relying on code reviews. And I _want_ to believe this.

However, in teams that frequently catch serious errors in code review, **this is hard to sell**. Most developers do not use these alternative practices, and asking people to change the way they work and spend time practicing new skills is a big ask for most teams. Without these changes, slashing code review will in all likelihood lead to more defects being pushed to mainline and escaping to production. Software teams have very reasonable motives for not wanting to do this.

This leaves me conflicted. I cannot in good conscience say that most teams should drop mandatory code reviews and that this will not cause major issues. Yet, I am thoroughly convinced that continuous integration _is_ a better way of working.

Trapped in the middle, I am here to suggest a compromise: **Code reviews should be reduced to their bare essentials.**

## Code reviews hurt more the more they try to do

Here is my line of reasoning:

1. When you look for more things in a code review, it becomes more demanding and time-consuming.
2. When code reviews get harder, developers will put them off, and wait times will grow.
3. When wait times grow, branches will live longer and pull requests will get larger, feeding the cycle and causing integration pain.

**Conclusion:** _The more things you look for in a code review, the more you will experience integration pain._ Conversely, if you reduce the number of things you look for in a code review, you will be able to integrate your work more frequently. If review gets easy enough, you may even find continuous integration feasible!

With this in mind, it becomes clear that we have made the review process very hard for ourselves. The most common thing to do is to include _every possible thing_ worth having an opinion on in the scope of review. For instance, take [Google's sumary of what a reviewer should look for](https://google.github.io/eng-practices/review/reviewer/looking-for.html#summary):

> In doing a code review, you should make sure that:
>
> - The code is well-designed.
> - The functionality is good for the users of the code.
> - Any UI changes are sensible and look good.
> - Any parallel programming is done safely.
> - The code isn’t more complex than it needs to be.
> - The developer isn’t implementing things they might need in the future but don’t know they need now.
> - Code has appropriate unit tests.
> - Tests are well-designed.
> - The developer used clear names for everything.
> - Comments are clear and useful, and mostly explain why instead of what.
> - Code is appropriately documented (generally in g3doc).
> - The code conforms to our style guides.

**This is a lot!** A lot of things to pay attention to while reviewing, a lot to write feedback on, a lot of comments for the author to respond to. Several concerns like code quality and design (and without an authoritative style guide, code style and formatting) are highly subjective, and have a higher chance of causing disagreements, discussions, and multiple rounds of review - skyrocketing wait times.

Not only does this bucket list of concerns make review harder, but discussions of fuzzier, less critical issues drown out discussion of bugs. Quoting [the Wikipedia article](https://en.wikipedia.org/wiki/Code_review#Efficiency_and_effectiveness_of_reviews) again:

> Empirical studies provided evidence that up to 75% of code review defects affect software evolvability/maintainability rather than functionality [...] This also means that less than 15% of the issues discussed in code reviews are related to bugs.

Despite our primary motivation for mandating code review being bug reduction, we spend the majority of our attention on other, less critical issues. Combining this diluted focus with its influence to make pull requests larger, it is likely that trying to improve more things with code review actually makes matters worse.

## Limit your code reviews to the most important concerns

Since mandatory code reviews cause more issues the more concerns they look for, they should be stripped down to the bare minimum of concerns that must be improved before merge. This will reduce the costs of review while improving its effectiveness for the concerns you do look for. What this bare minimum set is may vary from project to project, and you are free to decide what this is for yourself.

**Personally, I am convinced that you should cut any concern from your list that is not externally visible and can be improved later.** This includes:

- Formatting and code style
- Code quality and internal design details
- Comments and documentation
- Test coverage and quality

All of these things are (more or less) valuable, and we want to do them well. However, **none of them are externally visible**, meaning it does not matter to our users if we merge and deploy them to production. Additionally, **all of them can be improved later**, and frequent low-friction integration makes it _easier_ to make such improvements. Including them in review would harm integration frequency, which makes it harder to improve the quality of our codebase when we discover these issues while working.

If a developer opens pull requests that aren't up to snuff on any of these points, you have a couple of alternatives instead of checking it during review:

1. **Talk to the developer about it.** Make sure you agree to a common set of standards, and that they have the environment and resources to learn how to fulfill them. This is a longer term solution that will save you frustration in the long run.
2. **Fix it yourself.** If you see room for improvement beyond your team's common set of standards, do it yourself instead of asking the author to do it. It is more effective and efficient, and it contributes to your team's sense of collective code ownership - you all have the right and responsibility to make improvements when you see them. And, since this change is to an issue that should be ignored by reviewers, it should be quick and easy to approve and merge back into mainline.

Conversely, changes that are externally visible, or cannot be improved later, are more worth reviewing:

- **Bugs and security issues.** We should ideally never introduce any of these, and we want to minimize the chance of any of them escaping to production.
- **Design decisions that are hard to undo.** This includes both external API designs (which are very hard to change once they are public), user interface designs, and any changes to functionality. The cost of getting these wrong is high, so it is worth spending extra effort getting them right.

By limiting your review scope to these core concerns, you minimize the cost of mandating code reviews, while maintaining quality control on the issues you care the most about.

_(Limiting and focusing the objective of code review like this also makes it easier to see when code reviews become obsolete - when bug rates drop to acceptable levels pre-review, and when you discuss and refine your irreversible design decisions outside of review. It is very easy to imagine high-performing teams working like this.)_

## This is a suggested experiment

While this strategy of cutting the scope of review makes a lot of sense to me, I cannot predict how it will play out for you, in your team, in your circumstances. I do not know to what degree it will make reviews easier and reduce integration pain, and I do not know what unexpected side effects it will have.

What I do believe is that this experiment is low risk, it is not very disruptive, and the potential rewards are great enough that **you should try it out**. Talk it out with your team, find a scope of review to try, trial it for a week or two, then reflect on how it went. If you do not like the results, you can always go back to your old way of working afterwards.

**If you try this, or have already tried it, please message me to share your experience!** Contact me on Mastodon at [@cvennevik@hachyderm.io](https://hachyderm.io/@cvennevik) (so I can share it further, if you like!), or email me at <cvennevik@gmail.com>.

_Edit, April 14th 2023: [I wrote a post describing my experience following this idea.](https://www.cvennevik.no/blog/oops-i-made-code-review-painful/)_
