/**
 * Report module registry (ADR-002 — Modular KPI Architecture).
 *
 * Each KPI is an independent module with its own data requirements,
 * retrieval, processing and rendering. Adding a new KPI means registering a
 * new module here; no existing module needs to change.
 */
FRG.define('registry', function () {
    'use strict';

    var modules = {};

    function register(module) {
        if (!module || !module.id || !module.name) {
            throw new Error('registry: every module requires an id and a name.');
        }
        if (typeof module.fetch !== 'function' ||
            typeof module.process !== 'function' ||
            typeof module.renderSection !== 'function') {
            throw new Error('registry: module "' + module.id + '" must implement fetch, process and renderSection.');
        }
        // Re-registration is allowed (Add-In initialize can run more than once).
        modules[module.id] = module;
        return module;
    }

    function get(id) {
        return modules[id] || null;
    }

    function all() {
        return Object.keys(modules).map(function (key) {
            return modules[key];
        });
    }

    function selectable() {
        return all().filter(function (module) {
            return module.available !== false;
        });
    }

    return {
        register: register,
        get: get,
        all: all,
        selectable: selectable
    };
});
