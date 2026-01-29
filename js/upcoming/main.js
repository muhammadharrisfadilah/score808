// ==================== DATE UTILITIES ====================
const DateUtils = {
    formatDate: function(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return { main: 'TODAY', sub: '' };
        if (diffDays === 1) return { main: 'TOMORROW', sub: '' };
        if (diffDays === -1) return { main: 'YESTERDAY', sub: '' };
        
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const main = targetDate.toLocaleDateString('en-US', options).toUpperCase();
        
        let sub = '';
        if (diffDays > 1) sub = `In ${diffDays} days`;
        if (diffDays < -1) sub = `${Math.abs(diffDays)} days ago`;
        
        return { main, sub };
    },

    getDateString: function(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    isSameDay: function(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    getToday: function() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    },

    extractTime: function(timeString) {
        if (!timeString) return 'TBD';
        const parts = timeString.split(' ');
        return parts.length > 1 ? parts[1].substring(0, 5) : timeString;
    }
};

// ==================== CACHE SERVICE ====================
const CacheService = (function() {
    const cache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    return {
        get: function(key) {
            const cached = cache.get(key);
            if (!cached) return null;
            
            const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
            if (isExpired) {
                cache.delete(key);
                return null;
            }
            
            return cached.data;
        },

        set: function(key, data) {
            cache.set(key, { 
                data, 
                timestamp: Date.now() 
            });
        },

        clear: function() {
            cache.clear();
        },

        delete: function(key) {
            cache.delete(key);
        }
    };
})();

// ==================== API SERVICE ====================
const ApiService = {
    BASE_URL: 'https://www.fotmob.com/api/data',
    
    getImageUrl: function(type, id) {
        return `https://images.fotmob.com/image_resources/logo/${type}logo/${id}.png`;
    },

    fetchData: async function(endpoint) {
        const cached = CacheService.get(endpoint);
        if (cached) return cached;
        
        try {
            const response = await fetch(`${this.BASE_URL}/${endpoint}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            CacheService.set(endpoint, data);
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getMatchesByDate: async function(dateString) {
        return await this.fetchData(`matches?date=${dateString}&timezone=Asia%2FBangkok&ccode3=IDN`);
    },

    getTopLeagues: async function() {
        const data = await this.fetchData('allLeagues?locale=en&ccode3=IDN');
        return data?.popular?.slice(0, 10).map(league => league.id) || [];
    },

    filterUpcomingMatches: function(leagues) {
        return leagues
            .map(league => ({
                ...league,
                matches: (league.matches || []).filter(match => {
                    const status = match.status || {};
                    return !status.started && !status.finished;
                })
            }))
            .filter(league => league.matches.length > 0);
    }
};

// ==================== LOGO UTILITIES ====================
const LogoUtils = {
    getFootballIconSVG: function(type = 'league') {
        if (type === 'league') {
            // Logo bola untuk liga (lebih besar dan detail)
            return `
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="11" stroke="#00ff88" stroke-width="1.5"/>
                    <circle cx="12" cy="12" r="3" fill="#00d4ff"/>
                    <path d="M12 1L12 23" stroke="#00ff88" stroke-width="1" stroke-dasharray="3 3"/>
                    <path d="M1 12L23 12" stroke="#00ff88" stroke-width="1" stroke-dasharray="3 3"/>
                    <path d="M4.93 4.93L19.07 19.07" stroke="#00d4ff" stroke-width="1" stroke-dasharray="3 3"/>
                    <path d="M4.93 19.07L19.07 4.93" stroke="#00d4ff" stroke-width="1" stroke-dasharray="3 3"/>
                </svg>
            `;
        } else {
            // Logo bola untuk tim (lebih sederhana)
            return `
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="9" stroke="#00ff88" stroke-width="1.2"/>
                    <circle cx="10" cy="10" r="2" fill="#00d4ff"/>
                    <path d="M10 2L10 18" stroke="#00ff88" stroke-width="0.8" stroke-dasharray="2 2"/>
                    <path d="M2 10L18 10" stroke="#00ff88" stroke-width="0.8" stroke-dasharray="2 2"/>
                </svg>
            `;
        }
    },

    createLogoElement: function(type, id, name) {
        const imageUrl = ApiService.getImageUrl(type, id);
        const svgLogo = this.getFootballIconSVG(type);
        
        return `
            <div class="logo-container">
                <img src="${imageUrl}" 
                     alt="${name}"
                     class="logo-image"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" style="display: none;">
                    ${svgLogo}
                </div>
            </div>
        `;
    }
};

// ==================== UI RENDERER ====================
const UIRenderer = {
    updateStats: function(matches, leagues, top) {
        document.getElementById('totalMatches').textContent = matches;
        document.getElementById('totalLeagues').textContent = leagues;
        document.getElementById('topCount').textContent = top;
    },

    showLoading: function() {
        const container = document.getElementById('contentContainer');
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <div class="loading-text">Loading matches...</div>
            </div>
        `;
        this.updateStats(0, 0, 0);
    },

    showEmptyState: function() {
        const container = document.getElementById('contentContainer');
        container.innerHTML = `
            <div class="empty-state fade-in">
                <div class="empty-icon">📅</div>
                <div class="empty-title">No Matches Found</div>
                <div class="empty-text">No upcoming matches for this date</div>
            </div>
        `;
        this.updateStats(0, 0, 0);
    },

    showErrorState: function() {
        const container = document.getElementById('contentContainer');
        container.innerHTML = `
            <div class="empty-state fade-in">
                <div class="empty-icon">⚠️</div>
                <div class="empty-title">Connection Error</div>
                <div class="empty-text">Please check your internet connection</div>
            </div>
        `;
        this.updateStats(0, 0, 0);
    },

    renderLeagues: function(leagues, topLeagueIds) {
        const container = document.getElementById('contentContainer');
        
        if (leagues.length === 0) {
            container.innerHTML = this.getNoMatchesHtml();
            return;
        }

        let html = '';
        leagues.forEach((league, index) => {
            html += this.renderLeagueCard(league, index, topLeagueIds.includes(league.id));
        });

        container.innerHTML = html;
    },

    getNoMatchesHtml: function() {
        return `
            <div class="empty-state fade-in" style="padding: 40px 20px;">
                <div class="empty-icon" style="font-size: 48px;">🏆</div>
                <div class="empty-title">No Matches</div>
                <div class="empty-text">Try switching tabs or select another date</div>
            </div>
        `;
    },

    renderLeagueCard: function(league, index, isTopLeague) {
        const matchesHtml = league.matches.map(match => this.renderMatchCard(match)).join('');
        const topBadge = isTopLeague ? '<span class="match-count" style="margin-right: 8px;">⭐</span>' : '';
        
        return `
            <div class="league-card fade-in" style="animation-delay: ${index * 30}ms">
                <div class="league-header" onclick="App.toggleLeague(this)">
                    <div class="league-info flex items-center gap-2 flex-1">
                        <div class="league-logo">
                            ${LogoUtils.createLogoElement('league', league.id, league.name)}
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
    },

    renderMatchCard: function(match) {
        const home = match.home || {};
        const away = match.away || {};
        const time = DateUtils.extractTime(match.time);
        
        return `
            <div class="match-card" onclick="App.goToMatch('${match.id}')">
                <div class="match-content flex items-center justify-between gap-2">
                    <div class="team flex items-center gap-2 flex-1">
                        <div class="team-logo">
                            ${LogoUtils.createLogoElement('team', home.id, home.name)}
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
                            ${LogoUtils.createLogoElement('team', away.id, away.name)}
                        </div>
                        <div class="team-info flex-1">
                            <div class="team-name">${away.name || 'Away Team'}</div>
                            <div class="team-label">Away</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    updateDateDisplay: function(date) {
        const { main, sub } = DateUtils.formatDate(date);
        document.getElementById('dateMain').textContent = main;
        document.getElementById('dateSub').textContent = sub;
    },

    renderDatePicker: function(date) {
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
        
        const today = DateUtils.getToday();
        
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
            const isToday = DateUtils.isSameDay(cellDate, today);
            const isSelected = DateUtils.isSameDay(cellDate, date);
            
            let classes = 'day-cell active';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            
            html += `<div class="${classes}" data-date="${year}-${month + 1}-${day}">${day}</div>`;
        }
        
        grid.innerHTML = html;
        overlay.classList.add('active');
        
        return overlay;
    }
};

// ==================== MAIN APP ====================
const App = {
    state: {
        currentDate: new Date(),
        topLeagueIds: [],
        currentTab: 'top',
        allLeagues: [],
        topLeagues: []
    },

    init: function() {
        this.setupEventListeners();
        this.loadMatches();
    },

    setupEventListeners: function() {
        // Date navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.changeDate(1));
        document.getElementById('dateDisplay').addEventListener('click', () => this.openDatePicker());
        
        // Date picker
        document.getElementById('closePicker').addEventListener('click', () => this.closeDatePicker());
        document.getElementById('datePickerOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeDatePicker();
        });
        
        // Tabs
        document.getElementById('topTab').addEventListener('click', () => this.switchTab('top'));
        document.getElementById('allTab').addEventListener('click', () => this.switchTab('all'));
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadMatches();
            }
        });
    },

    loadTopLeagues: async function() {
        if (this.state.topLeagueIds.length > 0) return;
        this.state.topLeagueIds = await ApiService.getTopLeagues();
    },

    loadMatches: async function() {
        UIRenderer.showLoading();
        UIRenderer.updateDateDisplay(this.state.currentDate);
        
        await this.loadTopLeagues();
        
        try {
            const dateStr = DateUtils.getDateString(this.state.currentDate);
            const data = await ApiService.getMatchesByDate(dateStr);
            
            if (!data?.leagues?.length) {
                UIRenderer.showEmptyState();
                return;
            }
            
            this.processMatches(data.leagues);
        } catch (error) {
            UIRenderer.showErrorState();
        }
    },

    processMatches: function(leagues) {
        const upcomingLeagues = ApiService.filterUpcomingMatches(leagues);
        
        if (upcomingLeagues.length === 0) {
            UIRenderer.showEmptyState();
            return;
        }

        this.state.topLeagues = upcomingLeagues.filter(league => 
            this.state.topLeagueIds.includes(league.id)
        );
        
        this.state.allLeagues = upcomingLeagues;

        const totalMatches = upcomingLeagues.reduce((sum, league) => sum + league.matches.length, 0);
        UIRenderer.updateStats(
            totalMatches, 
            upcomingLeagues.length, 
            this.state.topLeagues.length
        );

        this.renderCurrentTab();
    },

    renderCurrentTab: function() {
        const leagues = this.state.currentTab === 'top' 
            ? this.state.topLeagues 
            : this.state.allLeagues;
        
        UIRenderer.renderLeagues(leagues, this.state.topLeagueIds);
    },

    switchTab: function(tab) {
        this.state.currentTab = tab;
        
        document.getElementById('topTab').classList.toggle('active', tab === 'top');
        document.getElementById('allTab').classList.toggle('active', tab === 'all');
        
        this.renderCurrentTab();
    },

    changeDate: function(days) {
        this.state.currentDate.setDate(this.state.currentDate.getDate() + days);
        this.loadMatches();
    },

    openDatePicker: function() {
        const overlay = UIRenderer.renderDatePicker(this.state.currentDate);
        
        // Add click events to date cells
        const dateCells = overlay.querySelectorAll('.day-cell.active');
        dateCells.forEach(cell => {
            cell.addEventListener('click', function() {
                const dateStr = this.dataset.date;
                if (dateStr) {
                    const [y, m, d] = dateStr.split('-');
                    App.state.currentDate = new Date(y, m - 1, d);
                    App.closeDatePicker();
                    App.loadMatches();
                }
            });
        });
    },

    closeDatePicker: function() {
        document.getElementById('datePickerOverlay').classList.remove('active');
    },

    // Public methods
    toggleLeague: function(element) {
        const card = element.closest('.league-card');
        const matchesList = card.querySelector('.matches-list');
        const arrow = card.querySelector('.toggle-arrow');
        
        matchesList.classList.toggle('active');
        arrow.classList.toggle('active');
    },

    goToMatch: function(matchId) {
        if (matchId) {
            window.location.href = `match-detail.html?id=${matchId}`;
        }
    }
};

// ==================== INITIALIZE APP ====================
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});