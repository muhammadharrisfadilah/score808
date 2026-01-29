// Render match info - FUNCTION ADDED
window.renderMatchInfo = function(data) {
    if (!data || !data.general) {
        document.getElementById('matchInfo').innerHTML = '<div class="error-message">Failed to load match info</div>';
        return;
    }

    const general = data.general;
    const homeTeam = general.homeTeam || {};
    const awayTeam = general.awayTeam || {};
    const status = getMatchStatus(data);

    // Update live minute
    const liveMinute = document.getElementById('liveMinute');
    if (status.type === 'live') {
        liveMinute.textContent = `LIVE ${status.minute}`;
    } else if (status.type === 'finished') {
        liveMinute.textContent = 'FT';
    } else {
        liveMinute.textContent = status.text;
    }

    // Get scorers from events
    let homeScorers = [];
    let awayScorers = [];

    // Cari events dari berbagai lokasi API yang mungkin
    const events = data.content?.events?.events || 
                  data.events?.events || 
                  data.matchDetails?.events || 
                  [];

    events.forEach(event => {
        if (event.type === 0 || event.type === 1 || event.eventType === 'goal') {
            const minute = event.minute || event.time || '';
            const playerName = event.playerName || event.player?.name || 'Unknown';
            
            if (event.teamId === homeTeam.id || (event.teamId === undefined && event.homeTeam)) {
                homeScorers.push(`${playerName} ${minute}'`);
            } else if (event.teamId === awayTeam.id || (event.teamId === undefined && !event.homeTeam)) {
                awayScorers.push(`${playerName} ${minute}'`);
            }
        }
    });

    // Limit jumlah scorer yang ditampilkan
    homeScorers = homeScorers.slice(0, 2);
    awayScorers = awayScorers.slice(0, 2);

    const html = `
        <div class="league-badge">
            <div class="league-logo">
                <img src="${getLeagueImageUrl(general.leagueId)}" 
                     alt="${general.leagueName || 'League'}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <span style="display: none">🏆</span>
            </div>
            <div class="league-name">${general.leagueName || 'League'}</div>
        </div>
        <div class="teams-score">
            <div class="team">
                <div class="team-logo">
                    <img src="${getTeamImageUrl(homeTeam.id)}" 
                         alt="${homeTeam.name || 'Home Team'}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <span style="display: none">🔴</span>
                </div>
                <div class="team-name">${homeTeam.name || 'Home Team'}</div>
            </div>
            <div class="score">${homeTeam.score !== undefined ? homeTeam.score : '0'} - ${awayTeam.score !== undefined ? awayTeam.score : '0'}</div>
            <div class="team">
                <div class="team-logo">
                    <img src="${getTeamImageUrl(awayTeam.id)}" 
                         alt="${awayTeam.name || 'Away Team'}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <span style="display: none">🔵</span>
                </div>
                <div class="team-name">${awayTeam.name || 'Away Team'}</div>
            </div>
        </div>
        ${(homeScorers.length > 0 || awayScorers.length > 0) ? `
            <div class="scorers">
                <div class="scorer">
                    ${homeScorers.map(scorer => `
                        <span>${scorer}</span>
                        <span class="ball-icon">⚽</span>
                    `).join('')}
                </div>
                <div class="scorer">
                    ${awayScorers.map(scorer => `
                        <span class="ball-icon">⚽</span>
                        <span>${scorer}</span>
                    `).reverse().join('')}
                </div>
            </div>
        ` : ''}
    `;

    document.getElementById('matchInfo').innerHTML = html;
    document.getElementById('matchTitle').textContent = `${homeTeam.name || 'Home'} vs ${awayTeam.name || 'Away'}`;

    // Store league ID for table tab
    window.leagueId = general.leagueId;
};

