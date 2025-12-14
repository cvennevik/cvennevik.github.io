---
title: "Crystal Spire #12: A spot of cleaning"
date: 2025-12-14T14:00:00+02:00
---
Last time, the process of adding tests felt sloppy and clumsy. This time I want to put in some effort to make the process feel "neat" and "elegant" instead.

To begin, let's review the code and see if we can make it easier to work with. Points to note:

1. The inline style block in `tests.html` could be extracted to a separate CSS file. It adds one more file, but leaves `tests.html` to act as glue between the different files, and gives us a natural spot to add more styles in the future.
2. `tests.js` immediately runs code to render the page, making it impossible to reuse the file if we add another page with test code. We should extract a `render()` function like we did in `index.js`.
3. Taking that point more broadly, I think the global state and side effects in `index.js` and `tests.js` are design liabilities. I would rather convert them into libraries of pure functions, and add a little more glue code to `index.html` and `tests.html` to render the page.
4. We should consider converting the code from classic scripts to module scripts. Explicit imports and exports may come in handy.

That looks like enough points to get started with. Point 1: Extract `tests.css`.

```css
/* tests.css */
table, th, td {
    border: 1px solid grey;
    border-collapse: collapse;
}
```

```html
<!-- tests.html -->
<head>
    <meta charset="UTF-8">
    <title>Crystal Spire - Tests</title>
    <link rel="stylesheet" href="./tests.css">
</head>
```

Commit: _"Extract tests.css from tests.html"_. Then onto point 2.

```js
// tests.js
function renderTests() {
    document.body.innerHTML = `
    ...
    `;
}
```

```html
<!-- tests.html -->
<script>renderTests()</script>
```

Can't name it `render()` because that would collide with the same function from `index.js`. Another point towards using module scripts. Commit: _"tests.js: Extract renderTests() function"_.

Point 3 takes a bit of design judgement. We have a test suite, we want to run it, and we want to render the results. I do not know it should be decomposed (should we have a test suite object? a "run tests" function? a results object?), so let's make it all a single function.

```js
// tests.js
function runAndRenderTests() {
    let testCases = [
        // ...
    ];

    for (let testCase of testCases) {
        testCase.actualOutput = getActions(testCase.input);
        testCase.passed = deepEqual(testCase.actualOutput, testCase.expectedOutput);
    }

    passedTestCases = testCases.filter(x => x.passed);
    failedTestCases = testCases.filter(x => !x.passed);

    return `
        ...
    `;
}
```

```html
<!-- tests.html -->
<script>document.body.innerHTML = runAndRenderTests()</script>
```

Commit: _"tests.js: Convert to runAndRenderTests() function"_.

Then onto `index.js`. Currently it deserializes `window.location.search` directly to get the game state. If we instead do that in `index.html` and pass the game state to the render function, that opens for rendering any game state we want.

```html
<!-- index.html -->
<script>
let gameState = window.location.search ? deserialize(window.location.search) : defaultGameState;
document.body.innerHTML = render(gameState);
</script>
```

```js
// index.js
function render(gameState) {
    return `
        ...
    `;
}
```

Not a lot of code to change! Commit: _"Make gameState a parameter to the render function"_.

Finally, point 4 about [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). They have been broadly available since... what, 2018? I'm trying to find any downsides to switching to them, and the only things I can find is being forced into [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode), and a vague memory of some functionality having stricter security limitations when using modules? Both of these things sound like _upsides_ in our case, so everything is pointing us towards modules.

Let's just add a little `type="module"` to our inline script in `index.html`, and...

```html
<script type="module">
import { render, deserialize } from './index.js';
let gameState = window.location.search ? deserialize(window.location.search) : defaultGameState;
document.body.innerHTML = render(gameState);
</script>
```

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at file:///home/cvennevik/dev/crystal-spire/index.js. (Reason: CORS request not http).
```

Well fuck.

So if we use JavaScript modules, the browser enforces the Same Origin Policy on imports. And anything on the file system counts as a remote resource, so it blocks the request. That means our app becomes unusable as plain files on the file system, and requires a web server to function.

Given how we value being able to develop and run our code with minimal dependencies, adding a web server is _way_ too steep a cost to pay for adopting modules. We have to scrap it and stick to classic scripts.

Maybe we should adopt "strict mode", however. It looks like it will help catch mistakes loudly instead of silently. All it takes is adding `'use strict';` to the top of `index.js` and `tests.js`, and... Wait, what's this?

```
Uncaught ReferenceError: assignment to undeclared variable passedTestCases
```

Ah! Two of the variables in tests.js are undeclared. Whoops! Thank you for pointing it out, strict mode, we'll fix it right away. Commit: _"Use strict mode, fix undeclared variables"_.

This post has already stretched over two days, so let's wrap it here. The code looks to be in good shape for further development now.

Next time: property-based testing, maybe?

---

_[View this app version](/crystal-spire/v12/)_ | _[Last commit: Use strict mode, fix undeclared variables](https://codeberg.org/cvennevik/crystal-spire/src/commit/2c7260b737ce03f66eefc577f63307263e0e1350)_
