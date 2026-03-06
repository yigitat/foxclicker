const translations = {
    tr: {
        perSecond: "Saniyede:",
        clickPower: "Tıklama Gücü:",
        shopTitle: "Yetenek Market <span class=\"shop-icon\">🛒</span>",
        resetBtn: "İlerlemeyi Sıfırla",
        confirmReset: "Tüm ilerlemeniz silinecek. Emin misiniz?",
        loginTitle: "FoxClicker",
        loginDesc: "Maceraya katılmak için bir isim gir. / Enter a name to join the adventure.",
        loginBtn: "Oyuna Başla / Start Playing",
        logoutBtn: "Çıkış / Logout",
        inputPlaceholder: "Kullanıcı Adı / Username",
        upgrades: {
            upg1: { name: "Keskin Pençeler", desc: "Tıklama gücünü 1 artırır" },
            upg2: { name: "Sihirli Böğürtlen", desc: "Tıklama gücünü 5 artırır" },
            upg3: { name: "Altın Kuyruk", desc: "Tıklama gücünü 25 artırır" },
            upg4: { name: "Yavru Tilki", desc: "Saniyede 1 tık yapar (10sn limit yok, saniyede işler)" },
            upg5: { name: "Tilki Arkadaş", desc: "Saniyede 5 tık yapar" },
            upg6: { name: "Tilki Sürüsü", desc: "Saniyede 25 tık yapar" },
            upg7: { name: "Orman Ruhu", desc: "Saniyede 150 tık yapar" }
        }
    },
    en: {
        perSecond: "Per Second:",
        clickPower: "Click Power:",
        shopTitle: "Upgrade Shop <span class=\"shop-icon\">🛒</span>",
        resetBtn: "Reset Progress",
        confirmReset: "All your progress will be deleted. Are you sure?",
        loginTitle: "FoxClicker",
        loginDesc: "Enter a name to join the adventure. / Maceraya katılmak için bir isim gir.",
        loginBtn: "Start Playing / Oyuna Başla",
        logoutBtn: "Logout / Çıkış",
        inputPlaceholder: "Username / Kullanıcı Adı",
        upgrades: {
            upg1: { name: "Sharp Claws", desc: "Increases click power by 1" },
            upg2: { name: "Magic Berry", desc: "Increases click power by 5" },
            upg3: { name: "Golden Tail", desc: "Increases click power by 25" },
            upg4: { name: "Baby Fox", desc: "Clicks 1 time per second" },
            upg5: { name: "Fox Friend", desc: "Clicks 5 times per second" },
            upg6: { name: "Fox Pack", desc: "Clicks 25 times per second" },
            upg7: { name: "Forest Spirit", desc: "Clicks 150 times per second" }
        }
    }
};

// Game State Blueprint
const getInitialState = () => ({
    score: 0,
    clickPower: 1,
    autoClicksPerSecond: 0,
    language: 'tr',
    upgrades: [
        // Click Upgrades
        { id: 'upg1', cost: 15, costMultiplier: 1.5, type: 'click', value: 1, count: 0, icon: '🐾' },
        { id: 'upg2', cost: 250, costMultiplier: 1.6, type: 'click', value: 5, count: 0, icon: '🍓' },
        { id: 'upg3', cost: 2500, costMultiplier: 1.7, type: 'click', value: 25, count: 0, icon: '✨' },

        // Auto Upgrades
        { id: 'upg4', cost: 50, costMultiplier: 1.5, type: 'auto', value: 1, count: 0, icon: '🦊' },
        { id: 'upg5', cost: 500, costMultiplier: 1.5, type: 'auto', value: 5, count: 0, icon: '🤝' },
        { id: 'upg6', cost: 4000, costMultiplier: 1.6, type: 'auto', value: 25, count: 0, icon: '🌲' },
        { id: 'upg7', cost: 20000, costMultiplier: 1.7, type: 'auto', value: 150, count: 0, icon: '👻' },
    ]
});

let gameState = getInitialState();
let currentUser = null;