// Render Statistics Tab - VERSI CLEAN
window.renderStatsTab = async function(data, container) {
    try {
        // Show loading
        container.innerHTML = '<div class="loading">Loading statistics...</div>';
        
        // Get statistics from match data
        const stats = await extractRelevantStatistics(data);
        
        // If no stats available
        if (!stats || stats.length === 0) {
            container.innerHTML = renderNoStatsAvailable(data);
            return;
        }
        
        const html = `
            <div class="stats-card">
                <div class="stats-header">
                    <div class="stats-team">
                        <div class="stats-team-logo">
                            ${renderTeamLogo(data.general.homeTeam?.id)}
                        </div>
                        <div class="stats-team-name">${data.general.homeTeam?.name || 'Home'}</div>
                    </div>
                    <div class="stats-team">
                        <div class="stats-team-name">${data.general.awayTeam?.name || 'Away'}</div>
                        <div class="stats-team-logo">
                            ${renderTeamLogo(data.general.awayTeam?.id)}
                        </div>
                    </div>
                </div>

                ${stats.map(stat => {
                    const homeValue = stat.homeValue || 0;
                    const awayValue = stat.awayValue || 0;
                    const total = homeValue + awayValue;
                    const homePercent = total > 0 ? Math.round((homeValue / total) * 100) : 50;
                    const awayPercent = total > 0 ? Math.round((awayValue / total) * 100) : 50;

                    return `
                        <div class="stat-row">
                            <div class="stat-label">
                                <span class="stat-value-left">${formatStatValue(homeValue, stat.format)}</span>
                                <span>${stat.title}</span>
                                <span class="stat-value-right">${formatStatValue(awayValue, stat.format)}</span>
                            </div>
                            <div class="stat-bars">
                                <div class="stat-bar-left" style="width: ${homePercent}%;"></div>
                                <div class="stat-bar-right" style="width: ${awayPercent}%;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.innerHTML = html;
        
        // Animate bars
        setTimeout(() => {
            const bars = container.querySelectorAll('.stat-bar-left, .stat-bar-right');
            bars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.opacity = '1';
                }, index * 100);
            });
        }, 100);

    } catch (error) {
        console.error('Error rendering stats tab:', error);
        container.innerHTML = renderStatsError(error);
    }
};

