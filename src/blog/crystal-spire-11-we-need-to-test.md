---
title: "Crystal Spire #11: We need to test"
date: 2025-10-04T18:05:00+02:00
---

Happy Saturday. Let's implement a testing framework in roughly an hour.

---

Part of the challenge I'm giving myself in this series is implementing everything in hand-written, buildless HTML + CSS + JS. I want to flex my web coding muscles and try some things I don't otherwise get to try.

I've used a few test frameworks over the years, but I've never tried making one myself. Nearly all of them involve using the command line as the test runner. We can't do that here, as I don't want to make this project dependent on something like Node. What we can do instead is use the browser as our test runner, a la [standalone Jasmine](https://jasmine.github.io/pages/getting_started.html).

To aid our thinking, let's code a little bit, and make a new HTML page to run our tests in. We make a new file titled `test.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Crystal Spire - Tests</title>
</head>
<body>
    <noscript>
        This application only works with JavaScript enabled.
    </noscript>
</body>
</html>
```

Now let's sketch out what we want we want to see. We want to test that our `getActions` function works as expected. I think the simplest thing to implement would be an example-based approach, where we specify an input, pass it to the function, and compare the result to an expected output.

If the tests succeed, we can show something simple like...

```html
<h1>Crystal Spire - Tests</h1>
<h2>getActions</h2>
<p>✅ 3 tests passed</p>
```

And if any tests fail, we want to show how they failed:

```html
<h1>Crystal Spire - Tests</h1>
<h2>getActions</h2>
<p>✅ 1 test passed</p>
<p>❌ 2 tests failed</p>
<table>
    <tr>
        <th>Input</th>
        <th>Actual output</th>
        <th>Expected output</th>
    </tr>
    <tr>
        <td><code>{ full gameState object }</code></td>
        <td><code>[{ name: 'Play Defend' }]</code></td>
        <td><code>[{ name: 'Play Defend' }, { name: 'End Turn' }]</code></td>
    </tr>
    <tr>
        <td><code>{ full gameState object }</code></td>
        <td><code>[{ name: 'End Turn' }]</code></td>
        <td><code>[{ name: 'End Turn' }, { name: 'Play Strike', enemyIndex: 0 }]</code></td>
    </tr>
</table>
```

I wasn't quite sure how to display the test results at first, but I think a table makes a lot of sense. The default display style doesn't give me any borders between cells in Firefox, though, so let's write our first bit of CSS up in the head, for readability:

```html
<style>
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
    }
