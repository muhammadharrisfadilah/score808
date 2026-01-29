// Render Table Tab - CLEAN VERSION
window.renderTableTab = async function(data, container) {
    console.log('Rendering table tab');
    
    try {
        const leagueId = data.general?.leagueId;
        const homeTeamId = data.general?.homeTeam?.id;
        const awayTeamId = data.general?.awayTeam?.id;
        
        if (!leagueId) {
            throw new Error('League ID not found');
        }
        
        // Show loading state
        container.innerHTML = '<div class="loading">Loading table data...</div>';
        
        // Fetch table data
        const tableData = await fetchTableData(leagueId);
        
        // Render the content
        const html = `
            <div class="table-h2h-container">
                ${renderLeagueTableSection(tableData, data, homeTeamId, awayTeamId)}
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error in renderTableTab:', error);
        container.innerHTML = renderErrorState(error);
    }
};

// Fetch table data dari API FotMob
async function fetchTableData(leagueId) {
    const cacheKey = `table_${leagueId}`;
    const cacheDuration = 30 * 60 * 1000; // 30 menit
    
    try {
        // Check cache first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < cacheDuration) {
                console.log('Using cached table data');
                return data;
            }
        }
        
        // Fetch from FotMob API
        const apiUrl = `https://data.fotmob.com/tables.ext.${leagueId}.fot.gz`;
        console.log('Fetching table from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch table: ${response.status}`);
        }
        
        // Parse XML response
        const xmlText = await response.text();
        const tableData = parseTableXML(xmlText, leagueId);
        
        if (!tableData) {
            throw new Error('Failed to parse table data');
        }
        
        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify({
            data: tableData,
            timestamp: Date.now()
        }));
        
        return tableData;
        
    } catch (error) {
        console.error('Error fetching table:', error);
        throw error;
    }
}

// Parse XML table data
function parseTableXML(xmlText, leagueId) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const tableElement = xmlDoc.querySelector('table');
        if (!tableElement) {
            throw new Error('No table element found');
        }
        
        const leagueName = tableElement.getAttribute('name') || 'Unknown League';
        const teams = [];
        
        // Parse teams
        const teamElements = xmlDoc.querySelectorAll('t');
        teamElements.forEach((teamElem, index) => {
            const teamId = parseInt(teamElem.getAttribute('id'));
            const teamName = teamElem.getAttribute('name');
            const played = parseInt(teamElem.getAttribute('p') || '0');
            const won = parseInt(teamElem.getAttribute('w') || '0');
            const drawn = parseInt(teamElem.getAttribute('d') || '0');
            const lost = parseInt(teamElem.getAttribute('l') || '0');
            const goalsFor = parseInt(teamElem.getAttribute('g') || '0');
            const goalsAgainst = parseInt(teamElem.getAttribute('c') || '0');
            const gd = goalsFor - goalsAgainst;
            const points = (won * 3) + drawn;
            
            teams.push({
                id: teamId,
                name: teamName,
                position: index + 1,
                played: played,
                won: won,
                drawn: drawn,
                lost: lost,
                goalsFor: goalsFor,
                goalsAgainst: goalsAgainst,
                gd: gd,
                points: points
            });
        });
        
        // Sort by points, then GD, then goals for
        teams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.goalsFor - a.goalsFor;
        });
        
        // Update positions after sorting
        teams.forEach((team, index) => {
            team.position = index + 1;
        });
        
        // Parse qualification zones
        const rules = [];
        const ruleElements = xmlDoc.querySelectorAll('rules ti');
        ruleElements.forEach(ruleElem => {
            const desc = ruleElem.getAttribute('desc');
            const color = ruleElem.getAttribute('color');
            const value = ruleElem.getAttribute('value');
            
            if (desc && value) {
                const positions = value.split(',').map(pos => parseInt(pos.trim()));
                rules.push({
                    description: desc,
                    color: color,
                    positions: positions
                });
            }
        });
        
        return {
            leagueId: leagueId,
            leagueName: leagueName,
            teams: teams,
            rules: rules,
            lastUpdated: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error parsing XML:', error);
        throw error;
    }
}