// Extract relevant statistics for our UI
async function extractRelevantStatistics(data) {
    try {
        const stats = [];
        
        // Get stats from API response
        const statsData = data.content?.stats?.Periods?.All?.stats || [];
        
        if (statsData.length === 0) {
            console.warn('No statistics data found');
            return [];
        }
        
        // Find "Top stats" section first
        const topStatsSection = statsData.find(section => section.key === 'top_stats');
        
        if (topStatsSection && topStatsSection.stats) {
            // Extract key statistics from top stats
            const relevantStats = [
                { key: 'BallPossesion', title: 'Ball possession' },
                { key: 'total_shots', title: 'Total shots' },
                { key: 'ShotsOnTarget', title: 'Shots on target' },
                { key: 'corners', title: 'Corners' },
                { key: 'fouls', title: 'Fouls' },
                { key: 'Offsides', title: 'Offsides' },
                { key: 'yellow_cards', title: 'Yellow cards' },
                { key: 'red_cards', title: 'Red cards' }
            ];
            
            // Find each relevant stat
            relevantStats.forEach(statConfig => {
                const statItem = topStatsSection.stats.find(item => 
                    item.key === statConfig.key || item.title === statConfig.title
                );
                
                if (statItem && statItem.stats && statItem.stats.length >= 2) {
                    let homeValue = statItem.stats[0];
                    let awayValue = statItem.stats[1];
                    
                    // Handle different value types
                    if (typeof homeValue === 'string') {
                        homeValue = parseFloat(homeValue) || 0;
                    }
                    if (typeof awayValue === 'string') {
                        awayValue = parseFloat(awayValue) || 0;
                    }
                    
                    stats.push({
                        title: statConfig.title,
                        homeValue: homeValue,
                        awayValue: awayValue,
                        format: statItem.format || 'integer'
                    });
                }
            });
        }
        
        // If we don't have enough stats from top stats, look in other sections
        if (stats.length < 4) {
            // Look for shots section
            const shotsSection = statsData.find(section => section.key === 'shots');
            if (shotsSection && shotsSection.stats) {
                const totalShots = shotsSection.stats.find(item => item.key === 'total_shots');
                const shotsOnTarget = shotsSection.stats.find(item => item.key === 'ShotsOnTarget');
                
                if (totalShots && totalShots.stats && !stats.find(s => s.title === 'Total shots')) {
                    stats.push({
                        title: 'Total shots',
                        homeValue: totalShots.stats[0] || 0,
                        awayValue: totalShots.stats[1] || 0,
                        format: totalShots.format || 'integer'
                    });
                }
                
                if (shotsOnTarget && shotsOnTarget.stats && !stats.find(s => s.title === 'Shots on target')) {
                    stats.push({
                        title: 'Shots on target',
                        homeValue: shotsOnTarget.stats[0] || 0,
                        awayValue: shotsOnTarget.stats[1] || 0,
                        format: shotsOnTarget.format || 'integer'
                    });
                }
            }
            
            // Look for passes section
            const passesSection = statsData.find(section => section.key === 'passes');
            if (passesSection && passesSection.stats) {
                const accuratePasses = passesSection.stats.find(item => item.key === 'accurate_passes');
                if (accuratePasses && accuratePasses.stats) {
                    // Extract just the number from "535 (85%)"
                    const homeStr = accuratePasses.stats[0] || "0";
                    const awayStr = accuratePasses.stats[1] || "0";
                    
                    const homeMatch = homeStr.match(/(\d+)/);
                    const awayMatch = awayStr.match(/(\d+)/);
                    
                    if (homeMatch && awayMatch) {
                        stats.push({
                            title: 'Accurate passes',
                            homeValue: parseInt(homeMatch[1]) || 0,
                            awayValue: parseInt(awayMatch[1]) || 0,
                            format: 'integer'
                        });
                    }
                }
            }
            
            // Look for defence section
            const defenceSection = statsData.find(section => section.key === 'defence' || section.key === 'defense');
            if (defenceSection && defenceSection.stats) {
                const tackles = defenceSection.stats.find(item => item.key === 'matchstats.headers.tackles');
                if (tackles && tackles.stats) {
                    stats.push({
                        title: 'Tackles',
                        homeValue: tackles.stats[0] || 0,
                        awayValue: tackles.stats[1] || 0,
                        format: tackles.format || 'integer'
                    });
                }
            }
            
            // Look for discipline section
            const disciplineSection = statsData.find(section => section.key === 'discipline');
            if (disciplineSection && disciplineSection.stats) {
                const yellowCards = disciplineSection.stats.find(item => item.key === 'yellow_cards');
                if (yellowCards && yellowCards.stats) {
                    stats.push({
                        title: 'Yellow cards',
                        homeValue: yellowCards.stats[0] || 0,
                        awayValue: yellowCards.stats[1] || 0,
                        format: yellowCards.format || 'integer'
                    });
                }
            }
        }
        
        // Ensure we have at least some basic stats
        if (stats.length === 0) {
            // Add default stats if none found
            stats.push(
                { title: 'Ball possession', homeValue: 50, awayValue: 50, format: 'integer' },
                { title: 'Total shots', homeValue: 0, awayValue: 0, format: 'integer' },
                { title: 'Shots on target', homeValue: 0, awayValue: 0, format: 'integer' },
                { title: 'Corners', homeValue: 0, awayValue: 0, format: 'integer' },
                { title: 'Fouls', homeValue: 0, awayValue: 0, format: 'integer' }
            );
        }
        
        // Limit to 8 stats maximum for clean display
        return stats.slice(0, 8);
        
    } catch (error) {
        console.error('Error extracting statistics:', error);
        return [];
    }
}