// DOM Elements
const scoreEl = document.getElementById('score');
const autoRateEl = document.getElementById('auto-click-rate');
const clickPowerEl = document.getElementById('click-power-rate');
const foxBtn = document.getElementById('fox-button');
const foxContainer = document.querySelector('.fox-container');
const upgradesContainer = document.getElementById('upgrades-container');
const resetBtn = document.getElementById('reset-btn');
const langBtn = document.getElementById('lang-btn');
const labelPerSecond = document.getElementById('label-per-second');
const labelClickPower = document.getElementById('label-click-power');
const shopTitleText = document.getElementById('shop-title-text');

// Login Elements
const loginModal = document.getElementById('login-modal');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const profileWidget = document.getElementById('profile-widget');
const playerName = document.getElementById('player-name');
const logoutBtn = document.getElementById('logout-btn');
const loginTitle = document.getElementById('login-title');
const loginDesc = document.getElementById('login-desc');

function applyLanguage() {
    const t = translations[gameState.language];
    labelPerSecond.textContent = t.perSecond;
    labelClickPower.textContent = t.clickPower;
    shopTitleText.innerHTML = t.shopTitle;
    resetBtn.textContent = t.resetBtn;

    // Auth UI
    if (loginTitle) loginTitle.textContent = t.loginTitle;
    if (loginDesc) loginDesc.textContent = t.loginDesc;
    if (loginBtn) loginBtn.textContent = t.loginBtn;
    if (logoutBtn) logoutBtn.textContent = t.logoutBtn;
    if (usernameInput) usernameInput.placeholder = t.inputPlaceholder;

    if (gameState.language === 'tr') {
        langBtn.innerHTML = '🇬🇧 EN';
    } else {
        langBtn.innerHTML = '🇹🇷 TR';
    }

    document.title = gameState.language === 'tr' ? 'FoxClicker - Tilki Para Avı' : 'FoxClicker - Fox Coin Hunt';
}

langBtn.addEventListener('click', () => {
    gameState.language = gameState.language === 'tr' ? 'en' : 'tr';
    applyLanguage();
    renderUpgrades();
    if (currentUser) saveGame();
    else localStorage.setItem('foxClickerLang', gameState.language); // Save language preference even if not logged in
});

// Authentication System
function initAuth() {
    // Load unauthenticated language pref
    const prefLang = localStorage.getItem('foxClickerLang');
    if (prefLang) {
        gameState.language = prefLang;
        applyLanguage();
    }

    const lastUser = localStorage.getItem('foxClickerLastUser');
    if (lastUser) {
        login(lastUser);
    } else {
        loginModal.classList.remove('hidden');
    }
}

function login(username) {
    username = username.trim().substring(0, 15);
    if (!username) return;

    currentUser = username;
    playerName.textContent = currentUser;

    loginModal.classList.add('hidden');
    profileWidget.classList.remove('hidden');
    localStorage.setItem('foxClickerLastUser', currentUser);

    loadGame();
}

function logout() {
    saveGame();
    localStorage.removeItem('foxClickerLastUser');
    currentUser = null;
    gameState = getInitialState();

    profileWidget.classList.add('hidden');
    loginModal.classList.remove('hidden');
    usernameInput.value = '';

    updateDisplay();
    renderUpgrades();
}

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        login(usernameInput.value);
    });
}

if (usernameInput) {
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            login(usernameInput.value);
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// Load Data
function loadGame() {
    if (!currentUser) return;
    const saved = localStorage.getItem(`foxClickerSave_${currentUser}`);

    if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.language) parsed.language = 'tr';
        gameState = { ...getInitialState(), ...parsed };
    }
    applyLanguage();
    updateDisplay();
    renderUpgrades();
}

// Save Data
function saveGame() {
    if (!currentUser) return;
    localStorage.setItem(`foxClickerSave_${currentUser}`, JSON.stringify(gameState));
}

// Format Numbers
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

// Update UI
function updateDisplay() {
    scoreEl.textContent = formatNumber(gameState.score);
    autoRateEl.textContent = formatNumber(gameState.autoClicksPerSecond);
    clickPowerEl.textContent = formatNumber(gameState.clickPower);
    checkUpgradesAffordability();
}

