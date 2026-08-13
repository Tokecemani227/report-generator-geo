/**
 * Application-level error handling.
 *
 * Maps raw MyGeotab API errors into stable categories that the UI can present
 * to the user in a friendly way while preserving technical detail for
 * debugging (PRD section 25 / SRS ERR-001..ERR-005).
 */
FRG.define('errorHandler', function () {
    'use strict';

    var CATEGORY = {
        AUTHENTICATION: 'AUTHENTICATION_ERROR',
        PERMISSION: 'PERMISSION_ERROR',
        RATE_LIMIT: 'RATE_LIMIT_ERROR',
        OVER_LIMIT: 'OVER_LIMIT_ERROR',
        NETWORK: 'NETWORK_ERROR',
        INVALID_REQUEST: 'INVALID_REQUEST',
        UNKNOWN: 'UNKNOWN_API_ERROR'
    };

    /**
     * Convert a raw MyGeotab error (string, Error or JSON-RPC error object)
     * into a normalized application error.
     */
    function fromApiError(error) {
        var rawType = '';
        var rawMessage = '';

        if (!error) {
            rawMessage = 'Unknown API error';
        } else if (typeof error === 'string') {
            rawMessage = error;
        } else if (error instanceof Error) {
            rawMessage = error.message;
        } else if (typeof error === 'object') {
            // JSON-RPC error: { code, message, data: { type } }
            rawMessage = error.message || JSON.stringify(error);
            if (error.data && error.data.type) {
                rawType = error.data.type;
            }
        }

        var category = CATEGORY.UNKNOWN;
        if (rawType === 'InvalidUserException' || rawType === 'InvalidSessionException') {
            category = CATEGORY.AUTHENTICATION;
        } else if (rawType === 'AccessDeniedException' || rawType === 'NoPermissionsException') {
            category = CATEGORY.PERMISSION;
        } else if (rawType === 'RateLimitException') {
            category = CATEGORY.RATE_LIMIT;
        } else if (rawType === 'OverLimitException') {
            category = CATEGORY.OVER_LIMIT;
        } else if (/invalid session|not logged in|authenticate|credential/i.test(rawMessage)) {
            category = CATEGORY.AUTHENTICATION;
        } else if (/permission|access denied|not allowed/i.test(rawMessage)) {
            category = CATEGORY.PERMISSION;
        } else if (/rate limit|too many|quota/i.test(rawMessage)) {
            category = CATEGORY.RATE_LIMIT;
        } else if (/results limit|over.?limit/i.test(rawMessage)) {
            category = CATEGORY.OVER_LIMIT;
        } else if (/network|failed to fetch|ECONNREFUSED|timeout|temporarily unavailable/i.test(rawMessage)) {
            category = CATEGORY.NETWORK;
        }

        var appError = new Error(rawMessage);
        appError.category = category;
        appError.rawType = rawType;
        appError.raw = error;
        return appError;
    }

    /**
     * Return a user-facing message for an application error.
     */
    function userMessage(error) {
        if (!error) {
            return 'An unknown error occurred. Please try again.';
        }
        switch (error.category) {
            case CATEGORY.AUTHENTICATION:
                return 'Your MyGeotab session has expired. Please refresh MyGeotab and try again.';
            case CATEGORY.PERMISSION:
                return 'You do not have permission to view this data. Contact your administrator.';
            case CATEGORY.RATE_LIMIT:
                return 'MyGeotab API rate limit reached. Please wait a moment and try again.';
            case CATEGORY.OVER_LIMIT:
                return 'The result set is larger than MyGeotab allows for a single request.';
            case CATEGORY.NETWORK:
                return 'Unable to reach MyGeotab. Check your connection and try again.';
            default:
                return 'Unable to retrieve fleet data. Please try again.';
        }
    }

    return {
        CATEGORY: CATEGORY,
        fromApiError: fromApiError,
        userMessage: userMessage
    };
});
