/**
 * Report controller — orchestrates selected KPI modules into a report model.
 *
 * Responsibilities:
 *   1. Resolve the report scope (group ids, report date, selected modules).
 *   2. Fetch + process each selected module through the registry.
 *   3. Build a normalized report model (metadata + scope + sections) that is
 *      independent of raw MyGeotab API shapes (SRS section 17).
 *   4. Report errors per-module so one failing module does not discard the
 *      sections that succeeded.
 *
 * This module is pure (no DOM) so it can be unit tested in Node.
 */
FRG.define('reportController', function (FRG) {
    'use strict';

    /**
     * @param {object} options
     * @param {object} options.client - apiClient instance.
     * @param {object} options.registry - module registry.
     */
    function create(options) {
        var client = options.client;
        var registry = options.registry;

        /**
         * Build the report model for the given scope and module ids.
         *
         * @param {object} scope - { groupIds, groupNames, reportDate }
         * @param {string[]} moduleIds - selected module ids.
         * @returns {Promise<object>} report model.
         */
        function generate(scope, moduleIds) {
            var selectedModules = moduleIds
                .map(registry.get)
                .filter(Boolean);

            if (selectedModules.length === 0) {
                return Promise.resolve(buildEmptyReport(scope));
            }

            var sectionPromises = selectedModules.map(function (module) {
                return runModule(module, scope);
            });

            return Promise.all(sectionPromises).then(function (sections) {
                var successful = sections.filter(function (section) {
                    return section.status === 'ok';
                });

                return {
                    metadata: {
                        reportName: 'Fleet Monitoring Report',
                        generatedAt: FRG.dateTime.nowIso(),
                        reportDate: scope.reportDate || null,
                        databaseLabel: 'Current MyGeotab Database Context',
                        scopeLabel: scope.label || 'All Groups',
                        moduleCount: successful.length
                    },
                    scope: {
                        groupIds: scope.groupIds || [],
                        groupNames: scope.groupNames || [],
                        reportDate: scope.reportDate || null
                    },
                    sections: sections
                };
            });
        }

        function runModule(module, scope) {
            var startedAt = Date.now();

            return Promise.resolve()
                .then(function () {
                    return module.fetch(client, scope);
                })
                .then(function (raw) {
                    var data = module.process(raw, scope);
                    return {
                        moduleId: module.id,
                        title: module.name,
                        timeMode: module.timeMode,
                        status: 'ok',
                        durationMs: Date.now() - startedAt,
                        data: data
                    };
                })
                .catch(function (error) {
                    return {
                        moduleId: module.id,
                        title: module.name,
                        status: 'error',
                        durationMs: Date.now() - startedAt,
                        error: error
                    };
                });
        }

        function buildEmptyReport(scope) {
            return {
                metadata: {
                    reportName: 'Fleet Monitoring Report',
                    generatedAt: FRG.dateTime.nowIso(),
                    reportDate: scope.reportDate || null,
                    databaseLabel: 'Current MyGeotab Database Context',
                    scopeLabel: scope.label || 'All Groups',
                    moduleCount: 0
                },
                scope: {
                    groupIds: scope.groupIds || [],
                    groupNames: scope.groupNames || [],
                    reportDate: scope.reportDate || null
                },
                sections: []
            };
        }

        return {
            generate: generate
        };
    }

    return {
        create: create
    };
});