// Click Event with Touch Support
function handleInteraction(e) {
    if (e.cancelable && e.type === 'touchstart') e.preventDefault();
    if (!currentUser) return;

    gameState.score += gameState.clickPower;

    // Animate score briefly
    scoreEl.style.transform = 'scale(1.1)';
    setTimeout(() => {
        scoreEl.style.transform = 'scale(1)';
    }, 100);

    createFloatingText(e);
    updateDisplay();
}

foxBtn.addEventListener('mousedown', handleInteraction);
foxBtn.addEventListener('touchstart', handleInteraction, { passive: false });

// Floating text effect
function createFloatingText(e) {
    const text = document.createElement('div');
    text.classList.add('click-effect');
    text.textContent = '+' + formatNumber(gameState.clickPower);

    // Position fixed to viewport
    let x, y;

    if (e.type === 'touchstart' && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else if (e.clientX && e.clientY) {
        x = e.clientX;
        y = e.clientY;
    } else {
        const rect = foxBtn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
    }

    // Add random offset
    x += (Math.random() - 0.5) * 40;
    y += (Math.random() - 0.5) * 40;

    text.style.left = `${x}px`;
    text.style.top = `${y}px`;

    document.body.appendChild(text);

    setTimeout(() => {
        text.remove();
    }, 1000);
}

// Render Market
function renderUpgrades() {
    upgradesContainer.innerHTML = '';
    const t = translations[gameState.language].upgrades;

    gameState.upgrades.forEach((upg, index) => {
        const card = document.createElement('div');
        card.id = `upg-card-${index}`;
        card.classList.add('upgrade-card');

        const upgText = t[upg.id];

        card.innerHTML = `
            <div class="upg-icon">${upg.icon}</div>
            <div class="upg-details">
                <div class="upg-header">
                    <span class="upg-name">${upgText.name}</span>
                    <span class="upg-count">${upg.count}</span>
                </div>
                <div class="upg-desc">${upgText.desc}</div>
                <div class="upg-price">💎 ${formatNumber(upg.cost)}</div>
            </div>
        `;

        card.addEventListener('click', () => buyUpgrade(index));
        upgradesContainer.appendChild(card);
    });

    checkUpgradesAffordability();
}

// Check Affordability
function checkUpgradesAffordability() {
    gameState.upgrades.forEach((upg, index) => {
        const card = document.getElementById(`upg-card-${index}`);
        if (!card) return;

        if (gameState.score >= upg.cost) {
            card.classList.remove('disabled');
            card.classList.add('affordable');
        } else {
            card.classList.add('disabled');
            card.classList.remove('affordable');
        }
    });
}

// Buy Upgrade
function buyUpgrade(index) {
    if (!currentUser) return;
    const upg = gameState.upgrades[index];

    if (gameState.score >= upg.cost) {
        gameState.score -= upg.cost;
        upg.count++;

        // Increase cost
        upg.cost = Math.floor(upg.cost * upg.costMultiplier);

        // Apply effects
        if (upg.type === 'click') {
            gameState.clickPower += upg.value;
        } else if (upg.type === 'auto') {
            gameState.autoClicksPerSecond += upg.value;
        }

        renderUpgrades();
        updateDisplay();
        saveGame();
    }
}

// Game Loop (Auto clicking and Saving)
setInterval(() => {
    if (currentUser && gameState.autoClicksPerSecond > 0) {
        // Divide by 10 to add score 10 times a second for smoother visually
        gameState.score += gameState.autoClicksPerSecond / 10;
        updateDisplay();
    }
}, 100);

// Auto save every 10 seconds
setInterval(() => {
    if (currentUser) saveGame();
}, 10000);

// Reset functionality
resetBtn.addEventListener('click', () => {
    if (!currentUser) return;
    const t = translations[gameState.language];
    if (confirm(t.confirmReset)) {
        localStorage.removeItem(`foxClickerSave_${currentUser}`);
        logout();
        location.reload();
    }
});

// Init
window.addEventListener('blur', () => { if (currentUser) saveGame(); }); // Save prefix when changing tab
window.addEventListener('beforeunload', () => { if (currentUser) saveGame(); }); // Save prefix when closing

// Initialize App
initAuth();
applyLanguage();
