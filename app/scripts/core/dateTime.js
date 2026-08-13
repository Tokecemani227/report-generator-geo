/**
 * Centralized date/time utilities.
 *
 * MyGeotab API dates are exchanged as ISO 8601 strings in UTC. This module is
 * the single place where report timestamps are formatted so individual KPI
 * modules never implement their own timezone logic (SRS DT-001).
 */
FRG.define('dateTime', function () {
    'use strict';

    function isValidDate(value) {
        if (value === null || value === undefined || value === '') {
            return false;
        }
        var date = value instanceof Date ? value : new Date(value);
        return !isNaN(date.getTime());
    }

    /**
     * Parse an ISO 8601 UTC string (or Date) into a Date object.
     * Invalid input returns null (never throws).
     */
    function parseUtc(value) {
        if (!isValidDate(value)) {
            return null;
        }
        return value instanceof Date ? new Date(value.getTime()) : new Date(value);
    }

    /**
     * Format a Date for display using the browser's local timezone.
     * `undefined`/invalid input renders as N/A per data quality rule DQ-001
     * (missing data is never silently converted to a fabricated value).
     */
    function formatLocal(value, options) {
        var date = parseUtc(value);
        if (!date) {
            return 'N/A';
        }
        options = options || {};
        try {
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: options.month || 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: options.second ? '2-digit' : undefined
            });
        } catch (e) {
            return date.toString();
        }
    }

    /**
     * Format a date-only value (yyyy-MM-dd) for display.
     */
    function formatDateOnly(value, options) {
        var date = parseUtc(value);
        if (!date) {
            return 'N/A';
        }
        options = options || {};
        try {
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: options.month || 'long',
                day: 'numeric'
            });
        } catch (e) {
            return date.toString();
        }
    }

    /**
     * Return the current timestamp in ISO 8601 UTC.
     */
    function nowIso() {
        return new Date().toISOString();
    }

    return {
        isValidDate: isValidDate,
        parseUtc: parseUtc,
        formatLocal: formatLocal,
        formatDateOnly: formatDateOnly,
        nowIso: nowIso
    };
});