</style>
```

Yeah that looks alright. But, I have a sneaking suspicion the `{ full gameState object }` will look really long when it's a real object, so let's try pasting in the default gameState for something more realistic:

```html
<td><code>{ hp: 80, maxHp: 80, block: 0, energy: 3, maxEnergy: 3, hand: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'], drawPile: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'], discardPile: [], relics: ['Burning Blood'], enemies: [{ name: 'Jaw Worm', hp: 42, maxHp: 42, block: 0, nextMove: 'Chomp', moveHistory: [], buffs: [], debuffs: [] }]}</code></td>
```

Wow that is hard to read on a single line. Maybe preformatted and pretty-printed would be better.

```html
<td><pre><code>{
    hp: 80,
    maxHp: 80,
    block: 0,
    energy: 3,
    maxEnergy: 3,
    hand: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'],
    drawPile: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'],
    discardPile: [],
    relics: ['Burning Blood'],
    enemies: [
        {
            name: 'Jaw Worm',
            hp: 42,
            maxHp: 42,
            block: 0,
            nextMove: 'Chomp',
            moveHistory: [],
            buffs: [],
            debuffs: []
        }
    ]
}</code></pre></td>
```

Okay, that actually looks readable. I could give each test a name too:

```html
<th>Name</th>
```

```html
<td>Can Play Defend and End Turn</td>
```

```html
<td>Can Play Strike and End Turn</td>
```

It's kind of ugly, but it's servicable. Okay. Let's implement this.

First, we make a new JavaScript file for `test.html`, namely `test.js`. Then we create our test cases - actual real ones, this time:

```js
let testCases = [
    {
        name: 'Can Play Defend and End Turn',
        input: {
            hp: 80,
            maxHp: 80,
            block: 0,
            energy: 3,
            maxEnergy: 3,
            hand: ['Defend'],
            drawPile: [],
            discardPile: [],
            relics: [],
            enemies: [
                {
                    name: 'Jaw Worm',
                    hp: 42,
                    maxHp: 42,
                    block: 0,
                    nextMove: 'Chomp',
                    moveHistory: [],
                    buffs: [],
                    debuffs: []
                }
            ]
        },
        expectedOutput: [{ name: 'Play Defend' }, { name: 'End Turn' }]
    },
    {
        name: 'Can Play Strike and End Turn',
        input: {
            hp: 80,
            maxHp: 80,
            block: 0,
            energy: 3,
            maxEnergy: 3,
            hand: ['Strike'],
            drawPile: [],
            discardPile: [],
            relics: [],
            enemies: [
                {
                    name: 'Jaw Worm',
                    hp: 42,
                    maxHp: 42,
                    block: 0,
                    nextMove: 'Chomp',
                    moveHistory: [],
                    buffs: [],
                    debuffs: []
                }
            ]
        },
        expectedOutput: [{ name: 'Play Strike', enemyIndex: 0 }, { name: 'End Turn' }]
    }
];
```

Then, we find the results of each test, by calling the function for each test case - and we might as well use the test case objects to store the results:

```js
for (let testCase of testCases) {
    testCase.actualOutput = getActions(testCase.input);
}
```

And then we need to find out whether the test has passed or failed - whether actualOutput and expectedOutput match. So I guess we need to write a deep equality function that works for arrays, objects, and primitive values? There are definitely already implementations of this online, I've copied them before, but let me just write my best attempt off the top of my head...

```js
function deepEqual(a, b) {
    // Passes equal cases of null, undefined, number, and string
    if (a === b) return true;

    // Passes equal cases of arrays
    if (Array.isArray(a)) {
        if (!Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) {
                return false;
            }
        }
        
        return true;
    }

    // Passes equal cases of objects
    if (typeof a === 'object') {
        if (!typeof b === 'object') return false;

        let aKeys = Object.keys(a);
        let bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;

        for (let key of aKeys) {
            if (!bKeys.includes(key)) return false;
            if (!deepEqual(a[key], b[key])) return false;
        }

        return true;
    }

    // All equal cases we care about have passed - fail the equality
    return false;
}
```

Okay, whew, I hope that works. Let's take it for a spin:

```js
for (let testCase of testCases) {
    testCase.actualOutput = getActions(testCase.input);
    testCase.passed = deepEqual(actualOutput, expectedOutput);
}
```

Then render the page based on this data, just like in `index.js`:

```js
passedTestCases = testCases.filter(x => x.passed);
failedTestCases = testCases.filter(x => !x.passed);
document.body.innerHTML = `
    <h1>Crystal Spire - Tests</h1>
    <h2>getActions</h2>
    ${passedTestCases.length > 0
        ? `<p>✅ ${passedTestCases.length} ${passedTestCases.length === 1 ? 'test' : 'tests'} passed</p>`
        : ''
    }
    ${failedTestCases.length > 0
        ? `
        <p>✅ ${failedTestCases.length} ${failedTestCases.length === 1 ? 'test' : 'tests'} passed</p>
        <table>
            <tr>
                <th>Name</th>
                <th>Input</th>
                <th>Actual output</th>
                <th>Expected output</th>
            </tr>
            ${failedTestCases.map(testCase => `
                <tr>
                    <td>${testCase.name}</td>
                    <td><pre><code>${testCase.input}</code></pre></td>
                    <td><pre><code>${testCase.actualOutput}</code></pre></td>
                    <td><pre><code>${testCase.expectedOutput}</code></pre></td>
                </tr>
            `)}
        `
        : ''
    }
`;
```

And plug the file into `test.html`, then try loading the page...

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Crystal Spire - Tests</title>
    <style>
        table, th, td {
            border: 1px solid grey;
            border-collapse: collapse;
        }
    </style>
</head>
<body>
    <noscript>
        This application only works with JavaScript enabled.
    </noscript>
</body>
<script src="test.js"></script>
</html>
```

Ah, console error, getActions is not defined. I usually fix this with an import, but... what if we just...?

```html
<script src="index.js"></script>
<script src="test.js"></script>
```

