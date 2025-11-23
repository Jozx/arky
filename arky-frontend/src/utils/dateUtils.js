/**
 * Formats a date string or Date object to 'DD/MM/YYYY' format.
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Invalid date

    return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};
