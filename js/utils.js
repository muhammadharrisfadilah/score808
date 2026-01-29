// Utility functions for home page

window.getLeagueImageUrl = function(leagueId) {
    return `https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueId}.png`;
};

window.getTeamImageUrl = function(teamId) {
    return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
};

window.formatTime = function(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(' ');
    return parts.length > 1 ? parts[1] : timeStr;
};

window.formatDate = function(utcTime) {
    if (!utcTime) return '';
    const date = new Date(utcTime);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
};

window.getTodayDate = function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

window.getMatchStatus = function(match) {
    if (!match || !match.status) return { text: '', class: 'status-upcoming', isLive: false };
    
    const status = match.status;
    if (status.started && !status.finished) {
        return { text: 'LIVE', class: 'status-live', isLive: true };
    } else if (status.finished) {
        return { text: 'FT', class: 'status-ft', isLive: false };
    } else {
        return { text: window.formatTime(match.time), class: 'status-upcoming', isLive: false };
    }
};

window.escapeHTML = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

window.navigateToMatchDetail = function(matchId) {
    // Navigate to match detail page
    window.location.href = `bottom-live/live-detail.html?matchId=${matchId}`;
};

// Navigation functions
window.showMenu = function() {
    console.log('Show menu');
    // Implement menu functionality
};

window.showSearch = function() {
    console.log('Show search');
    // Implement search functionality
};

// Fetch functions
window.fetchAllLeagues = async function() {
    try {
        const response = await fetch(`${API_BASE}/allLeagues?locale=en&ccode3=IDN`, {
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error loading all leagues:', error);
        return null;
    }
};

window.fetchTodayMatches = async function() {
    try {
        const dateStr = getTodayDate();
        const response = await fetch(`${API_BASE}/matches?date=${dateStr}&timezone=Asia%2FBangkok&ccode3=IDN`, {
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error loading matches:', error);
        return null;
    }
};