Okay no that doesn't work because `index.js` also renders to our body. Right. Let's move the rendering logic of `index.js` into a render function:

```js
function render() {
    document.body.innerHTML = `
        ...omitted...
    `;
}
```

I probably should factor it differently, but let's just get it working for now. So now we can call this function in `index.html` only:

```html
<script>render()</script>
```

Okay, now `index.html` still works. But `test.html` still fails because "actualOutput is not defined". Need to go back to `test.js` and fix this block where I just wrote `deepEqual(actualOutput, expectedOutput)`, which gave a console error:

```js
for (let testCase of testCases) {
    testCase.actualOutput = getActions(testCase.input);
    testCase.passed = deepEqual(testCase.actualOutput, testCase.expectedOutput);
}
```

And now, _now_ - `test.html` renders! Wrongly. It says "2 tests passed", but it displays a table with failed test results, and the input/output table cells say `[object Object]`. And there's a comma before the table.

One error at a time. It says "2 tests passed" because I copy-pasted it for the failed tests line, so let's fix that:

```js
<p>❌ ${failedTestCases.length} ${failedTestCases.length === 1 ? 'test' : 'tests'} failed</p>
```

Then the weird comma before the table... Oh, I also forgot to write `</table>` at the end. Lovely of HTML for forgiving me forgetting that, let's enter it correctly. Oh, and I forgot to put a `.join('')` at the end of the row mapping, interpolating the plain array must somehow have resulted in a comma, fix that:

```js
${failedTestCases.map(testCase => `
    <tr>
        <td>${testCase.name}</td>
        <td><pre><code>${testCase.input}</code></pre></td>
        <td><pre><code>${testCase.actualOutput}</code></pre></td>
        <td><pre><code>${testCase.expectedOutput}</code></pre></td>
    </tr>
`).join('')}
```

Then, let's use JSON.stringify to print the input/output prettier. The "2" argument at the end tells the function to use two spaces for indentation.

```js
<tr>
    <td>${testCase.name}</td>
    <td><pre><code>${JSON.stringify(testCase.input, null, 2)}</code></pre></td>
    <td><pre><code>${JSON.stringify(testCase.actualOutput, null, 2)}</code></pre></td>
    <td><pre><code>${JSON.stringify(testCase.expectedOutput, null, 2)}</code></pre></td>
</tr>
```

Now, finally, we have two successfully failing tests. We're expecting `{ "name": "End Turn" }`, but we actually get `"End Turn"`, becuase I made a mistake last time:

```js
function getActions(gameState) {
    /* ... */
    actions.push('End Turn');
    /* ... */
}
```

Now we can fix it:

```js
function getActions(gameState) {
    /* ... */
    actions.push({ name: 'End Turn' });
    /* ... */
}
```

...and `test.html` tells us "✅ 2 tests passed". That's it. We officially have tests for our project, and have used them to find and fix an error.

Before we forget, commit: _"Add tests in test.html, fix 'End Turn' action in getActions()"_.

---

This felt sloppier than I want it to be. The code wasn't factored well for testing. The functions in `index.js` should be separated from the parts that read from `window.location.search` and write to `document.body.innerHTML`. And I made several plain mistakes that I would have caught if I had slowed down and re-read my code as I wrote it.

I'm also unsure about the example-based testing approach for the long run. The cases will get very verbose, and writing a thorough set of test cases will take a while. I think a property-based testing approach would suit this project better, so that after writing a generator for input game states, we can write properties for things like "End Turn should always be available" and "if you have at least 1 Energy and a Strike in hand, you can Play Strike".

Still, what we have now is certainly better than nothing.

Oh, before we end, let's add some links to make the pages discoverable from each other:

```js
// index.js, end of rendering code
<a href="./test.html">Tests page</a>

// test.js, end of rendering code
<a href="./index.html">Main page</a>
```

Commit: _"Add links between tests page"_.

...And heck it, the files should be named "tests" instead of "test". Fix that, fix the links, fix the script source, last commit: _"Rename 'test' files to 'tests'"_.

Next time: Tidying and making this better, probably.

---

_[View this app version](/crystal-spire/v11/)_ | _[Last commit: Add getActions function](https://codeberg.org/cvennevik/crystal-spire/src/commit/e2c2d225d50efd4bc67d5e4b117ddf47f920bd9b)_
