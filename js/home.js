// Home page functionality
let popularLeagues = [];
let allLeaguesData = null;
let allMatchesData = [];
let selectedLeagueId = null;
let otherLeaguesVisible = false;
let isLoading = false;
let updateInterval = null;

// Render top leagues carousel
window.renderTopLeagues = async function() {
    const container = document.getElementById('leaguesCarousel');
    
    if (popularLeagues.length === 0) {
        const data = await window.fetchAllLeagues();
        if (data && data.popular) {
            popularLeagues = data.popular;
        }
    }
    
    if (!popularLeagues || popularLeagues.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 10px;">Failed to load leagues</p>';
        return;
    }
    
    // Filter to show only top leagues
    const displayLeagues = popularLeagues.filter(league => 
        window.TOP_LEAGUE_IDS.includes(parseInt(league.id))
    ).slice(0, 8);
    
    if (displayLeagues.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center;">No leagues available</p>';
        return;
    }
    
    container.innerHTML = displayLeagues.map(league => `
        <div class="league-item ${selectedLeagueId === league.id ? 'active' : ''}" 
             onclick="filterByLeague('${league.id}')" 
             data-league-id="${league.id}">
            <div class="league-icon">
                <img src="${window.getLeagueImageUrl(league.id)}" 
                     alt="${league.name}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <span style="display: none;">${window.COUNTRY_FLAGS[league.ccode] || '🏆'}</span>
            </div>
            <div class="league-name">${window.escapeHTML(league.name)}</div>
        </div>
    `).join('');
};

// Filter by league
window.filterByLeague = function(leagueId) {
    if (selectedLeagueId === leagueId) {
        selectedLeagueId = null;
    } else {
        selectedLeagueId = leagueId;
    }
    
    document.querySelectorAll('.league-item').forEach(item => {
        item.classList.toggle('active', item.dataset.leagueId === selectedLeagueId);
    });
    
    renderTodayMatches(allMatchesData);
};

// Render upcoming matches
window.renderUpcomingMatches = function(leagues) {
    const container = document.getElementById('upcomingMatches');
    let upcomingMatches = [];
    
    if (!leagues) {
        container.innerHTML = '<p style="color: #888; text-align: center;">No data</p>';
        return;
    }

    leagues.forEach(league => {
        if (league.matches) {
            const upcoming = league.matches.filter(m => !m.status.started);
            upcomingMatches = upcomingMatches.concat(upcoming.slice(0, 2).map(match => ({
                ...match,
                leagueName: league.name
            })));
        }
    });

    if (upcomingMatches.length === 0) {
        container.innerHTML = '<p style="color: #888; text-align: center; padding: 40px 0;">No upcoming matches</p>';
        return;
    }

    container.innerHTML = upcomingMatches.slice(0, 5).map(match => `
        <div class="upcoming-card" onclick="window.navigateToMatchDetail('${match.id}')">
            <div class="upcoming-date-time">
                <span class="upcoming-date">${window.formatDate(match.status.utcTime)}</span>
                <span class="upcoming-time">${window.formatTime(match.time)}</span>
            </div>
            <div class="upcoming-match-content">
                <div class="upcoming-team">
                    <div class="upcoming-team-logo">
                        <img src="${window.getTeamImageUrl(match.home.id)}" 
                             alt="${match.home.name}"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <span style="display: none;">⚽</span>
                    </div>
                    <div class="upcoming-team-name">${window.escapeHTML(match.home.name)}</div>
                </div>
                <div class="upcoming-vs">vs</div>
                <div class="upcoming-team">
                    <div class="upcoming-team-logo">
                        <img src="${window.getTeamImageUrl(match.away.id)}" 
                             alt="${match.away.name}"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <span style="display: none;">⚽</span>
                    </div>
                    <div class="upcoming-team-name">${window.escapeHTML(match.away.name)}</div>
                </div>
            </div>
        </div>
    `).join('');
};

// Render match card
function renderMatchCard(match) {
    const status = window.getMatchStatus(match);
    const homeScore = match.home.score !== undefined ? match.home.score : '-';
    const awayScore = match.away.score !== undefined ? match.away.score : '-';
    
    return `
        <div class="detail-match" onclick="window.navigateToMatchDetail('${match.id}')">
            <div class="match-team-section">
                <div class="team-logo-circle">
                    <img src="${window.getTeamImageUrl(match.home.id)}" 
                         alt="${match.home.name}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span style="display: none;">⚽</span>
                </div>
                <div class="team-name-detail">${window.escapeHTML(match.home.name)}</div>
            </div>
            <div class="match-center">
                <div class="match-score">${status.isLive || status.text === 'FT' ? homeScore + ' - ' + awayScore : status.text}</div>
                <div class="match-status ${status.class}">${status.text}</div>
            </div>
            <div class="match-team-section" style="flex-direction: row-reverse;">
                <div class="team-logo-circle">
                    <img src="${window.getTeamImageUrl(match.away.id)}" 
                         alt="${match.away.name}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <span style="display: none;">⚽</span>
                </div>
                <div class="team-name-detail" style="text-align: right;">${window.escapeHTML(match.away.name)}</div>
            </div>
            ${status.isLive ? '<div class="live-indicator"></div>' : ''}
        </div>
    `;
}

