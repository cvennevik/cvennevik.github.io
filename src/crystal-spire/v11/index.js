function deserialize(queryString) {
    let queryParams = new URLSearchParams(queryString);
    return {
        hp: Number(queryParams.get('hp')),
        maxHp: Number(queryParams.get('maxhp')),
        block: Number(queryParams.get('block')),
        energy: Number(queryParams.get('energy')),
        maxEnergy: Number(queryParams.get('maxenergy')),
        hand: queryParams.get('hand')?.split(','),
        drawPile: queryParams.get('draw')?.split(','),
        discardPile: queryParams.get('discard')?.split(','),
        relics: queryParams.get('relics')?.split(','),
        enemies: JSON.parse(queryParams.get('enemies'))
    }
}

function serialize(gameState) {
    return `?hp=${gameState.hp}`
        + `&maxhp=${gameState.maxHp}`
        + `&block=${gameState.block}`
        + `&energy=${gameState.energy}`
        + `&maxenergy=${gameState.maxEnergy}`
        + `&hand=${gameState.hand.join(',')}`
        + `&draw=${gameState.drawPile.join(',')}`
        + `&discard=${gameState.discardPile.join(',')}`
        + `&relics=${gameState.relics.join(',')}`
        + `&enemies=${JSON.stringify(gameState.enemies)}`;
}

// TODO: Test
function getActions(gameState) {
    let actions = [];
    if (gameState.hand.includes('Strike') && gameState.energy >= 1) {
        actions.push({ name: 'Play Strike', enemyIndex: 0 });
    }
    if (gameState.hand.includes('Bash') && gameState.energy >= 2) {
        actions.push({ name: 'Play Bash', enemyIndex: 0 });
    }
    if (gameState.hand.includes('Defend') && gameState.energy >= 1) {
        actions.push({ name: 'Play Defend' });
    }
    actions.push({ name: 'End Turn' });
    return actions;
}

let defaultGameState = {
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
};

let gameState = window.location.search ? deserialize(window.location.search) : defaultGameState;
let relicDescriptions = { 'Burning Blood': 'At the end of combat, heal 6 HP' };
let moveDescriptions = {
    'Chomp': 'Deal 11 damage',
    'Thrash': 'Deal 7 damage, gain 5 Block',
    'Bellow': 'Gain 3 Strength and 6 Block'
};

