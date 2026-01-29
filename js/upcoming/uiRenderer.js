// uiRenderer.js
window.UIRenderer = (function() {
    'use strict';
    
    function updateStats(matches, leagues, top) {
        document.getElementById('totalMatches').textContent = matches;
        document.getElementById('totalLeagues').textContent = leagues;
        document.getElementById('topCount').textContent = top;
    }

    function showLoading() {
        const container = document.getElementById('contentContainer');
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <div class="loading-text">Loading matches...</div>
            </div>
        `;
        updateStats(0, 0, 0);
    }

    function showEmptyState() {
        const container = document.getElementById('contentContainer');
        container.innerHTML = `
            <div class="empty-state fade-in">
                <div class="empty-icon">📅</div>
                <div class="empty-title">No Matches Found</div>
                <div class="empty-text">No upcoming matches for this date</div>
            </div>
        `;
        updateStats(0, 0, 0);
    }

    function showErrorState() {
        const container = document.getElementById('contentContainer');
        container.innerHTML = `
            <div class="empty-state fade-in">
                <div class="empty-icon">⚠️</div>
                <div class="empty-title">Connection Error</div>
                <div class="empty-text">Please check your internet connection</div>
            </div>
        `;
        updateStats(0, 0, 0);
    }

    function renderLeagues(leagues, topLeagueIds) {
        const container = document.getElementById('contentContainer');
        
        if (leagues.length === 0) {
            container.innerHTML = getNoMatchesHtml();
            return;
        }

        let html = '';
        leagues.forEach((league, index) => {
            html += renderLeagueCard(league, index, topLeagueIds.includes(league.id));
        });

        container.innerHTML = html;
    }

    function getNoMatchesHtml() {
        return `
            <div class="empty-state fade-in" style="padding: 40px 20px;">
                <div class="empty-icon" style="font-size: 48px;">🏆</div>
                <div class="empty-title">No Matches</div>
                <div class="empty-text">Try switching tabs or select another date</div>
            </div>
        `;
    }

    function renderLeagueCard(league, index, isTopLeague) {
        const matchesHtml = league.matches.map(match => renderMatchCard(match)).join('');
        const topBadge = isTopLeague ? '<span class="match-count" style="margin-right: 8px;">⭐</span>' : '';
        
        return `
            <div class="league-card fade-in" style="animation-delay: ${index * 30}ms">
                <div class="league-header" onclick="window.App.toggleLeague(this)">
                    <div class="league-info flex items-center gap-2 flex-1">
                        <div class="league-logo">
                            <img src="${window.ApiService.getImageUrl('league', league.id)}" 
                                 alt="${league.name}"
                                 onerror="this.style.display='none'">
                        </div>
                        <div class="league-text flex-1">
                            <div class="league-name">${league.name}</div>
                            <div class="league-country">${league.country || ''}</div>
                        </div>
                    </div>
                    <div class="league-meta flex items-center gap-2">
                        ${topBadge}
                        <div class="match-count">${league.matches.length}</div>
                        <div class="toggle-arrow">▼</div>
                    </div>
                </div>
                <div class="matches-list">
                    ${matchesHtml}
                </div>
            </div>
        `;
    }

    function renderMatchCard(match) {
        const home = match.home || {};
        const away = match.away || {};
        const time = window.DateUtils.extractTime(match.time);
        
        return `
            <div class="match-card" onclick="window.App.goToMatch('${match.id}')">
                <div class="match-content flex items-center justify-between gap-2">
                    <div class="team flex items-center gap-2 flex-1">
                        <div class="team-logo">
                            <img src="${window.ApiService.getImageUrl('team', home.id)}" 
                                 alt="${home.name || 'Home'}"
                                 onerror="this.style.display='none'">
                        </div>
                        <div class="team-info flex-1">
                            <div class="team-name">${home.name || 'Home Team'}</div>
                            <div class="team-label">Home</div>
                        </div>
                    </div>
                    
                    <div class="match-time-wrapper flex flex-col items-center gap-1">
                        <div class="match-time">${time}</div>
                        <div class="match-status">Upcoming</div>
                    </div>
                    
                    <div class="team away flex items-center gap-2 flex-1" style="flex-direction: row-reverse; text-align: right;">
                        <div class="team-logo">
                            <img src="${window.ApiService.getImageUrl('team', away.id)}" 
                                 alt="${away.name || 'Away'}"
                                 onerror="this.style.display='none'">
                        </div>
                        <div class="team-info flex-1">
                            <div class="team-name">${away.name || 'Away Team'}</div>
                            <div class="team-label">Away</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function updateDateDisplay(date) {
        const { main, sub } = window.DateUtils.formatDate(date);
        document.getElementById('dateMain').textContent = main;
        document.getElementById('dateSub').textContent = sub;
    }

    function renderDatePicker(date) {
        const overlay = document.getElementById('datePickerOverlay');
        const grid = document.getElementById('datePickerGrid');
        const pickerMonth = document.getElementById('pickerMonth');
        
        const year = date.getFullYear();
        const month = date.getMonth();
        
        pickerMonth.textContent = date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        const firstDayIndex = firstDay.getDay();
        const lastDate = lastDay.getDate();
        const prevLastDate = prevLastDay.getDate();
        
        const today = window.DateUtils.getToday();
        
        let html = '';
        
        // Day labels
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        days.forEach(day => {
            html += `<div class="day-label">${day}</div>`;
        });
        
        // Previous month days
        for (let i = firstDayIndex; i > 0; i--) {
            html += `<div class="day-cell disabled">${prevLastDate - i + 1}</div>`;
        }
        
        // Current month days
        for (let day = 1; day <= lastDate; day++) {
            const cellDate = new Date(year, month, day);
            const isToday = window.DateUtils.isSameDay(cellDate, today);
            const isSelected = window.DateUtils.isSameDay(cellDate, date);
            
            let classes = 'day-cell active';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            
            html += `<div class="${classes}" data-date="${year}-${month + 1}-${day}">${day}</div>`;
        }
        
        grid.innerHTML = html;
        overlay.classList.add('active');
        
        return overlay;
    }

    return {
        updateStats,
        showLoading,
        showEmptyState,
        showErrorState,
        renderLeagues,
        updateDateDisplay,
        renderDatePicker
    };
})();