// Render today's matches
window.renderTodayMatches = function(leagues) {
    const topContainer = document.getElementById('topLeaguesMatches');
    const otherContainer = document.getElementById('otherLeaguesMatches');
    const hideBtn = document.getElementById('hideAllBtn');

    if (!leagues || leagues.length === 0) {
        topContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 40px 0;">No matches today</p>';
        otherContainer.innerHTML = '';
        hideBtn.classList.add('hidden');
        return;
    }

    let filteredLeagues = leagues;
    if (selectedLeagueId) {
        filteredLeagues = leagues.filter(l => l.id == selectedLeagueId);
        
        if (filteredLeagues.length === 0 || !filteredLeagues[0].matches || filteredLeagues[0].matches.length === 0) {
            topContainer.innerHTML = `
                <div class="no-matches-card">
                    <div class="no-matches-icon">📅</div>
                    <div class="no-matches-text">No matches today for this league</div>
                </div>
            `;
            otherContainer.innerHTML = '';
            hideBtn.classList.add('hidden');
            return;
        }
    }

    const topLeagues = filteredLeagues.filter(l => window.TOP_LEAGUE_IDS.includes(parseInt(l.id)));
    const otherLeagues = filteredLeagues.filter(l => !window.TOP_LEAGUE_IDS.includes(parseInt(l.id)));

    topContainer.innerHTML = topLeagues.map((league, index) => {
        if (!league.matches || league.matches.length === 0) return '';
        return `
            <div class="match-item" id="top-league-${index}">
                <div class="match-item-header" onclick="toggleMatchDetails('top-league-${index}')">
                    <div class="match-league-info">
                        <div class="league-badge">
                            <img src="${window.getLeagueImageUrl(league.id)}" 
                                 alt="${league.name}"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <span style="display: none;">🏆</span>
                        </div>
                        <div class="league-info-text">${window.escapeHTML(league.name)}</div>
                    </div>
                    <div class="match-actions">
                        <div class="match-count">${league.matches.length}</div>
                        <div class="expand-icon">▼</div>
                    </div>
                </div>
                <div class="match-details">
                    ${league.matches.map(match => renderMatchCard(match)).join('')}
                </div>
            </div>
        `;
    }).join('');

    if (otherLeagues.length > 0 && !selectedLeagueId) {
        hideBtn.classList.remove('hidden');
        otherContainer.innerHTML = otherLeagues.map((league, index) => {
            if (!league.matches || league.matches.length === 0) return '';
            return `
                <div class="match-item" id="other-league-${index}">
                    <div class="match-item-header" onclick="toggleMatchDetails('other-league-${index}')">
                        <div class="match-league-info">
                            <div class="league-badge">
                                <img src="${window.getLeagueImageUrl(league.id)}" 
                                     alt="${league.name}"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <span style="display: none;">🏆</span>
                            </div>
                            <div class="league-info-text">${window.escapeHTML(league.name)}</div>
                        </div>
                        <div class="match-actions">
                            <div class="match-count">${league.matches.length}</div>
                            <div class="expand-icon">▼</div>
                        </div>
                    </div>
                    <div class="match-details">
                        ${league.matches.map(match => renderMatchCard(match)).join('')}
                    </div>
                </div>
            `;
        }).join('');
        
        if (!otherLeaguesVisible) {
            otherContainer.classList.add('hidden');
        }
    } else {
        hideBtn.classList.add('hidden');
        otherContainer.innerHTML = '';
    }
};

// Toggle other leagues visibility
window.toggleOtherLeagues = function() {
    const otherContainer = document.getElementById('otherLeaguesMatches');
    const hideBtn = document.getElementById('hideAllBtn');
    
    otherLeaguesVisible = !otherLeaguesVisible;
    
    if (otherLeaguesVisible) {
        otherContainer.classList.remove('hidden');
        hideBtn.textContent = 'Hide Other Leagues';
    } else {
        otherContainer.classList.add('hidden');
        hideBtn.textContent = 'Show Other Leagues';
    }
};

// Toggle match details
window.toggleMatchDetails = function(elementId) {
    const element = document.getElementById(elementId);
    element.classList.toggle('expanded');
};

// Load matches
window.loadMatches = async function() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        const data = await window.fetchTodayMatches();

        if (data && data.leagues) {
            allMatchesData = data.leagues;
            
            if (popularLeagues.length === 0) {
                await window.renderTopLeagues();
            }
            
            window.renderUpcomingMatches(data.leagues);
            window.renderTodayMatches(data.leagues);
        } else {
            document.getElementById('topLeaguesMatches').innerHTML = '<p style="color: #888; text-align: center; padding: 40px 0;">No matches available</p>';
        }
    } catch (error) {
        console.error('Error loading matches:', error);
        document.getElementById('topLeaguesMatches').innerHTML = '<p style="color: #888; text-align: center; padding: 40px 0;">Error loading matches. Please try again later.</p>';
    } finally {
        isLoading = false;
    }
};

// Initialize
window.initHome = async function() {
    await window.loadMatches();
    
    // Auto-refresh every 30 seconds
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(window.loadMatches, 30000);
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', window.initHome);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) clearInterval(updateInterval);
});