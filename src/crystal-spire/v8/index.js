let queryParams = new URLSearchParams(window.location.search);
let hp = queryParams.get('hp') ?? 80;
let maxHp = queryParams.get('maxhp') ?? 80;
let armor = queryParams.get('armor');
let energy = queryParams.get('energy') ?? 3;
let maxEnergy = queryParams.get('maxenergy') ?? 3;
let hand = queryParams.get('hand')?.split(',') ?? ['Bash', 'Defend', 'Defend', 'Defend', 'Strike'];
let drawPile = queryParams.get('draw')?.split(',') ?? ['Defend', 'Strike', 'Strike', 'Strike', 'Strike'];
let discardPile = queryParams.get('discard')?.split(',') ?? [];
let relics = queryParams.get('relics')?.split(',') ?? ['Burning Blood'];
let relicDescriptions = { 'Burning Blood': 'At the end of combat, heal 6 HP' };
let enemies = JSON.parse(queryParams.get('enemies')) ?? [
    {
        name: 'Jaw Worm',
        hp: 42,
        maxHp: 42,
        nextMove: 'Chomp'
    }
];
let moveDescriptions = { 'Chomp': 'Deal 11 damage' };
document.body.innerHTML = `
    <h1>Crystal Spire</h1>
    <h2>Player: Ironclad</h2>
    <p>HP: ${hp}/${maxHp}</p>
    ${armor ? `<p>Armor: ${armor}</p>` : ''}
    <p>Energy: ${energy}/${maxEnergy}</p>
    <details open>
        <summary>Hand (${hand.length})</summary>
        <ul>
            ${hand.map(card =>
                `<li>${card}</li>`
            ).join('')}
        </ul>
    </details>
    <details>
        <summary>Draw pile (${drawPile.length})</summary>
        <ul>
            ${drawPile.map(card =>
                `<li>${card}</li>`
            ).join('')}
        </ul>
    </details>
    <details>
        <summary>Discard pile (${discardPile.length})</summary>
        <ul>
            ${discardPile.map(card =>
                `<li>${card}</li>`
            ).join('')}
        </ul>
    </details>
    <details>
        <summary>Relics (${relics.length})</summary>
        <ul>
            ${relics.map(relic =>
                `<li>${relic} <i>(${relicDescriptions[relic]})</i></li>`
            ).join('')}
        </ul>
    </details>
    <h2>Enemies</h2>
    ${enemies.map(enemy => `
        <h3>${enemy.name}</h3>
        <p>HP: ${enemy.hp}/${enemy.maxHp}</p>
        <p>Next move: ${enemy.nextMove} (${moveDescriptions[enemy.nextMove]})</p>
    `).join('')}
    <h2>Actions</h2>
    <h3>
        <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&energy=1&hand=Defend,Defend,Defend,Strike&draw=Defend,Strike,Strike,Strike,Strike&discard=Bash&enemies=%5B%7B%22name%22%3A%20%22Jaw%20Worm%22%2C%20%22hp%22%3A%2034%2C%20%22maxHp%22%3A%2042%2C%20%22nextMove%22%3A%20%22Chomp%22%7D%5D">
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
        <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&energy=2&hand=Bash,Defend,Defend,Defend&draw=Defend,Strike,Strike,Strike,Strike&discard=Strike&enemies=%5B%7B%22name%22%3A%20%22Jaw%20Worm%22%2C%20%22hp%22%3A%2036%2C%20%22maxHp%22%3A%2042%2C%20%22nextMove%22%3A%20%22Chomp%22%7D%5D">
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
        <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=80&armor=5&energy=2&hand=Bash,Defend,Defend,Strike&draw=Defend,Strike,Strike,Strike,Strike&discard=Defend">
            Play Defend
        </a>
    </h3>
    <ul>
        <li>Player: -1 Energy, +5 Armor</li>
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
        <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=69&energy=3&hand=Defend,Strike,Strike,Strike,Strike&draw=&discard=Bash,Defend,Defend,Defend,Strike">
            End turn 1 (60% chance)
        </a>
    </h4>
    <ul>
        <li>Jaw Worm: next move Bellow (gain 3 Strength and 6 Block)</li>
    </ul>
    <h4>
        <a href="?maxhp=80&maxenergy=3&relics=Burning%20Blood&hp=69&energy=3&hand=Defend,Strike,Strike,Strike,Strike&draw=&discard=Bash,Defend,Defend,Defend,Strike">
            End turn 2 (40% chance)
        </a>
    </h4>
    <ul>
        <li>Jaw Worm: next move Thrash (deal 7 damage, gain 5 Block)</li>
    </ul>
`;