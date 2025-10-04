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

    // All equal cases we care about have already passed
    return false;
}

for (let testCase of testCases) {
    testCase.actualOutput = getActions(testCase.input);
    testCase.passed = deepEqual(testCase.actualOutput, testCase.expectedOutput);
}

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
        <p>❌ ${failedTestCases.length} ${failedTestCases.length === 1 ? 'test' : 'tests'} failed</p>
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
                    <td><pre><code>${JSON.stringify(testCase.input, null, 2)}</code></pre></td>
                    <td><pre><code>${JSON.stringify(testCase.actualOutput, null, 2)}</code></pre></td>
                    <td><pre><code>${JSON.stringify(testCase.expectedOutput, null, 2)}</code></pre></td>
                </tr>
            `).join('')}
        </table>
        `
        : ''
    }
    <a href="./index.html">Main page</a>
`;
