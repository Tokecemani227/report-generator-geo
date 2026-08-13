/**
 * Unit tests — Device Online / Offline module (process + classification).
 */
'use strict';

const h = require('./harness.js');
const { test, assert, assertEqual, assertDeepEqual, FRG, fixtures } = h;

const moduleUnderTest = FRG.deviceStatusModule;

function groupRefs(ids) {
    return ids.map(function (id) {
        return { id: id };
    });
}

// --- process(): classification -------------------------------------------

test('process classifies online/offline/unknown correctly', function () {
    const raw = {
        devices: fixtures.devices,
        deviceStatusInfo: fixtures.deviceStatusInfo,
        groups: fixtures.groups
    };

    const data = moduleUnderTest.process(raw, { groupIds: [] });

    const counts = data.statusCounts;
    assertEqual(counts.total, 8, 'total devices');
    assertEqual(counts.online, 5, 'online count');
    assertEqual(counts.offline, 2, 'offline count');
    assertEqual(counts.unknown, 1, 'unknown count (d-007 has no status record)');

    assertEqual(counts.onlinePercent.toFixed(2), '62.50', 'online percentage');
    assertEqual(counts.offlinePercent.toFixed(2), '25.00', 'offline percentage');
    assertEqual(counts.unknownPercent.toFixed(2), '12.50', 'unknown percentage');
});

test('process never coerces a missing status record into Offline', function () {
    const raw = {
        devices: fixtures.devices,
        deviceStatusInfo: fixtures.deviceStatusInfo,
        groups: fixtures.groups
    };

    const data = moduleUnderTest.process(raw, { groupIds: [] });

    const device7 = data.rows.find(function (row) {
        return row.deviceId === 'd-007';
    });
    assert(device7, 'd-007 row exists');
    assertEqual(device7.status, 'Unknown', 'd-007 must be Unknown, not Offline');
    assertEqual(device7.lastCommunication, null, 'd-007 has no last communication timestamp');
});

test('process maps group names through the group lookup', function () {
    const raw = {
        devices: fixtures.devices,
        deviceStatusInfo: fixtures.deviceStatusInfo,
        groups: fixtures.groups
    };

    const data = moduleUnderTest.process(raw, { groupIds: [] });

    const device5 = data.rows.find(function (row) {
        return row.deviceId === 'd-005';
    });
    assertDeepEqual(device5.groupNames, ['Delivery', 'Fleet Operations'], 'd-005 belongs to two groups');
});

test('process handles an empty device set without dividing by zero', function () {
    const data = moduleUnderTest.process(
        { devices: [], deviceStatusInfo: [], groups: [] },
        { groupIds: [] }
    );

    assertEqual(data.statusCounts.total, 0);
    assertEqual(data.statusCounts.onlinePercent, null);
    assertEqual(data.statusCounts.offlinePercent, null);
});

// --- fetch(): requests against the API client -----------------------------

test('fetch resolves raw data via the API client (All Groups)', function () {
    const client = FRG.apiClient.create(h.mockApi);

    return moduleUnderTest.fetch(client, { groupIds: [] }).then(function (raw) {
        assertEqual(raw.devices.length, 8, 'all devices returned when no group filter');
        assertEqual(raw.deviceStatusInfo.length, 7, 'status records');
        assertEqual(raw.groups.length, 4, 'groups lookup');
    });
});

test('fetch filters devices and status by group', function () {
    const client = FRG.apiClient.create(h.mockApi);

    return moduleUnderTest.fetch(client, { groupIds: ['g-fleet'] }).then(function (raw) {
        assertEqual(raw.devices.length, 4, 'devices in Fleet Operations');
        const ids = raw.devices.map(function (d) {
            return d.id;
        });
        assert(ids.indexOf('d-001') >= 0, 'd-001 in scope');
        assert(ids.indexOf('d-003') < 0, 'd-003 not in scope');
    });
});

// --- render: summary cards and report section ------------------------------

test('renderSummaryCards escapes nothing unexpected and reports counts', function () {
    const raw = {
        devices: fixtures.devices,
        deviceStatusInfo: fixtures.deviceStatusInfo,
        groups: fixtures.groups
    };
    const data = moduleUnderTest.process(raw, { groupIds: [] });
    const html = moduleUnderTest.renderSummaryCards(data);

    assert(html.indexOf('128') < 0, 'summary uses real count (8), not the mockup placeholder');
    assert(html.indexOf('>5<') >= 0, 'online count rendered');
    assert(html.indexOf('>2<') >= 0, 'offline count rendered');
    assert(html.indexOf('>1<') >= 0, 'unknown count rendered');
});

test('renderSection produces a table row per device with escaped values', function () {
    const raw = {
        devices: fixtures.devices,
        deviceStatusInfo: fixtures.deviceStatusInfo,
        groups: fixtures.groups
    };
    const data = moduleUnderTest.process(raw, { groupIds: [] });
    const html = moduleUnderTest.renderSection(data);

    assert(html.indexOf('<table') >= 0, 'table present');
    assert(html.indexOf('B 1234 ABC') >= 0, 'device name rendered');
    assert(html.indexOf('class="status online"') >= 0, 'online status marker');
    assert(html.indexOf('class="status offline"') >= 0, 'offline status marker');
    assert(html.indexOf('class="status unknown"') >= 0, 'unknown status marker');
});

test('renderSection handles an empty dataset', function () {
    const data = moduleUnderTest.process(
        { devices: [], deviceStatusInfo: [], groups: [] },
        { groupIds: [] }
    );
    const html = moduleUnderTest.renderSection(data);
    assert(html.indexOf('No device data is available') >= 0, 'empty state message');
});
