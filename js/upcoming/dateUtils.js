// dateUtils.js
window.DateUtils = (function() {
    'use strict';

    function formatDate(date) {
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
    }

    function getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    function getToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    function extractTime(timeString) {
        if (!timeString) return 'TBD';
        const parts = timeString.split(' ');
        return parts.length > 1 ? parts[1].substring(0, 5) : timeString;
    }

    return {
        formatDate,
        getDateString,
        isSameDay,
        getToday,
        extractTime
    };
})();