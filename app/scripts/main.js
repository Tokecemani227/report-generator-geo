/**
 * Add-In entry point.
 *
 * Registers `geotab.addin.fleetReportGenerator` (verified lifecycle contract:
 * initialize/focus/blur). The host injects the authenticated `api` object and
 * the `state` object, which operate within the active MyGeotab database
 * context — no database selector is needed (ADR-001).
 *
 * For local development the same factory is reused by dev/bootstrap.js with a
 * mock api/state object.
 */
(function (root) {
    'use strict';

    var moduleId = 'fleetReportGenerator';

    function createAddIn() {
        var api = null;
        var state = null;
        var container = null;
        var ui = null;

        function boot() {
            container = document.getElementById(moduleId);
            if (!container) {
                throw new Error('Fleet Report Generator: container #' + moduleId + ' not found.');
            }

            var client = FRG.apiClient.create(api);

            var controller = FRG.reportController.create({
                client: client,
                registry: FRG.registry
            });

            ui = FRG.uiBuilder.create(container, {
                client: client,
                registry: FRG.registry,
                controller: controller,
                renderer: FRG.reportRenderer,
                state: state
            });

            ui.render();
        }

        return {
            /**
             * Called once when the Add-In page is first loaded.
             */
            initialize: function (freshApi, freshState, callback) {
                api = freshApi;
                state = freshState;
                FRG.registry.register(FRG.deviceStatusModule);
                boot();
                callback();
            },

            /**
             * Called after the UI has loaded and whenever the global
             * organization filter changes. The builder re-applies the active
             * group filter as the default report scope.
             */
            focus: function (freshApi, freshState) {
                api = freshApi;
                state = freshState;
            },

            /**
             * Called when the user navigates away from the Add-In.
             */
            blur: function () {
                // v0.1 keeps no unsaved state; nothing to commit.
            }
        };
    }

    root.FRG.addinFactory = createAddIn;

    if (root.geotab && root.geotab.addin) {
        root.geotab.addin[moduleId] = createAddIn;
    }
})(typeof window !== 'undefined' ? window : this);
