---
title: "'Technical debt' is an incomplete model"
date: 2023-02-05T11:51:00+01:00
---

We throw around the "technical debt" metaphor a lot in software development. On project after project, we experience the system becoming harder to change as we work on it. Rushed design decisions come back to bite us in the butt. Progress slows to a crawl. We say we have accrued a lot of "technical debt."

---

The "technical debt" metaphor is used to explain that we accrue _design flaws_ as we work. These design flaws make it harder to change the system - the more flaws we have, the more we "pay interest" in increased time and effort to make new changes. To make the system easier to change again, we need to "pay down the debt" by fixing the design flaws. If we do not keep our "technical debt" in check, we risk accumulating so many design flaws that it is no longer economic to develop the system any further - we hit "technical bankruptcy."

While this is a useful model, I've come to find it insufficient. It frames "cost of change" as something developers harm by introducing design flaws, and repair by removing design flaws. It is centered on the negative case.

The lessons I have learned about managing cost of change from the Extreme Programming community clashes with this framing, because the "technical debt" metaphor does not support the possibility that the cost of change can go _down_ as you add changes to your system.

Eric Evans touches on this phenomenon through the lens of "supple design":

> To have a project accelerate as development proceeds - rather than get weighed down by its own legacy - demands a design that is a pleasure to work with, inviting to change. A supple design.
>
> — Eric Evans, _Domain-Driven Design_, Chapter Ten: "Supple Design"

Eric compares the system design to a leather jacket that is initially stiff, but over months of use becomes comfortable and flexible in the joints. Similarly, when you keep making changes to the design as you work with the system, the parts you repeatedly need to change will become flexible and easy to change, while the rest of the design stays simple and firm.

Another way this phenomenon emerges is through the "evolutionary design" strategy. By building your design in small increments, keeping it as simple as you can, and reflecting and improving on the design with each and every change, you can manage to reduce the cost of change as you expand your system.

When James Shore describes this design strategy in _The Art of Agile Development_, he gives the example of a JavaScript project he did for one of his screencasts. As he added more and more features related to networking, each feature took less and less time to implement - from 12 hours, to 6 hours, to 3 hours, to under an hour - despite the later features being no less intricate than the earlier ones!

By improving the design with each and every change, the design does not merely stay out of our way. The design _actively supports and enables new changes_. By keeping the design clean while extending it with more functionality, we can make the system do more and more things with less effort. The codebase becomes a precious asset that accelerates our development, speeding us up instead of slowing us down.

These ways of reducing the cost of change are ill described as "paying down technical debt." Instead, it is more accurate to say we are **_building technical wealth_**.
