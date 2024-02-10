---
title: "Using TypeScript to prevent common mistakes"
date: 2023-01-17T11:43:00+11:00
summary: "A partial answer to what I like about static type systems."
---

I have been struggling to write an article about type systems for about a week now. The ideas and angles I want to take kept changing between each writing session, preventing me from ever completing a single coherent article.

After venting about this on Mastodon, another user asked me what I thought about static types. They were mostly experienced with dynamically typed languages, and prefer the flexibility they offer.

It turns out this question was all I needed to focus and get my writing back on track - you may take this blog post as my longform answer.

In short: I think static types are a useful tool to prevent us from making very common mistakes. Like, really common. Like "half of the bugs I investigate in JavaScript applications are caused by this" common.

Here's a few examples to illustrate the types of mistakes I'm talking about, and how adding static types with TypeScript helps prevent them.

## Mistake #1: Accessing undefined property names

Say we are working with an object containing user profile data, and we want to send an email to that user. To do this, we access the user's email address via `user.emailAddress` and pass it to `sendEmail`.

```ts
function sendEmailToUser (user) {
    sendEmail(user.emailAddress);
}
```

But what if we are mistaken? What if the `user` object's property is actually named `emailaddress`, or `address`, or `username`, or - gasp - it does not actually have a property for email address at all? Well, then this code will instead attempt to send an email to `undefined`. That's no good.

To check for this potential issue, let us say we found the `UserProfile` type that describes the user data we expect, and specify that `user` is of type `UserProfile`.

```ts
interface UserProfile {
    // ...
    contactInfo: {
        // ...
        emailAddress: string
    }
}

function sendEmailToUser (user: UserProfile) {
    sendEmail(user.emailAddress); // Causes a build error!
}
```

Oops! It turns out the `user.emailAddress` property does not exist. Now, because we are trying to access a property that does not exist on `UserProfile`, the TypeScript compiler produces an error.

The `UserProfile` type instead tells us that a `user.contactInfo.emailAddress` property exists. This is likely what we actually wanted to use, and replacing `user.emailAddress` with this will make the error go away.

## Mistake #2: Passing invalid data

Say we are working with a map, and want to place an icon at the spot where the user's mouse pointer is:

```ts
function getMousePosition () {
    // ...
}

function setIconPosition (position) {
    // ...
}

function placeIconAtMousePosition () {
    const mousePosition = getMousePosition();
    setIconPosition(mousePosition);
}
```

What can go wrong here? Well, we do not know the structure of the data `getMousePosition` returns, nor what `setIconPosition` accepts. Even if we already know we are working with longitude and latitude positions in the same coordinate system, the position could be represented as a `{ lon, lat }` object, or an `{ x, y }` object, or a `[lon, lat]` array (or even a `[lat, lon]` array!).

Without type annotations, this code looks perfectly valid, even if the data structures may be incompatible. Now, if we add the correct types to the functions using TypeScript, the incompatibility comes to light:

```ts
function getMousePosition (): { lon: number, lat: number } {
    // ...
}

function setIconPosition (position: { x: number, y: number }) {
    // ...
}

function placeIconAtMousePosition () {
    const mousePosition = getMousePosition();
    setIconPosition(mousePosition); // Causes a build error!
}
```

With the function types specified, TypeScript reports that we made a mistake passing `mousePosition` directly into `setIconPosition`. Instead, we should convert the `{ lon, lat }` object to an `{ x, y }` object.

```ts
function placeIconAtMousePosition () {
    const mousePosition = getMousePosition();
    setIconPosition({
        x: mousePosition.lon,
        y: mousePosition.lat
    });
}
```

## Mistake #3: Not handling undefined values

The third common mistake TypeScript can prevent is the famed _"billion dollar mistake"_: ~~null~~ undefined values!

Let's reuse the map position code example and see what happens when we modify it. Say we change the implementation of `getMousePosition` so it returns `undefined` when the mouse is outside the map. TypeScript will not permit this since this does not match the return type of `getMousePosition`, so we change the return type so it can also be `undefined`:

```ts
function getMousePosition (): { lon: number, lat: number } | undefined {
    // ...
}

function setIconPosition (position) {
    // ...
}

function placeIconAtMousePosition () {
    const mousePosition = getMousePosition();
    setIconPosition({
        x: mousePosition.lon, // Causes a build error!
        y: mousePosition.lat
    });
}
```

Oh no! This change actually breaks `placeIconAtMousePosition`, because it was written with the assumption that `getMousePosition` always returns a valid position. When it instead returns `undefined`, the code will throw a runtime error when trying to access `mousePosition.lon`.

If we were working with untyped JavaScript, this mistake may have managed to sneak in. Luckily, TypeScript caught this error for us. It refuses to compile until we have correctly handled the case where `mousePosition` is undefined. If we add a check for it, the error disappears:

```ts
function placeIconAtMousePosition() {
    const mousePosition = getMousePosition();
    if (mousePosition === undefined) return;
    setIconPosition({
        x: mousePosition.lon,
        y: mousePosition.lat
    });
}
```

I like to set up development environments so it is easy to write correct code and hard to write incorrect code. Static types are only one of several tools I use for this, but they are one of my favorites. They tell us what we can and cannot do with our data, and they are effective for catching very common mistakes. Because of this, I find the overhead of opting into static typing with TypeScript well worth it.
