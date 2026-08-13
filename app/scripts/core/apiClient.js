/**
 * API client — Promise-based wrapper around the MyGeotab `api` object.
 *
 * The MyGeotab host injects an authenticated `api` object into the Add-In
 * lifecycle methods. It exposes callback-based `call`, `multiCall` and
 * `getSession`. This wrapper normalizes those into Promises and maps API
 * errors into application-level error categories (see errorHandler).
 *
 * In development the same interface is provided by dev/mock/mockApi.js, so the
 * rest of the application never needs to know whether it talks to the real
 * MyGeotab API or the mock.
 */
FRG.define('apiClient', function (FRG) {
    'use strict';

    /**
     * @param {object} api - the MyGeotab `api` object injected by the host.
     * @returns {object} Promise-based client with call/multiCall/getSession.
     */
    function create(api) {
        if (!api || typeof api.call !== 'function') {
            throw new Error('apiClient: a valid Geotab api object is required.');
        }

        function call(method, params) {
            return new Promise(function (resolve, reject) {
                api.call(method, params, function (result) {
                    resolve(result);
                }, function (error) {
                    reject(FRG.errorHandler.fromApiError(error));
                });
            });
        }

        function multiCall(calls) {
            return new Promise(function (resolve, reject) {
                if (typeof api.multiCall !== 'function') {
                    reject(new Error('apiClient: multiCall is not supported by this api object.'));
                    return;
                }
                api.multiCall(calls, function (result) {
                    resolve(result);
                }, function (error) {
                    reject(FRG.errorHandler.fromApiError(error));
                });
            });
        }

        function getSession() {
            return new Promise(function (resolve, reject) {
                if (typeof api.getSession !== 'function') {
                    resolve(null);
                    return;
                }
                api.getSession(function (session) {
                    resolve(session);
                }, function (error) {
                    reject(FRG.errorHandler.fromApiError(error));
                });
            });
        }

        return {
            call: call,
            multiCall: multiCall,
            getSession: getSession
        };
    }

    return {
        create: create
    };
});
