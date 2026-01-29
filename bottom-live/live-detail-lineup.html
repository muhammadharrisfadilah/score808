// Render Lineup Tab - DENGAN UI/UX BARU YANG BAGUS (FIXED VERSION)
window.renderLineupTab = async function(data, container) {
    try {
        // Show loading
        container.innerHTML = '<div class="loading">Loading lineup...</div>';
        
        // Extract lineup data
        const lineupData = extractLineupData(data);
        
        // If no lineup data
        if (!lineupData) {
            return renderNoLineupAvailable(data);
        }
        
        const homeTeam = lineupData.homeTeam || {};
        const awayTeam = lineupData.awayTeam || {};
        
        // Render with new UI/UX design
        const html = `
            <div class="lineup-container-new">
                ${renderTeamLineupNew(homeTeam, 'home', data)}
                ${renderTeamLineupNew(awayTeam, 'away', data)}
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add CSS styles
        addLineupStylesToDocument();
        
    } catch (error) {
        console.error('Error rendering lineup tab:', error);
        container.innerHTML = renderLineupError(error);
    }
};

// Extract lineup data
function extractLineupData(data) {
    // Try different data locations
    if (data.content && data.content.lineup) {
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

// Render team lineup with new UI/UX
function renderTeamLineupNew(teamData, teamType, matchData) {
    const teamName = teamData.name || 
                   (teamType === 'home' ? (matchData.general && matchData.general.homeTeam ? matchData.general.homeTeam.name : 'Home Team') : 
                                          (matchData.general && matchData.general.awayTeam ? matchData.general.awayTeam.name : 'Away Team'));
    
    const formation = teamData.formation || '4-3-3';
    
    // Extract players
    const players = teamData.players || teamData.starters || teamData.lineup || [];
    const substitutes = teamData.substitutes || teamData.subs || [];
    
    // Position players based on formation
    const positionedPlayers = positionPlayers(players, formation);
    
    return `
        <div class="lineup-section-new">
            <div class="lineup-header-new">
                <div class="team-title-new">${escapeHTML(teamName)}</div>
                <div class="formation-new">${formation}</div>
            </div>
            
            <div class="field-container-new">
                <div class="field-new">
                    <!-- Field lines -->
                    <div class="field-line-new center-line-new"></div>
                    <div class="center-circle-new"></div>
                    <div class="penalty-box-new penalty-top-new"></div>
                    <div class="penalty-box-new penalty-bottom-new"></div>
                    
                    <!-- Players -->
                    ${positionedPlayers.map(player => renderPlayerDot(player)).join('')}
                </div>
            </div>
            
            <!-- Substitutes -->
            ${substitutes.length > 0 ? `
                <div class="subs-title-new">Substitutes</div>
                <div class="subs-container-new">
                    ${substitutes.slice(0, 5).map(sub => renderSubstituteItem(sub)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Position players on field based on formation
function positionPlayers(players, formation) {
    const positions = getFormationPositions(formation);
    
    return players.slice(0, 11).map((player, index) => {
        const pos = positions[index] || { top: 50, left: 50 };
        
        return {
            ...player,
            position: pos,
            displayName: getShortPlayerName(player),
            number: player.shirtNumber || player.jerseyNumber || player.number || (index + 1)
        };
    });
}

// Get positions for different formations
function getFormationPositions(formation) {
    const formations = {
        '4-3-3': [
            { top: 8, left: 50 }, // GK
            { top: 22, left: 15 }, // LB
            { top: 22, left: 38 }, // LCB
            { top: 22, left: 62 }, // RCB
            { top: 22, left: 85 }, // RB
            { top: 48, left: 25 }, // LCM
            { top: 48, left: 50 }, // CM
            { top: 48, left: 75 }, // RCM
            { top: 78, left: 20 }, // LW
            { top: 78, left: 50 }, // ST
            { top: 78, left: 80 }  // RW
        ],
        '4-2-3-1': [
            { top: 8, left: 50 }, // GK
            { top: 22, left: 15 }, // LB
            { top: 22, left: 38 }, // LCB
            { top: 22, left: 62 }, // RCB
            { top: 22, left: 85 }, // RB
            { top: 42, left: 35 }, // LCDM
            { top: 42, left: 65 }, // RCDM
            { top: 62, left: 20 }, // LW
            { top: 62, left: 50 }, // CAM
            { top: 62, left: 80 }, // RW
            { top: 85, left: 50 }  // ST
        ],
        '4-4-2': [
            { top: 8, left: 50 }, // GK
            { top: 22, left: 15 }, // LB
            { top: 22, left: 38 }, // LCB
            { top: 22, left: 62 }, // RCB
            { top: 22, left: 85 }, // RB
            { top: 45, left: 15 }, // LM
            { top: 45, left: 35 }, // LCM
            { top: 45, left: 65 }, // RCM
            { top: 45, left: 85 }, // RM
            { top: 75, left: 35 }, // LS
            { top: 75, left: 65 }  // RS
        ],
        '3-5-2': [
            { top: 8, left: 50 }, // GK
            { top: 22, left: 25 }, // LCB
            { top: 22, left: 50 }, // CB
            { top: 22, left: 75 }, // RCB
            { top: 45, left: 10 }, // LWB
            { top: 45, left: 30 }, // LDM
            { top: 45, left: 50 }, // CDM
            { top: 45, left: 70 }, // RDM
            { top: 45, left: 90 }, // RWB
            { top: 75, left: 40 }, // LS
            { top: 75, left: 60 }  // RS
        ]
    };
    
    return formations[formation] || formations['4-3-3'];
}

// Render player dot on field
function renderPlayerDot(player) {
    const name = player.displayName || getShortPlayerName(player);
    const number = player.number || '?';
    
    return `
        <div class="player-dot-new" 
             style="top: ${player.position.top}%; left: ${player.position.left}%;"
             onclick="showPlayerInfoLineup(${JSON.stringify(player).replace(/"/g, '&quot;')})">
            <span class="player-number-new">${number}</span>
            <span class="player-name-label-new">${escapeHTML(name)}</span>
        </div>
    `;
}

// Render substitute item
function renderSubstituteItem(player) {
    const name = getShortPlayerName(player);
    const number = player.shirtNumber || player.jerseyNumber || player.number || '?';
    
    return `
        <div class="sub-player-new" onclick="showPlayerInfoLineup(${JSON.stringify(player).replace(/"/g, '&quot;')})">
            <div class="jersey-icon-new">${number}</div>
            <div class="sub-name-new">${escapeHTML(name)}</div>
        </div>
    `;
}

// Helper functions
function getShortPlayerName(player) {
    if (player.shortName) return player.shortName;
    if (player.name) {
        const parts = player.name.split(' ');
        if (parts.length > 1) {
            const lastName = parts[parts.length - 1];
            const firstNameInitial = parts[0].charAt(0) + '.';
            return lastName.length > 8 ? firstNameInitial + ' ' + lastName : player.name;
        }
        return player.name.length > 10 ? player.name.substring(0, 10) + '...' : player.name;
    }
    return 'Player';
}

function getPositionName(positionId) {
    if (positionId == null) return 'Player';
    
    if (positionId === 0) return 'GK';
    if (positionId === 1) return 'DEF';
    if (positionId === 2) return 'MID';
    if (positionId === 3) return 'FWD';
    
    return 'Player';
}

// Render no lineup available
function renderNoLineupAvailable(data) {
    const homeTeam = data.general && data.general.homeTeam ? data.general.homeTeam.name : 'Home';
    const awayTeam = data.general && data.general.awayTeam ? data.general.awayTeam.name : 'Away';
    
    return `
        <div class="no-lineup-available-new">
            <div class="no-lineup-icon-new">👥</div>
            <h3>Lineup Not Available</h3>
            <p>The lineup for ${escapeHTML(homeTeam)} vs ${escapeHTML(awayTeam)} is not currently available.</p>
            <p class="lineup-info-new">Lineups are usually announced 1 hour before kickoff.</p>
        </div>
    `;
}

// Render lineup error
function renderLineupError(error) {
    return `
        <div class="lineup-error-new">
            <div class="error-icon-new">⚠️</div>
            <h3>Error Loading Lineup</h3>
            <p>${escapeHTML(error.message || 'Failed to load lineup')}</p>
            <button onclick="retryLineupLoad()" class="retry-btn-new">
                Try Again
            </button>
        </div>
    `;
}

// Add CSS styles for new lineup UI
function addLineupStylesToDocument() {
    // Check if styles already exist
    if (document.getElementById('lineup-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'lineup-styles';
    style.textContent = `
        .lineup-container-new {
            padding: 16px;
            background: #000000;
        }
        
        .lineup-section-new {
            margin-bottom: 30px;
        }
        
        .lineup-header-new {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .team-title-new {
            font-size: 16px;
            font-weight: 700;
            color: white;
        }
        
        .formation-new {
            font-size: 13px;
            color: #888;
            font-weight: 600;
        }
        
        .field-container-new {
            background: linear-gradient(180deg, rgba(139, 0, 0, 0.3) 0%, rgba(92, 0, 0, 0.3) 100%);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
        }
        
        .field-new {
            width: 100%;
            aspect-ratio: 3/4;
            background: linear-gradient(180deg, rgba(100, 30, 30, 0.4) 0%, rgba(60, 20, 20, 0.4) 100%);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
        }
        
        .field-line-new {
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
        }
        
        .center-line-new {
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
        }
        
        .center-circle-new {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
        }
        
        .penalty-box-new {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 18%;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 3px;
        }
        
        .penalty-top-new {
            top: 0;
            border-top: none;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
        }
        
        .penalty-bottom-new {
            bottom: 0;
            border-bottom: none;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }
        
        .player-dot-new {
            position: absolute;
            width: 36px;
            height: 36px;
            background: white;
            border: 2px solid #ff6b00;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
            z-index: 10;
        }
        
        .player-dot-new:active {
            transform: translate(-50%, -50%) scale(1.1);
        }
        
        .player-number-new {
            font-size: 11px;
            font-weight: 700;
            color: #000;
        }
        
        .player-name-label-new {
            position: absolute;
            bottom: -18px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
            font-weight: 600;
            white-space: nowrap;
            background: rgba(0, 0, 0, 0.7);
            padding: 2px 6px;
            border-radius: 3px;
            color: white;
        }
        
        .subs-title-new {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 12px;
            color: white;
        }
        
        .subs-container-new {
            background: rgba(26, 26, 26, 0.5);
            border: 1px solid #333;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .sub-player-new {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px;
            border-bottom: 1px solid #333;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .sub-player-new:last-child {
            border-bottom: none;
        }
        
        .sub-player-new:active {
            background: rgba(255, 255, 255, 0.05);
        }
        
        .jersey-icon-new {
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
        }
        
        .sub-name-new {
            font-size: 14px;
            font-weight: 600;
            color: white;
        }
        
        .no-lineup-available-new {
            text-align: center;
            padding: 40px 20px;
            color: white;
        }
        
        .no-lineup-icon-new {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        
        .no-lineup-available-new h3 {
            font-size: 18px;
            margin-bottom: 8px;
            color: white;
        }
        
        .no-lineup-available-new p {
            color: #888;
            margin-bottom: 12px;
            line-height: 1.5;
        }
        
        .lineup-info-new {
            font-size: 14px;
            color: #666;
        }
        
        .lineup-error-new {
            text-align: center;
            padding: 40px 20px;
            color: white;
        }
        
        .lineup-error-new .error-icon-new {
            font-size: 48px;
            margin-bottom: 16px;
            color: #ef4444;
        }
        
        .lineup-error-new h3 {
            font-size: 18px;
            margin-bottom: 8px;
            color: white;
        }
        
        .lineup-error-new p {
            color: #888;
            margin-bottom: 20px;
        }
        
        .retry-btn-new {
            background: #ff6b00;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        
        .retry-btn-new:hover {
            opacity: 0.9;
        }
    `;
    
    document.head.appendChild(style);
}

// Global functions for lineup
window.showPlayerInfoLineup = function(player) {
    const modal = document.getElementById('infoModal');
    if (!modal) return;
    
    const name = player.name || 'Player';
    const number = player.shirtNumber || player.jerseyNumber || player.number || '?';
    const position = getPositionName(player.positionId || player.usualPlayingPositionId);
    const team = player.teamName || 'Team';
    
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('modalInfo').innerHTML = `
        <div class="player-info-modal">
            <div class="player-info-header">
                <div class="player-number-large">${number}</div>
                <div>
                    <div class="player-name-large">${escapeHTML(name)}</div>
                    <div class="player-position-large">${escapeHTML(position)} • ${escapeHTML(team)}</div>
                </div>
            </div>
            
            ${player.rating ? `
                <div class="player-rating-info">
                    <div class="rating-label">Rating</div>
                    <div class="rating-value">${player.rating.toFixed(1)}</div>
                </div>
            ` : ''}
            
            ${player.age ? `
                <div class="player-age-info">
                    <div class="info-label">Age</div>
                    <div class="info-value">${player.age} years</div>
                </div>
            ` : ''}
            
            ${player.countryName ? `
                <div class="player-country-info">
                    <div class="info-label">Nationality</div>
                    <div class="info-value">${escapeHTML(player.countryName)}</div>
                </div>
            ` : ''}
        </div>
        
        <style>
            .player-info-modal {
                text-align: left;
            }
            
            .player-info-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 20px;
            }
            
            .player-number-large {
                width: 50px;
                height: 50px;
                background: #ff6b00;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 700;
                color: white;
                flex-shrink: 0;
            }
            
            .player-name-large {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 4px;
            }
            
            .player-position-large {
                font-size: 14px;
                color: #888;
            }
            
            .player-rating-info,
            .player-age-info,
            .player-country-info {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .rating-label,
            .info-label {
                font-size: 14px;
                color: #888;
            }
            
            .rating-value {
                font-size: 16px;
                font-weight: 700;
                color: #ff6b00;
            }
            
            .info-value {
                font-size: 14px;
                color: white;
            }
        </style>
    `;
    
    modal.classList.add('active');
};

window.retryLineupLoad = async function() {
    const container = document.getElementById('lineupTab');
    if (!container || !window.matchData) return;
    
    container.innerHTML = '<div class="loading">Retrying...</div>';
    await window.renderLineupTab(window.matchData, container);
};