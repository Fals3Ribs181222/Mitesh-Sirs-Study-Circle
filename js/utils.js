// Shared UI and Formatting Utilities

/**
 * Formats a 24-hour time string (e.g., "14:30") into a 12-hour format with AM/PM
 * @param {string} timeStr - The time string in HH:MM format
 * @returns {string} The formatted time string
 */
function formatTime(timeStr) {
    if (!timeStr) return '';
    try {
        const [hourString, minute] = timeStr.split(':');
        const hour = parseInt(hourString);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12; // Convert 0 to 12
        return `${formattedHour}:${minute} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
}

/**
 * Shows a browser confirmation dialog
 * @param {string} title - The action title (for context)
 * @param {string} message - The message to display to the user
 * @param {function} onConfirm - Callback if the user confirms
 */
function showConfirmModal(title, message, onConfirm) {
    if (confirm(`${title}\n\n${message}`)) {
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    }
}

// Expose utilities globally
window.formatTime = formatTime;
window.showConfirmModal = showConfirmModal;
