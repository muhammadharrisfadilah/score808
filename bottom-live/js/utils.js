// Utility Functions
window.getTeamImageUrl = function(teamId) {
    return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
};

window.getLeagueImageUrl = function(leagueId) {
    return `https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueId}.png`;
};

window.getPlayerImageUrl = function(playerId) {
    return `https://images.fotmob.com/image_resources/playerimages/${playerId}.png`;
};

// Get match ID from URL
window.getMatchIdFromUrl = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id') || urlParams.get('matchId');

    // Try to get from data parameter
    const dataParam = urlParams.get('data');
    if (dataParam) {
        try {
            const data = JSON.parse(decodeURIComponent(dataParam));
            return data.matchId || matchId;
        } catch (e) {
            console.error('Error parsing data:', e);
        }
    }

    console.log('Match ID from URL:', matchId);
    return matchId;
};

// Fetch match details from API
window.fetchMatchDetails = async function() {
    try {
        const response = await fetch(`${API_BASE}/matchDetails?matchId=${matchId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Match details:', data);
        return data;
    } catch (error) {
        console.error('Error fetching match details:', error);
        throw error;
    }
};

// Get match status
window.getMatchStatus = function(data) {
    if (!data || !data.general) return { type: 'unknown', text: '', minute: '' };

    const matchStatus = data.general.matchStatus || {};

    if (matchStatus.finished) {
        return { type: 'finished', text: 'FT', minute: 'FT' };
    } else if (matchStatus.liveTime) {
        return { type: 'live', text: 'LIVE', minute: matchStatus.liveTime.short || 'LIVE' };
    } else if (matchStatus.startTime) {
        return { type: 'upcoming', text: formatTime(matchStatus.startTime), minute: formatDate(matchStatus.startTime) };
    }

    return { type: 'unknown', text: '', minute: '' };
};

window.formatTime = function(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

window.formatDate = function(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Escape HTML
window.escapeHTML = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Get match ID from URL params
window.getMatchIdFromURL = function() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('matchId');
};