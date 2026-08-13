/**
 * FRG Base — Fleet Report Generator module loader.
 *
 * Defines a small global namespace `FRG` and a dependency-ordered loader
 * (`FRG.define`) so modules can be loaded with plain <script> tags in the
 * browser and still be exercised from Node for unit tests.
 */
(function (root) {
    'use strict';

    if (root.FRG) {
        return;
    }

    root.FRG = {};

    var modules = {};

    /**
     * Register a module factory. The factory receives the shared FRG namespace
     * so it can depend on other FRG modules that have already been loaded.
     *
     * @param {string} name - module name (also the key on FRG)
     * @param {function(FRG): *} factory - module factory
     */
    root.FRG.define = function (name, factory) {
        modules[name] = factory(root.FRG);
        root.FRG[name] = modules[name];
    };

    root.FRG.VERSION = '0.1.0';
    root.FRG.PRODUCT = 'Fleet Report Generator';

    root.FRG.environment = function () {
        return {
            hasGeotabHost: typeof window !== 'undefined' &&
                window.geotab && window.geotab.addin,
            hasDOM: typeof document !== 'undefined' && !!document.createElement,
            node: typeof process !== 'undefined' && !!process.versions && !!process.versions.node
        };
    };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
