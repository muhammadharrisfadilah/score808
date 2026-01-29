// app.js
window.App = (function() {
    'use strict';
    
    const state = {
        currentDate: new Date(),
        topLeagueIds: [],
        currentTab: 'top',
        allLeagues: [],
        topLeagues: []
    };

    function init() {
        setupEventListeners();
        loadMatches();
    }

    function setupEventListeners() {
        // Date navigation
        document.getElementById('prevBtn').addEventListener('click', () => changeDate(-1));
        document.getElementById('nextBtn').addEventListener('click', () => changeDate(1));
        document.getElementById('dateDisplay').addEventListener('click', openDatePicker);
        
        // Date picker
        document.getElementById('closePicker').addEventListener('click', closeDatePicker);
        document.getElementById('datePickerOverlay').addEventListener('click', function(e) {
            if (e.target === this) closeDatePicker();
        });
        
        // Tabs
        document.getElementById('topTab').addEventListener('click', () => switchTab('top'));
        document.getElementById('allTab').addEventListener('click', () => switchTab('all'));
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                loadMatches();
            }
        });
    }

    async function loadTopLeagues() {
        if (state.topLeagueIds.length > 0) return;
        state.topLeagueIds = await window.ApiService.getTopLeagues();
    }

    async function loadMatches() {
        window.UIRenderer.showLoading();
        window.UIRenderer.updateDateDisplay(state.currentDate);
        
        await loadTopLeagues();
        
        try {
            const dateStr = window.DateUtils.getDateString(state.currentDate);
            const data = await window.ApiService.getMatchesByDate(dateStr);
            
            if (!data?.leagues?.length) {
                window.UIRenderer.showEmptyState();
                return;
            }
            
            processMatches(data.leagues);
        } catch (error) {
            window.UIRenderer.showErrorState();
        }
    }

    function processMatches(leagues) {
        const upcomingLeagues = window.ApiService.filterUpcomingMatches(leagues);
        
        if (upcomingLeagues.length === 0) {
            window.UIRenderer.showEmptyState();
            return;
        }

        state.topLeagues = upcomingLeagues.filter(league => 
            state.topLeagueIds.includes(league.id)
        );
        
        state.allLeagues = upcomingLeagues;

        const totalMatches = upcomingLeagues.reduce((sum, league) => sum + league.matches.length, 0);
        window.UIRenderer.updateStats(
            totalMatches, 
            upcomingLeagues.length, 
            state.topLeagues.length
        );

        renderCurrentTab();
    }

    function renderCurrentTab() {
        const leagues = state.currentTab === 'top' 
            ? state.topLeagues 
            : state.allLeagues;
        
        window.UIRenderer.renderLeagues(leagues, state.topLeagueIds);
    }

    function switchTab(tab) {
        state.currentTab = tab;
        
        document.getElementById('topTab').classList.toggle('active', tab === 'top');
        document.getElementById('allTab').classList.toggle('active', tab === 'all');
        
        renderCurrentTab();
    }

    function changeDate(days) {
        state.currentDate.setDate(state.currentDate.getDate() + days);
        loadMatches();
    }

    function openDatePicker() {
        const overlay = window.UIRenderer.renderDatePicker(state.currentDate);
        
        // Add click events to date cells
        const dateCells = overlay.querySelectorAll('.day-cell.active');
        dateCells.forEach(cell => {
            cell.addEventListener('click', function() {
                const dateStr = this.dataset.date;
                if (dateStr) {
                    const [y, m, d] = dateStr.split('-');
                    state.currentDate = new Date(y, m - 1, d);
                    closeDatePicker();
                    loadMatches();
                }
            });
        });
    }

    function closeDatePicker() {
        document.getElementById('datePickerOverlay').classList.remove('active');
    }

    // Public methods
    function toggleLeague(element) {
        const card = element.closest('.league-card');
        const matchesList = card.querySelector('.matches-list');
        const arrow = card.querySelector('.toggle-arrow');
        
        matchesList.classList.toggle('active');
        arrow.classList.toggle('active');
    }

    function goToMatch(matchId) {
        if (matchId) {
            window.location.href = `match-detail.html?id=${matchId}`;
        }
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);

    // Expose public methods
    return {
        init,
        toggleLeague,
        goToMatch,
        loadMatches,
        switchTab,
        changeDate,
        openDatePicker,
        closeDatePicker
    };
})();