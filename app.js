// Syndicate HQ Dashboard - Real-time Video Stats
const CONFIG = {
    statusFile: 'status.json',
    refreshInterval: 10000, // 10 seconds
};

let statusData = {
    agents: {},
    channels: {},
    pipeline: {},
    stats: {}
};

function updateTimestamp() {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }) + ' EST';
    document.getElementById('lastUpdate').textContent = formatted;
}

function updateStats() {
    const stats = statusData.stats || {};
    document.getElementById('videosLive').textContent = stats.videosLive || '0';
    document.getElementById('videosInProduction').textContent = stats.videosInProduction || '0';
    document.getElementById('tasksCompleted').textContent = stats.tasksCompleted || '0';
}

function updatePipelineStages() {
    const agents = statusData.agents || {};
    
    const stageMap = {
        'research': { agent: 'spectre', icon: '🔍' },
        'script': { agent: 'quill', icon: '✍️' },
        'produce': { agent: 'forge', icon: '🎬' },
        'qa': { agent: 'sentinel', icon: '🛡️' },
        'publish': { agent: 'echo', icon: '📤' }
    };
    
    Object.entries(stageMap).forEach(([stage, config]) => {
        const stageEl = document.getElementById(`stage-${stage}`);
        const statusEl = document.getElementById(`stage-${stage}-status`);
        const agent = agents[config.agent];
        
        if (stageEl && statusEl && agent) {
            // Update status class
            stageEl.className = `pipeline-stage ${agent.status}`;
            
            // Update connector
            const connectors = document.querySelectorAll('.pipeline-connector');
            const stageIndex = Object.keys(stageMap).indexOf(stage);
            if (connectors[stageIndex] && agent.status !== 'idle') {
                connectors[stageIndex].classList.add('active');
            }
            
            // Update status text
            statusEl.textContent = agent.metric || agent.task || '--';
        }
    });
}

function updateChannels() {
    const channels = statusData.channels || {};
    
    Object.entries(channels).forEach(([channelName, data]) => {
        const countEl = document.getElementById(`channel-${channelName}-count`);
        const pendingEl = document.getElementById(`channel-${channelName}-pending`);
        
        if (countEl) countEl.textContent = `${data.videos || 0} live`;
        if (pendingEl) {
            const pending = (statusData.stats?.videosInProduction || 0);
            pendingEl.textContent = `+${pending} coming`;
        }
    });
}

function updateActivityLog() {
    const agents = statusData.agents || {};
    const activityLog = document.getElementById('activityLog');
    const activities = [];
    
    // Generate activity from agent statuses
    const now = new Date();
    const timeMap = {
        'echo': { offset: 0, text: 'Uploading to YouTube' },
        'sentinel': { offset: 3, text: 'QA Review in progress' },
        'forge': { offset: 6, text: 'Video assembly' },
        'quill': { offset: 9, text: 'Script generation' },
        'spectre': { offset: 12, text: 'Research & sourcing' }
    };
    
    Object.entries(agents).forEach(([agentId, agent]) => {
        if (agent.status !== 'idle') {
            const timeOffset = timeMap[agentId]?.offset || 0;
            const time = new Date(now.getTime() - timeOffset * 60000);
            const timeStr = time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            activities.push({
                time: timeStr,
                agent: agentId.toUpperCase(),
                text: agent.task || agent.metric,
                status: agent.status
            });
        }
    });
    
    // Sort by time descending
    activities.sort((a, b) => b.time.localeCompare(a.time));
    
    if (activities.length === 0) {
        activityLog.innerHTML = '<div class="activity-item"><span class="activity-time">--:--</span><span class="activity-agent">--</span><span class="activity-text">No active uploads</span></div>';
    } else {
        activityLog.innerHTML = activities.map(act => `
            <div class="activity-item">
                <span class="activity-time">${act.time}</span>
                <span class="activity-agent ${act.agent.toLowerCase()}">${act.agent}</span>
                <span class="activity-text">${act.text}</span>
            </div>
        `).join('');
    }
}

async function fetchStatus() {
    try {
        const response = await fetch(CONFIG.statusFile + '?t=' + Date.now());
        if (response.ok) {
            statusData = await response.json();
            updateStats();
            updatePipelineStages();
            updateChannels();
            updateActivityLog();
        }
    } catch (error) {
        console.log('Status file not found, using defaults');
    }
    updateTimestamp();
}

document.addEventListener('DOMContentLoaded', () => {
    fetchStatus();
    setInterval(fetchStatus, CONFIG.refreshInterval);
    setInterval(updateTimestamp, 1000);
});
