/**
 * Unit tests — report controller (module orchestration, error isolation).
 */
'use strict';

const h = require('./harness.js');
const { test, assert, assertEqual, FRG } = h;

const registry = FRG.registry;

function createController(mockApi) {
    const client = FRG.apiClient.create(mockApi);
    return FRG.reportController.create({ client: client, registry: registry });
}

test('generate builds a report model with metadata, scope and sections', function () {
    registry.register(FRG.deviceStatusModule);

    const controller = createController(h.mockApi);

    return controller.generate(
        { groupIds: ['g-fleet'], groupNames: ['Fleet Operations'], reportDate: '2026-08-13', label: 'Fleet Operations' },
        ['device-status']
    ).then(function (report) {
        assertEqual(report.metadata.reportName, 'Fleet Monitoring Report');
        assertEqual(report.metadata.databaseLabel, 'Current MyGeotab Database Context');
        assertEqual(report.scope.groupIds.length, 1);
        assertEqual(report.sections.length, 1);
        assertEqual(report.sections[0].status, 'ok');
        assertEqual(report.sections[0].moduleId, 'device-status');
        assertEqual(report.sections[0].data.statusCounts.total, 4, 'Fleet Operations has 4 devices');
        assertEqual(report.sections[0].data.statusCounts.online, 3);
        assertEqual(report.sections[0].data.statusCounts.offline, 1);
    });
});

test('generate with no modules returns an empty report', function () {
    const controller = createController(h.mockApi);

    return controller.generate(
        { groupIds: [], groupNames: [], reportDate: null },
        []
    ).then(function (report) {
        assertEqual(report.sections.length, 0);
        assertEqual(report.metadata.moduleCount, 0);
    });
});

test('a failing module is reported as an error section, not a crash', function () {
    registry.register(FRG.deviceStatusModule);

    const failingApi = {
        call: function (method, params, cb, errCb) {
            errCb('Network request failed');
        },
        multiCall: function (calls, cb, errCb) {
            errCb('Network request failed');
        },
        getSession: function () {}
    };

    const controller = createController(failingApi);

    return controller.generate(
        { groupIds: [], groupNames: [], reportDate: null },
        ['device-status']
    ).then(function (report) {
        assertEqual(report.sections.length, 1);
        assertEqual(report.sections[0].status, 'error');
        assert(report.sections[0].error, 'error object captured');
        assertEqual(report.sections[0].error.category, FRG.errorHandler.CATEGORY.NETWORK);
        assertEqual(report.metadata.moduleCount, 0, 'failed module not counted as ok');
    });
});

test('unknown module ids are ignored', function () {
    const controller = createController(h.mockApi);

    return controller.generate(
        { groupIds: [], groupNames: [], reportDate: null },
        ['does-not-exist']
    ).then(function (report) {
        assertEqual(report.sections.length, 0);
    });
});