// Render league table section
function renderLeagueTableSection(tableData, matchData, homeTeamId, awayTeamId) {
    if (!tableData || !tableData.teams || tableData.teams.length === 0) {
        return renderEmptyTableState(matchData);
    }
    
    const leagueName = tableData.leagueName || matchData.general?.leagueName || 'League';
    
    return `
        <div class="league-table-section">
            <div class="league-table-header">
                <div class="league-table-title">${leagueName}</div>
                <div class="league-table-subtitle">
                    <span>Current Standings</span>
                    <span>${tableData.teams.length} teams</span>
                </div>
            </div>
            
            ${renderQualificationZones(tableData.rules)}
            
            <div class="table-scroll-container">
                <table class="compact-table">
                    <thead>
                        <tr>
                            <th class="compact-pos">#</th>
                            <th style="text-align: left;">Team</th>
                            <th class="compact-stat">P</th>
                            <th class="compact-stat">W</th>
                            <th class="compact-stat">D</th>
                            <th class="compact-stat">L</th>
                            <th class="compact-stat">GD</th>
                            <th class="compact-stat">PTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableData.teams.slice(0, 12).map(team => {
                            const isHomeTeam = team.id == homeTeamId;
                            const isAwayTeam = team.id == awayTeamId;
                            const highlightClass = (isHomeTeam || isAwayTeam) ? 'highlight-team' : '';
                            const zoneStyle = getTeamZoneStyle(team.position, tableData.rules);
                            
                            return `
                                <tr class="${highlightClass}" onclick="showTeamInfo(${team.id}, '${escapeHTML(team.name)}')" style="${zoneStyle}">
                                    <td class="compact-pos">${team.position}</td>
                                    <td>
                                        <div class="compact-team">
                                            <div class="compact-name">${escapeHTML(team.name)}</div>
                                        </div>
                                    </td>
                                    <td class="compact-stat">${team.played}</td>
                                    <td class="compact-stat">${team.won}</td>
                                    <td class="compact-stat">${team.drawn}</td>
                                    <td class="compact-stat">${team.lost}</td>
                                    <td class="compact-stat ${team.gd > 0 ? 'positive' : team.gd < 0 ? 'negative' : ''}">
                                        ${team.gd > 0 ? '+' : ''}${team.gd}
                                    </td>
                                    <td class="compact-points">${team.points}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="view-full-table">
                <button onclick="showFullTable('${tableData.leagueId}', '${escapeHTML(leagueName)}')">
                    View Full Table
                </button>
            </div>
        </div>
    `;
}

// Render qualification zones
function renderQualificationZones(rules) {
    if (!rules || rules.length === 0) return '';
    
    return `
        <div class="qualification-zones">
            ${rules.map(rule => `
                <div class="zone-indicator">
                    <div class="zone-color" style="background: ${rule.color || '#666'}"></div>
                    <div class="zone-label">${rule.description}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Get team zone style
function getTeamZoneStyle(position, rules) {
    if (!rules || !position) return '';
    
    for (const rule of rules) {
        if (rule.positions.includes(position)) {
            return `border-left: 3px solid ${rule.color};`;
        }
    }
    
    return '';
}

// Render empty table state
function renderEmptyTableState(matchData) {
    const leagueName = matchData.general?.leagueName || 'League';
    
    return `
        <div class="league-table-section">
            <div class="league-table-header">
                <div class="league-table-title">${leagueName}</div>
            </div>
            
            <div class="empty-table-state">
                <div class="empty-icon">📊</div>
                <h3>No Table Data Available</h3>
                <p>Table data for ${leagueName} is not currently available.</p>
                <button onclick="retryTableLoad()" class="retry-btn">
                    Try Again
                </button>
            </div>
        </div>
    `;
}

// Render error state
function renderErrorState(error) {
    return `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Error Loading Table</h3>
            <p>${error.message || 'Failed to load table data'}</p>
            <button onclick="retryTableLoad()" class="retry-btn">
                Retry
            </button>
        </div>
    `;
}

// Helper functions
window.retryTableLoad = async function() {
    const container = document.getElementById('tableTab');
    if (!container || !window.matchData) return;
    
    container.innerHTML = '<div class="loading">Retrying...</div>';
    await window.renderTableTab(window.matchData, container);
};

window.showTeamInfo = function(teamId, teamName) {
    const modal = document.getElementById('infoModal');
    if (!modal) return;
    
    document.getElementById('modalTitle').textContent = teamName;
    document.getElementById('modalInfo').innerHTML = `
        <div class="team-info-modal">
            <div class="team-name-large">${teamName}</div>
            <div class="team-id">Team ID: ${teamId}</div>
            <p>Team information and statistics would be displayed here.</p>
        </div>
    `;
    
    modal.classList.add('active');
};

window.showFullTable = function(leagueId, leagueName) {
    const modal = document.getElementById('infoModal');
    if (!modal) return;
    
    document.getElementById('modalTitle').textContent = `${leagueName} - Full Table`;
    document.getElementById('modalInfo').innerHTML = `
        <div class="full-table-modal">
            <div class="modal-icon">📊</div>
            <h3>Full League Table</h3>
            <p>The complete table with all teams would be displayed here.</p>
        </div>
    `;
    
    modal.classList.add('active');
};

// Add CSS for new components
const style = document.createElement('style');
style.textContent = `
    .qualification-zones {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
    }
    
    .zone-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
    }
    
    .zone-color {
        width: 12px;
        height: 12px;
        border-radius: 3px;
    }
    
    .zone-label {
        color: #888;
    }
    
    .empty-table-state {
        text-align: center;
        padding: 40px 20px;
        color: white;
    }
    
    .empty-table-state .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }
    
    .empty-table-state h3 {
        font-size: 18px;
        margin-bottom: 8px;
        color: white;
    }
    
    .empty-table-state p {
        color: #888;
        margin-bottom: 20px;
    }
    
    .error-state {
        text-align: center;
        padding: 40px 20px;
        color: white;
    }
    
    .error-state .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #ef4444;
    }
    
    .error-state h3 {
        font-size: 18px;
        margin-bottom: 8px;
        color: white;
    }
    
    .error-state p {
        color: #888;
        margin-bottom: 20px;
    }
    
    .retry-btn {
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
    
    .retry-btn:hover {
        opacity: 0.9;
    }
    
    .team-info-modal {
        text-align: center;
        padding: 20px;
    }
    
    .team-name-large {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 8px;
    }
    
    .team-id {
        font-size: 14px;
        color: #888;
        margin-bottom: 16px;
    }
    
    .full-table-modal {
        text-align: center;
        padding: 20px;
    }
    
    .modal-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }
`;
document.head.appendChild(style);