// Format statistic value based on type
function formatStatValue(value, format) {
    if (value === null || value === undefined) return '0';
    
    switch (format) {
        case 'double':
            return parseFloat(value).toFixed(1);
        case 'percentage':
            return `${value}%`;
        case 'integerWithPercentage':
            // Extract just the number if it's in format "535 (85%)"
            const match = String(value).match(/(\d+)/);
            return match ? match[1] : '0';
        default:
            return String(value);
    }
}

// Helper function to render team logo
function renderTeamLogo(teamId) {
    if (!teamId) return '⚽';
    return `<img src="${getTeamImageUrl(teamId)}" 
                 alt="Team logo"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
            <span style="display: none">⚽</span>`;
}

// Render no stats available state
function renderNoStatsAvailable(data) {
    const homeTeam = data.general?.homeTeam?.name || 'Home';
    const awayTeam = data.general?.awayTeam?.name || 'Away';
    
    return `
        <div class="no-stats-available">
            <div class="no-stats-icon">📊</div>
            <h3>Statistics Not Available</h3>
            <p>Match statistics for ${homeTeam} vs ${awayTeam} are not currently available.</p>
            <p class="stats-info">Statistics will appear once the match starts or is in progress.</p>
        </div>
    `;
}

// Render stats error
function renderStatsError(error) {
    return `
        <div class="stats-error">
            <div class="error-icon">⚠️</div>
            <h3>Error Loading Statistics</h3>
            <p>${error.message || 'Failed to load statistics'}</p>
            <button onclick="retryStatsLoad()" class="retry-btn">
                Try Again
            </button>
        </div>
    `;
}

// Global retry function
window.retryStatsLoad = async function() {
    const container = document.getElementById('statsTab');
    if (!container || !window.matchData) return;
    
    container.innerHTML = '<div class="loading">Retrying...</div>';
    await window.renderStatsTab(window.matchData, container);
};

// Add CSS for stats components
const statsStyle = document.createElement('style');
statsStyle.textContent = `
    .stats-card {
        background: rgba(26, 26, 26, 0.5);
        border: 1px solid #333;
        border-radius: 12px;
        padding: 20px;
    }
    
    .stats-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 25px;
    }
    
    .stats-team {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .stats-team-logo {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .stats-team-logo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    
    .stats-team-name {
        font-size: 15px;
        font-weight: 700;
    }
    
    .stat-row {
        margin-bottom: 20px;
    }
    
    .stat-row:last-child {
        margin-bottom: 0;
    }
    
    .stat-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
    }
    
    .stat-value-left,
    .stat-value-right {
        color: white;
        font-weight: 600;
        min-width: 30px;
        text-align: center;
    }
    
    .stat-bars {
        display: flex;
        align-items: center;
        gap: 0;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        background: #333;
    }
    
    .stat-bar-left {
        height: 100%;
        background: linear-gradient(90deg, #e63946 0%, #dc2f3c 100%);
        transition: width 0.5s ease;
        opacity: 0;
    }
    
    .stat-bar-right {
        height: 100%;
        background: linear-gradient(90deg, #555 0%, #666 100%);
        transition: width 0.5s ease;
        opacity: 0;
    }
    
    .no-stats-available {
        text-align: center;
        padding: 40px 20px;
        color: white;
    }
    
    .no-stats-available .no-stats-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }
    
    .no-stats-available h3 {
        font-size: 18px;
        margin-bottom: 8px;
        color: white;
    }
    
    .no-stats-available p {
        color: #888;
        margin-bottom: 12px;
        line-height: 1.5;
    }
    
    .stats-info {
        font-size: 14px;
        color: #666 !important;
    }
    
    .stats-error {
        text-align: center;
        padding: 40px 20px;
        color: white;
    }
    
    .stats-error .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #ef4444;
    }
    
    .stats-error h3 {
        font-size: 18px;
        margin-bottom: 8px;
        color: white;
    }
    
    .stats-error p {
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
`;
document.head.appendChild(statsStyle);