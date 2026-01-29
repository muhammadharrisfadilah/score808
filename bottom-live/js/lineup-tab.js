// Render Lineup Tab - CLEAN VERSION
window.renderLineupTab = async function(data, container) {
    try {
        // Show loading
        container.innerHTML = '<div class="loading">Loading lineup...</div>';
        
        // Extract lineup data
        const lineupData = extractLineupData(data);
        
        // If no lineup data
        if (!lineupData) {
            container.innerHTML = renderNoLineupAvailable(data);
            return;
        }
        
        const homeTeam = lineupData.homeTeam || {};
        const awayTeam = lineupData.awayTeam || {};
        
        const html = `
            <div class="lineup-container">
                ${renderLineupContent(homeTeam, awayTeam, data)}
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error rendering lineup tab:', error);
        container.innerHTML = renderLineupError(error);
    }
};

// Extract lineup data
function extractLineupData(data) {
    // Try different data locations
    if (data.content?.lineup) {
        return data.content.lineup;
    }
    
    if (data.lineup) {
        return data.lineup;
    }
    
    if (data.teams) {
        return {
            homeTeam: data.teams.home,
            awayTeam: data.teams.away
        };
    }
    
    return null;
}

// Render lineup content
function renderLineupContent(homeTeam, awayTeam, matchData) {
    const homeTeamName = homeTeam.name || matchData.general?.homeTeam?.name || 'Home';
    const awayTeamName = awayTeam.name || matchData.general?.awayTeam?.name || 'Away';
    
    return `
        <div class="lineup-header">
            <div class="teams-display">
                <div class="team-display home-team">
                    <div class="team-name">${homeTeamName}</div>
                    <div class="formation">${homeTeam.formation || '4-3-3'}</div>
                </div>
                <div class="vs">VS</div>
                <div class="team-display away-team">
                    <div class="formation">${awayTeam.formation || '4-3-3'}</div>
                    <div class="team-name">${awayTeamName}</div>
                </div>
            </div>
        </div>
        
        <div class="lineup-tabs">
            <button class="lineup-tab active" onclick="switchLineupView('home')">${homeTeamName}</button>
            <button class="lineup-tab" onclick="switchLineupView('away')">${awayTeamName}</button>
        </div>
        
        <div class="lineup-content">
            <div id="home-lineup-view" class="team-lineup-view active">
                ${renderTeamLineup(homeTeam, 'home')}
            </div>
            <div id="away-lineup-view" class="team-lineup-view">
                ${renderTeamLineup(awayTeam, 'away')}
            </div>
        </div>
    `;
}

// Render team lineup
function renderTeamLineup(teamData, teamType) {
    // Extract players
    const players = teamData.players || teamData.starters || teamData.lineup || [];
    const substitutes = teamData.substitutes || teamData.subs || [];
    const unavailable = teamData.unavailable || [];
    
    if (players.length === 0) {
        return renderNoPlayersAvailable(teamType);
    }
    
    return `
        <div class="team-lineup-section">
            <!-- Starting Players -->
            <div class="players-section">
                <div class="section-title">Starting XI</div>
                <div class="players-list">
                    ${players.map(player => renderPlayerItem(player)).join('')}
                </div>
            </div>
            
            <!-- Substitutes -->
            ${substitutes.length > 0 ? `
                <div class="players-section">
                    <div class="section-title">Substitutes (${substitutes.length})</div>
                    <div class="players-list substitutes-list">
                        ${substitutes.slice(0, 7).map(player => renderPlayerItem(player)).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Unavailable -->
            ${unavailable.length > 0 ? `
                <div class="players-section">
                    <div class="section-title">Unavailable (${unavailable.length})</div>
                    <div class="players-list unavailable-list">
                        ${unavailable.map(player => renderPlayerItem(player, true)).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Coach -->
            ${teamData.coach ? `
                <div class="coach-section">
                    <div class="coach-card">
                        <div class="coach-icon">👔</div>
                        <div class="coach-info">
                            <div class="coach-name">${teamData.coach.name || 'Coach'}</div>
                            <div class="coach-title">Head Coach</div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Render player item
function renderPlayerItem(player, isUnavailable = false) {
    const name = player.name || player.shortName || 'Player';
    const number = player.shirtNumber || player.jerseyNumber || player.number || '?';
    const position = getPositionName(player.positionId || player.usualPlayingPositionId);
    const rating = player.rating || player.performance?.rating;
    const isCaptain = player.isCaptain || player.captain;
    
    const playerClass = isUnavailable ? 'player-item unavailable' : 'player-item';
    
    return `
        <div class="${playerClass}" onclick="showPlayerInfo(${JSON.stringify(player).replace(/"/g, '&quot;')})">
            <div class="player-number">${number}</div>
            <div class="player-info">
                <div class="player-name">
                    ${name}
                    ${isCaptain ? '<span class="captain-badge">C</span>' : ''}
                </div>
                <div class="player-details">
                    <span class="player-position">${position}</span>
                    ${rating ? `<span class="player-rating">${rating.toFixed(1)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Helper functions
function getPositionName(positionId) {
    if (positionId == null) return 'Player';
    
    if (positionId === 0) return 'GK';
    if (positionId === 1) return 'DEF';
    if (positionId === 2) return 'MID';
    if (positionId === 3) return 'FWD';
    
    return 'Player';
}

function renderNoLineupAvailable(data) {
    const homeTeam = data.general?.homeTeam?.name || 'Home';
    const awayTeam = data.general?.awayTeam?.name || 'Away';
    
    return `
        <div class="no-lineup-available">
            <div class="no-lineup-icon">👥</div>
            <h3>Lineup Not Available</h3>
            <p>The lineup for ${homeTeam} vs ${awayTeam} is not currently available.</p>
            <p class="lineup-info">Lineups are usually announced 1 hour before kickoff.</p>
        </div>
    `;
}

function renderNoPlayersAvailable(teamType) {
    return `
        <div class="no-players-available">
            <div class="no-players-icon">👤</div>
            <p>No player data available for ${teamType} team</p>
        </div>
    `;
}

function renderLineupError(error) {
    return `
        <div class="lineup-error">
            <div class="error-icon">⚠️</div>
            <h3>Error Loading Lineup</h3>
            <p>${error.message || 'Failed to load lineup'}</p>
            <button onclick="retryLineupLoad()" class="retry-btn">
                Try Again
            </button>
        </div>
    `;
}

// Global functions
window.switchLineupView = function(team) {
    // Update tabs
    document.querySelectorAll('.lineup-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.team-lineup-view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${team}-lineup-view`).classList.add('active');
};

window.showPlayerInfo = function(player) {
    const modal = document.getElementById('infoModal');
    if (!modal) return;
    
    const name = player.name || 'Player';
    const number = player.shirtNumber || '?';
    const position = getPositionName(player.positionId || player.usualPlayingPositionId);
    
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalInfo').innerHTML = `
        <div class="player-info-modal">
            <div class="player-number-large">${number}</div>
            <div class="player-name-large">${name}</div>
            <div class="player-position-large">${position}</div>
        </div>
    `;
    
    modal.classList.add('active');
};

window.retryLineupLoad = async function() {
    const container = document.getElementById('lineupTab');
    if (!container || !window.matchData) return;
    
    container.innerHTML = '<div class="loading">Retrying...</div>';
    await window.renderLineupTab(window.matchData, container);
};

// Add CSS
const lineupStyle = document.createElement('style');
lineupStyle.textContent = `
    .lineup-container {
        background: #1a1a1a;
        border-radius: 12px;
        padding: 16px;
    }
    
    .lineup-header {
        margin-bottom: 20px;
    }
    
    .teams-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
    }
    
    .team-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
    }
    
    .team-name {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .formation {
        font-size: 24px;
        font-weight: 700;
        color: #ff6b00;
    }
    
    .vs {
        font-size: 12px;
        color: #888;
        padding: 0 20px;
    }
    
    .lineup-tabs {
        display: flex;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 4px;
        margin-bottom: 20px;
    }
    
    .lineup-tab {
        flex: 1;
        padding: 12px;
        border: none;
        background: transparent;
        color: #888;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 6px;
    }
    
    .lineup-tab.active {
        background: #ff6b00;
        color: white;
    }
    
    .team-lineup-view {
        display: none;
    }
    
    .team-lineup-view.active {
        display: block;
    }
    
    .players-section {
        margin-bottom: 24px;
    }
    
    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: white;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .players-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .player-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .player-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .player-item.unavailable {
        opacity: 0.6;
        background: rgba(239, 68, 68, 0.1);
    }
    
    .player-number {
        width: 32px;
        height: 32px;
        background: #ff6b00;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        color: white;
        margin-right: 12px;
        flex-shrink: 0;
    }
    
    .player-info {
        flex: 1;
    }
    
    .player-name {
        font-size: 14px;
        font-weight: 600;
        color: white;
        margin-bottom: 4px;
    }
    
    .player-details {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #888;
    }
    
    .player-position {
        background: rgba(255, 107, 0, 0.1);
        color: #ff6b00;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
    }
    
    .player-rating {
        font-weight: 600;
    }
    
    .captain-badge {
        background: #ffd700;
        color: #000;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        margin-left: 8px;
    }
    
    .coach-card {
        display: flex;
        align-items: center;
        padding: 16px;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 8px;
    }
    
    .coach-icon {
        font-size: 24px;
        margin-right: 12px;
    }
    
    .coach-name {
        font-size: 14px;
        font-weight: 600;
        color: white;
        margin-bottom: 2px;
    }
    
    .coach-title {
        font-size: 12px;
        color: #888;
    }
    
    .no-lineup-available {
        text-align: center;
        padding: 40px 20px;
        color: white;
    }
    
    .no-lineup-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }
    
    .no-lineup-available h3 {
        font-size: 18px;
        margin-bottom: 8px;
        color: white;
    }
    
    .no-lineup-available p {
        color: #888;
        margin-bottom: 12px;
    }
    
    .lineup-info {
        font-size: 14px;
        color: #666 !important;
    }
    
    .no-players-available {
        text-align: center;
        padding: 40px 20px;
        color: #888;
    }
    
    .no-players-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }
    
    .lineup-error {
        text-align: center;
        padding: 40px 20px;
        color: white;
    }
    
    .lineup-error .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #ef4444;
    }
    
    .player-info-modal {
        text-align: center;
        padding: 20px;
    }
    
    .player-number-large {
        width: 60px;
        height: 60px;
        background: #ff6b00;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 700;
        color: white;
        margin: 0 auto 16px;
    }
    
    .player-name-large {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 8px;
    }
    
    .player-position-large {
        font-size: 16px;
        color: #888;
    }
`;
document.head.appendChild(lineupStyle);