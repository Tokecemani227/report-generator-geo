/**
 * Dev bootstrap — starts the Add-In inside a standalone page using the mock
 * api/state objects. In production, MyGeotab's host framework calls
 * `geotab.addin.fleetReportGenerator` itself; this file is dev-only.
 */
(function (root) {
    'use strict';

    var addin = root.FRG.addinFactory();
    var api = root.FRG_DEV_MOCK_API;
    var state = root.FRG_DEV_MOCK_STATE;

    addin.initialize(api, state, function () {
        addin.focus(api, state);
    });
})(typeof window !== 'undefined' ? window : this);
