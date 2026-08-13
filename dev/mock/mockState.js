/**
 * Mock MyGeotab page state — emulates the `state` object available to
 * Add-Ins. Only the methods used by the Report Builder are implemented.
 *
 * getGroupFilter() returns the ids of the groups selected in the MyGeotab
 * global organization filter (verified behavior). In dev mode we default to
 * no filter ("All Groups").
 *
 * This file is NOT part of the Add-In and must never be deployed.
 */
(function (root) {
    'use strict';

    var selectedGroupFilter = []; // e.g. ['g-fleet']

    root.FRG_DEV_MOCK_STATE = {
        getGroupFilter: function () {
            return selectedGroupFilter.slice();
        },

        setGroupFilter: function (ids) {
            selectedGroupFilter = (ids || []).slice();
        },

        getState: function () {
            return {};
        },

        setState: function () {
            // no-op
        },

        gotoPage: function () {
            // no-op
        },

        hasAccessToPage: function () {
            return true;
        },

        translate: function (text) {
            return text;
        }
    };
})(typeof window !== 'undefined' ? window : this);
