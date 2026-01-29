// Main application logic

// Switch between tabs
window.switchTab = async function(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent.toLowerCase().includes(tabName));
    });

    // Update tab content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });

    // Load tab content if not already loaded
    const tabContent = document.getElementById(`${tabName}Tab`);
    if (!tabContent) {
        console.error('Tab content not found:', `${tabName}Tab`);
        return;
    }

    console.log('Tab content found:', tabContent);
    
    // Clear existing content and show loading
    tabContent.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        if (!window.matchData) {
            throw new Error('No match data available');
        }
        
        switch (tabName) {
            case 'stats':
                await window.renderStatsTab(window.matchData, tabContent);
                break;
            case 'lineup':
                await window.renderLineupTab(window.matchData, tabContent);
                break;
            case 'table':
                await window.renderTableTab(window.matchData, tabContent);
                break;
            default:
                tabContent.innerHTML = '<div class="error-message">Tab not implemented</div>';
        }
    } catch (error) {
        console.error(`Error loading ${tabName} tab:`, error);
        tabContent.innerHTML = `<div class="error-message">Failed to load ${tabName} data: ${error.message}</div>`;
    }
};

// Player detail modal
window.showPlayerDetail = function (player) {
    if (!player) return;

    const performance = player.performance || {};
    const events = performance.events || [];
    const subEvents = performance.substitutionEvents || [];

    let statsHTML = '';
    if (performance.seasonGoals || performance.seasonAssists) {
        statsHTML = `
            <div class="modal-stats">
                ${performance.seasonGoals ? `
                    <div class="modal-stat">
                        <div class="modal-stat-value">${performance.seasonGoals}</div>
                        <div class="modal-stat-label">Season Goals</div>
                    </div>
                ` : ''}
                ${performance.seasonAssists ? `
                    <div class="modal-stat">
                        <div class="modal-stat-value">${performance.seasonAssists}</div>
                        <div class="modal-stat-label">Season Assists</div>
                    </div>
                ` : ''}
                ${performance.seasonRating ? `
                    <div class="modal-stat">
                        <div class="modal-stat-value">${performance.seasonRating}</div>
                        <div class="modal-stat-label">Avg Rating</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    let eventsHTML = '';
    if (events.length > 0 || subEvents.length > 0) {
        eventsHTML = '<div class="modal-events">';
        events.forEach(event => {
            if (event.type === 'yellowCard') eventsHTML += '<span class="event-yellow">🟨 Yellow Card</span>';
            if (event.type === 'redCard') eventsHTML += '<span class="event-red">🟥 Red Card</span>';
        });
        subEvents.forEach(event => {
            const icon = event.type === 'subIn' ? '⬆️' : '⬇️';
            eventsHTML += `<span class="event-sub">${icon} ${event.time}'</span>`;
        });
        eventsHTML += '</div>';
    }

    const info = `
        <div class="mobile-player-modal">
            <div class="modal-header" style="background: ${window.getPositionColor(player.positionId || player.usualPlayingPositionId)}">
                <div class="modal-avatar">${window.getPlayerInitials(player)}</div>
                <div class="modal-player-info">
                    <div class="modal-player-name">${player.name || 'Unknown Player'}</div>
                    <div class="modal-player-details">
                        ${player.shirtNumber ? `#${player.shirtNumber}` : ''}
                        ${window.getPositionName(player.positionId || player.usualPlayingPositionId) ? ` • ${window.getPositionName(player.positionId || player.usualPlayingPositionId)}` : ''}
                        ${player.age ? ` • ${player.age} yrs` : ''}
                    </div>
                </div>
            </div>
            
            <div class="modal-content">
                ${statsHTML}
                
                <div class="modal-info-grid">
                    ${player.countryName ? `
                        <div class="modal-info-item">
                            <div class="modal-info-label">Nationality</div>
                            <div class="modal-info-value">${player.countryName} ${player.countryCode ? `(${player.countryCode})` : ''}</div>
                        </div>
                    ` : ''}
                    
                    ${player.marketValue ? `
                        <div class="modal-info-item">
                            <div class="modal-info-label">Market Value</div>
                            <div class="modal-info-value">${window.formatMarketValueShort(player.marketValue)}</div>
                        </div>
                    ` : ''}
                    
                    ${performance.rating ? `
                        <div class="modal-info-item">
                            <div class="modal-info-label">Match Rating</div>
                            <div class="modal-info-value">${performance.rating}</div>
                        </div>
                    ` : ''}
                    
                    ${player.isCaptain ? `
                        <div class="modal-info-item">
                            <div class="modal-info-label">Role</div>
                            <div class="modal-info-value">👑 Team Captain</div>
                        </div>
                    ` : ''}
                </div>
                
                ${eventsHTML}
                
                ${player.unavailability ? `
                    <div class="modal-injury">
                        <div class="modal-injury-icon">🤕</div>
                        <div class="modal-injury-info">
                            <div class="modal-injury-title">${player.unavailability.type || 'Injury'}</div>
                            <div class="modal-injury-desc">${player.unavailability.expectedReturn || 'Return date unknown'}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        
        <style>
            .mobile-player-modal {
                background: #1a1a1a;
                border-radius: 16px;
                overflow: hidden;
                color: white;
            }
            
            .modal-header {
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .modal-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 700;
                color: white;
            }
            
            .modal-player-name {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 4px;
            }
            
            .modal-player-details {
                font-size: 14px;
                opacity: 0.9;
            }
            
            .modal-content {
                padding: 20px;
            }
            
            .modal-stats {
                display: flex;
                justify-content: space-around;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .modal-stat {
                text-align: center;
            }
            
            .modal-stat-value {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 4px;
            }
            
            .modal-stat-label {
                font-size: 12px;
                opacity: 0.7;
            }
            
            .modal-info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                margin-bottom: 20px;
            }
            
            .modal-info-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 12px;
                border-radius: 8px;
            }
            
            .modal-info-label {
                font-size: 12px;
                opacity: 0.7;
                margin-bottom: 4px;
            }
            
            .modal-info-value {
                font-size: 14px;
                font-weight: 600;
            }
            
            .modal-events {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 20px;
            }
            
            .event-yellow, .event-red, .event-sub {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
            }
            
            .event-yellow {
                background: rgba(234, 179, 8, 0.2);
                color: #eab308;
            }
            
            .event-red {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
            }
            
            .event-sub {
                background: rgba(59, 130, 246, 0.2);
                color: #3b82f6;
            }
            
            .modal-injury {
                display: flex;
                align-items: center;
                gap: 12px;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 12px;
                padding: 16px;
            }
            
            .modal-injury-icon {
                font-size: 24px;
            }
            
            .modal-injury-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .modal-injury-desc {
                font-size: 14px;
                opacity: 0.8;
            }
        </style>
    `;

    // Update modal untuk mobile
    const modalTitle = document.getElementById('modalTitle');
    const modalInfo = document.getElementById('modalInfo');

    if (modalTitle && modalInfo) {
        modalTitle.textContent = player.name || 'Player Info';
        modalInfo.innerHTML = info;

        // Custom modal untuk mobile
        const mobileModal = document.getElementById('infoModal');
        if (mobileModal) {
            mobileModal.classList.add('active');
            mobileModal.style.maxWidth = '400px';
            mobileModal.style.margin = '20px auto';
        }
    }
};

// Modal functions
window.showPlayerInfo = function(name, position) {
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalInfo').textContent = `Position: ${position}`;
    document.getElementById('infoModal').classList.add('active');
};

window.showTeamInfo = function(team, info) {
    document.getElementById('modalTitle').textContent = team;
    document.getElementById('modalInfo').textContent = info;
    document.getElementById('infoModal').classList.add('active');
};

window.showTeamDetails = function(teamId, teamName) {
    const info = `
        <strong>${teamName}</strong><br>
        <br>
        Team ID: ${teamId}<br>
        <br>
        In a full implementation, this would show detailed team information,
        including squad, manager, recent form, and upcoming fixtures.
    `;
    
    document.getElementById('modalTitle').textContent = teamName;
    document.getElementById('modalInfo').innerHTML = info;
    document.getElementById('infoModal').classList.add('active');
};

window.closeModal = function() {
    document.getElementById('infoModal').classList.remove('active');
};

// Play stream (placeholder)
window.playStream = function() {
    alert('Streaming functionality would be implemented here. In a real app, this would play the live stream.');
};

// Close modal when clicking outside
document.getElementById('infoModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});

// Initialize
window.init = async function() {
    // Get match ID
    window.matchId = window.getMatchIdFromUrl();

    if (!window.matchId) {
        document.getElementById('matchInfo').innerHTML = '<div class="error-message">No match ID provided</div>';
        return;
    }

    try {
        // Fetch match data
        window.matchData = await window.fetchMatchDetails();

        // Render match info
        window.renderMatchInfo(window.matchData);

        // Load initial tab (Statistics)
        await window.renderStatsTab(window.matchData, document.getElementById('statsTab'));

        // Set up auto-refresh if match is live
        const status = window.getMatchStatus(window.matchData);
        if (status.type === 'live') {
            window.updateInterval = setInterval(async () => {
                try {
                    const newData = await window.fetchMatchDetails();
                    window.matchData = newData;
                    window.renderMatchInfo(newData);
                    if (document.getElementById('statsTab').classList.contains('active')) {
                        await window.renderStatsTab(newData, document.getElementById('statsTab'));
                    }
                } catch (error) {
                    console.error('Error refreshing match data:', error);
                }
            }, 15000); // Refresh every 15 seconds
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('matchInfo').innerHTML = '<div class="error-message">Failed to load match details</div>';
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', window.init);

// Cleanup
window.addEventListener('beforeunload', () => {
    if (window.updateInterval) clearInterval(window.updateInterval);
});