function render() {
    document.body.innerHTML = `
        <h1>Crystal Spire</h1>
        <h2>Player: Ironclad</h2>
        <p>HP: ${gameState.hp}/${gameState.maxHp}</p>
        ${gameState.block ? `<p>Block: ${gameState.block}</p>` : ''}
        <p>Energy: ${gameState.energy}/${gameState.maxEnergy}</p>
        <details open>
            <summary>Hand (${gameState.hand.length})</summary>
            <ul>
                ${gameState.hand.map(card =>
        `<li>${card}</li>`
    ).join('')}
            </ul>
        </details>
        <details>
            <summary>Draw pile (${gameState.drawPile.length})</summary>
            <ul>
                ${gameState.drawPile.map(card =>
        `<li>${card}</li>`
    ).join('')}
            </ul>
        </details>
        <details>
            <summary>Discard pile (${gameState.discardPile.length})</summary>
            <ul>
                ${gameState.discardPile.map(card =>
        `<li>${card}</li>`
    ).join('')}
            </ul>
        </details>
        <details>
            <summary>Relics (${gameState.relics.length})</summary>
            <ul>
                ${gameState.relics.map(relic =>
        `<li>${relic} <i>(${relicDescriptions[relic]})</i></li>`
    ).join('')}
            </ul>
        </details>
        <h2>Enemies</h2>
        ${gameState.enemies.map(enemy => `
            <h3>${enemy.name}</h3>
            <p>HP: ${enemy.hp}/${enemy.maxHp}</p>
            ${enemy.block ? `<p>Block: ${enemy.block}</p>` : ''}
            <p>Next move: ${enemy.nextMove} (${moveDescriptions[enemy.nextMove]})</p>
            ${enemy.moveHistory.length > 0 ? `<p>Past moves: ${enemy.moveHistory.join(', ')}</p>` : ''}
            ${enemy.buffs.length > 0 ?
            `<details open>
                <summary>Buffs (${enemy.buffs.length})</summary>
                <ul>
                    ${enemy.buffs.map(buff => `<li>${buff.name} (${buff.stacks})</li>`).join('')}
                </ul>
            </details>`
            : ''}
            ${enemy.debuffs.length > 0 ?
            `<details open>
                <summary>Debuffs (${enemy.debuffs.length})</summary>
                <ul>
                    ${enemy.debuffs.map(debuff => `<li>${debuff.name} (${debuff.stacks})</li>`).join('')}
                </ul>
            </details>`
            : ''}
        `).join('')}
        <h2>Actions</h2>
        <h3>
            <a href="${encodeURI(serialize({ ...defaultGameState, energy: 1, hand: ['Defend', 'Defend', 'Defend', 'Strike'], discardPile: ['Bash'], enemies: [{ ...defaultGameState.enemies[0], hp: 34, debuffs: [{ name: 'Vulnerable', stacks: 2 }] }] }))}">
                Play Bash on Jaw Worm
            </a>
        </h3>
        <ul>
            <li>Player: -2 Energy</li>
            <li>Hand: -1 Bash</li>
            <li>Discard pile: +1 Bash</li>
            <li>Jaw Worm: -8 HP, +2 Vulnerable</li>
        </ul>
        <h3>
            <a href="${encodeURI(serialize({ ...defaultGameState, energy: 2, hand: ['Bash', 'Defend', 'Defend', 'Defend'], discardPile: ['Strike'], enemies: [{ ...defaultGameState.enemies[0], hp: 36 }] }))}">
                Play Strike on Jaw Worm
            </a>
        </h3>
        <ul>
            <li>Player: -1 Energy</li>
            <li>Hand: -1 Strike</li>
            <li>Discard pile: +1 Strike</li>
            <li>Jaw Worm: -6 HP</li>
        </ul>
        <h3>
            <a href="${encodeURI(serialize({ ...defaultGameState, block: 5, energy: 2, hand: ['Bash', 'Defend', 'Defend', 'Strike'], discardPile: ['Defend'] }))}">
                Play Defend
            </a>
        </h3>
        <ul>
            <li>Player: -1 Energy, +5 Block</li>
            <li>Hand: -1 Defend</li>
            <li>Discard pile: +1 Defend</li>
        </ul>
        <h3>End turn</h3>
        <ul>
            <li>Player: -11 HP</li>
            <li>Hand: -1 Bash, -2 Defend, +3 Strike</li>
            <li>Draw pile: -4 Strike, -1 Defend</li>
            <li>Discard pile: +1 Bash, +3 Defend, +1 Strike</li>
        </ul>
        <h4>
            <a href="${encodeURI(serialize({
                ...defaultGameState,
                hp: 69,
                hand: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'],
                discardPile: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'],
                enemies: [{ ...defaultGameState.enemies[0], moveHistory: ['Chomp'], nextMove: 'Bellow' }]
            }))}">
                End turn 1 (60% chance)
            </a>
        </h4>
        <ul>
            <li>Jaw Worm: next move Bellow (gain 3 Strength and 6 Block)</li>
        </ul>
        <h4>
            <a href="${encodeURI(serialize({
                ...defaultGameState,
                hp: 69,
                hand: ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'],
                discardPile: ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'],
                enemies: [{ ...defaultGameState.enemies[0], moveHistory: ['Chomp'], nextMove: 'Thrash' }]
            }))}">
                End turn 2 (40% chance)
            </a>
        </h4>
        <ul>
            <li>Jaw Worm: next move Thrash (deal 7 damage, gain 5 Block)</li>
        </ul>
        <h2>Test links</h2>
        <a href="./tests.html">Tests page</a>
        <a href="${encodeURI(serialize({ ...defaultGameState, enemies: [{ ...defaultGameState.enemies[0], block: 6, buffs: [{ name: 'Strength', stacks: 3 }] }] }))}">
            Jaw Worm with 3 Strength and 6 Block
        </a>
    `;
}