// Syndicate HQ Dashboard
// Updates agent statuses and metrics

const CONFIG = {
    statusFile: 'status.json',
    refreshInterval: 30000, // 30 seconds
};

// Agent data (will be loaded from status.json in production)
let agentData = {
    jarvis: {
        status: 'online',
        task: 'Coordinating Syndicate operations',
        metric: '∞'
    },
    spectre: {
        status: 'idle',
        task: 'Awaiting assignment',
        metric: '0'
    },
    quill: {
        status: 'idle',
        task: 'Awaiting assignment',
        metric: '0'
    },
    forge: {
        status: 'idle',
        task: 'Awaiting assignment',
        metric: '0'
    },
    echo: {
        status: 'idle',
        task: 'Awaiting assignment',
        metric: '0'
    }
};

let globalStats = {
    tasksToday: 0,
    shortsProduced: 0,
    uptime: '99.9%'
};

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    document.getElementById('lastUpdate').textContent = formatted;
}

// Update agent card
function updateAgentCard(agentId, data) {
    const card = document.querySelector(`.agent-card.${agentId}`);
    if (!card) return;

    // Update status
    const statusEl = card.querySelector('.agent-status');
    statusEl.className = `agent-status ${data.status}`;
    statusEl.querySelector('span:last-child').textContent = data.status.toUpperCase();

    // Update task
    card.querySelector('.task-text').textContent = data.task;

    // Update metric
    card.querySelector('.metric-value').textContent = data.metric;
}

// Update all agents
function updateAllAgents() {
    Object.keys(agentData).forEach(agentId => {
        updateAgentCard(agentId, agentData[agentId]);
    });
}

// Update global stats
function updateStats() {
    document.getElementById('tasksToday').textContent = globalStats.tasksToday;
    document.getElementById('shortsProduced').textContent = globalStats.shortsProduced;
    document.getElementById('systemUptime').textContent = globalStats.uptime;
}

// Fetch status from JSON file
async function fetchStatus() {
    try {
        const response = await fetch(CONFIG.statusFile + '?t=' + Date.now());
        if (response.ok) {
            const data = await response.json();
            
            // Update agent data
            if (data.agents) {
                Object.assign(agentData, data.agents);
            }
            
            // Update global stats
            if (data.stats) {
                Object.assign(globalStats, data.stats);
            }
            
            updateAllAgents();
            updateStats();
        }
    } catch (error) {
        console.log('Status file not found, using defaults');
    }
    
    updateTimestamp();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchStatus();
    updateTimestamp();
    
    // Refresh periodically
    setInterval(fetchStatus, CONFIG.refreshInterval);
    setInterval(updateTimestamp, 1000);
});

// Add some visual flair - random subtle glitch effect
function glitchEffect() {
    const cards = document.querySelectorAll('.agent-card');
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    
    randomCard.style.transform = 'translateX(2px)';
    setTimeout(() => {
        randomCard.style.transform = '';
    }, 50);
}

// Occasional glitch (every 30-60 seconds)
setInterval(() => {
    if (Math.random() > 0.7) {
        glitchEffect();
    }
}, 30000);
