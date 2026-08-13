/**
 * Device Online / Offline module (first implementation module).
 *
 * Data lineage (documented in the Data Mapping document, v0.1):
 *
 *   Total Devices      <- Get(Device)         (group filter via search.groups)
 *   Online / Offline   <- Get(DeviceStatusInfo) -> IsDeviceCommunicating
 *   Last Communication <- DeviceStatusInfo.DateTime
 *   Group              <- DeviceStatusInfo.Groups -> Group.name lookup
 *
 * Status classification (verified 2026-08-13; pending live DB test R-008):
 *   IsDeviceCommunicating === true  -> Online
 *   IsDeviceCommunicating === false -> Offline
 *   no DeviceStatusInfo record      -> Unknown
 *
 * Unknown devices are never coerced into Offline (data quality rule DQ-001).
 */
FRG.define('deviceStatusModule', function (FRG) {
    'use strict';

    var STATUS = {
        ONLINE: 'Online',
        OFFLINE: 'Offline',
        UNKNOWN: 'Unknown'
    };

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function groupSearch(groupIds) {
        // Empty array => "All Groups": omit the groups filter entirely.
        if (!groupIds || groupIds.length === 0) {
            return {};
        }
        return {
            groups: groupIds.map(function (id) {
                return { id: id };
            })
        };
    }

    /**
     * Fetch the raw data required by this module from the API client.
     */
    function fetch(client, scope) {
        var groupIds = (scope && scope.groupIds) || [];

        var devicesCall = client.call('Get', {
            typeName: 'Device',
            search: groupSearch(groupIds),
            propertySelector: {
                fields: ['id', 'name', 'serialNumber', 'vehicleIdentificationNumber', 'deviceType'],
                isIncluded: true
            },
            resultsLimit: 50000
        });

        var statusCall = client.call('Get', {
            typeName: 'DeviceStatusInfo',
            search: {
                deviceSearch: groupSearch(groupIds)
            },
            resultsLimit: 50000
        });

        var groupsCall = client.call('Get', {
            typeName: 'Group',
            propertySelector: {
                fields: ['id', 'name'],
                isIncluded: true
            },
            resultsLimit: 50000
        });

        return Promise.all([devicesCall, statusCall, groupsCall]).then(function (results) {
            return {
                devices: results[0] || [],
                deviceStatusInfo: results[1] || [],
                groups: results[2] || []
            };
        });
    }

    /**
     * Transform raw API data into the normalized module data model.
     */
    function process(raw, scope) {
        var devices = (raw && raw.devices) || [];
        var statusList = (raw && raw.deviceStatusInfo) || [];
        var groups = (raw && raw.groups) || [];

        var groupNameById = {};
        groups.forEach(function (group) {
            groupNameById[group.id] = group.name || group.id;
        });

        var statusByDevice = {};
        statusList.forEach(function (info) {
            if (info && info.device && info.device.id && !statusByDevice[info.device.id]) {
                statusByDevice[info.device.id] = info;
            }
        });

        var rows = devices.map(function (device) {
            var info = statusByDevice[device.id];
            var status;
            var lastCommunication;
            var groupNames = [];

            if (!info) {
                status = STATUS.UNKNOWN;
                lastCommunication = null;
            } else {
                status = info.IsDeviceCommunicating ? STATUS.ONLINE : STATUS.OFFLINE;
                lastCommunication = info.DateTime || null;
                if (Array.isArray(info.Groups)) {
                    info.Groups.forEach(function (ref) {
                        if (ref && ref.id && groupNameById[ref.id]) {
                            groupNames.push(groupNameById[ref.id]);
                        }
                    });
                }
            }

            return {
                deviceId: device.id,
                deviceName: device.name || device.id,
                serialNumber: device.serialNumber || null,
                vin: device.vehicleIdentificationNumber || null,
                deviceType: device.deviceType || null,
                status: status,
                lastCommunication: lastCommunication,
                groupNames: groupNames
            };
        });

        var online = 0;
        var offline = 0;
        var unknown = 0;

        rows.forEach(function (row) {
            if (row.status === STATUS.ONLINE) {
                online += 1;
            } else if (row.status === STATUS.OFFLINE) {
                offline += 1;
            } else {
                unknown += 1;
            }
        });

        var total = rows.length;

        return {
            moduleId: 'device-status',
            statusCounts: {
                total: total,
                online: online,
                offline: offline,
                unknown: unknown,
                onlinePercent: total > 0 ? (online / total) * 100 : null,
                offlinePercent: total > 0 ? (offline / total) * 100 : null,
                unknownPercent: total > 0 ? (unknown / total) * 100 : null
            },
            rows: rows
        };
    }

    /**
     * Render the KPI summary cards for this module.
     */
    function renderSummaryCards(data) {
        var counts = data.statusCounts;

        function pct(value) {
            return value === null || value === undefined ? 'N/A' : value.toFixed(2) + '%';
        }

        var cards = '';

        cards += '<div class="metric">' +
            '<div class="metric-label">Total Devices</div>' +
            '<div class="metric-value">' + counts.total + '</div>' +
            '<div class="metric-meta">Current report scope</div>' +
            '</div>';

        cards += '<div class="metric online">' +
            '<div class="metric-label">Online</div>' +
            '<div class="metric-value">' + counts.online + '</div>' +
            '<div class="metric-meta">' + pct(counts.onlinePercent) + ' of devices</div>' +
            '</div>';

        cards += '<div class="metric offline">' +
            '<div class="metric-label">Offline</div>' +
            '<div class="metric-value">' + counts.offline + '</div>' +
            '<div class="metric-meta">' + pct(counts.offlinePercent) + ' of devices</div>' +
            '</div>';

        cards += '<div class="metric">' +
            '<div class="metric-label">Status Unknown</div>' +
            '<div class="metric-value">' + counts.unknown + '</div>' +
            '<div class="metric-meta">Devices with no status record</div>' +
            '</div>';

        return cards;
    }

    /**
     * Render the report section for this module.
     */
    function renderSection(data, options) {
        var counts = data.statusCounts;
        var rows = data.rows;
        options = options || {};

        function pct(value) {
            return value === null || value === undefined ? 'N/A' : value.toFixed(2) + '%';
        }

        var html = '';

        html += '<div class="report-section-title">Device Online / Offline</div>';

        html += '<div class="report-kpis">';
        html += '<div class="report-kpi"><span>Total Devices</span><strong>' + counts.total + '</strong></div>';
        html += '<div class="report-kpi"><span>Online</span><strong style="color:var(--green);">' + counts.online +
            '</strong><em class="report-kpi-meta">' + pct(counts.onlinePercent) + '</em></div>';
        html += '<div class="report-kpi"><span>Offline</span><strong style="color:var(--red);">' + counts.offline +
            '</strong><em class="report-kpi-meta">' + pct(counts.offlinePercent) + '</em></div>';
        if (counts.unknown > 0) {
            html += '<div class="report-kpi"><span>Status Unknown</span><strong>' + counts.unknown +
                '</strong><em class="report-kpi-meta">' + pct(counts.unknownPercent) + '</em></div>';
        }
        html += '</div>';

        if (rows.length === 0) {
            html += '<p class="empty-note">No device data is available for the selected scope.</p>';
            return html;
        }

        html += '<table class="report-table">';
        html += '<thead><tr>';
        html += '<th>No.</th><th>Vehicle / Device</th><th>Serial Number</th><th>VIN</th><th>Status</th><th>Last Communication</th><th>Group</th>';
        html += '</tr></thead><tbody>';

        rows.forEach(function (row, index) {
            var statusClass = row.status === STATUS.ONLINE ? 'online' :
                (row.status === STATUS.OFFLINE ? 'offline' : 'unknown');

            html += '<tr>';
            html += '<td>' + (index + 1) + '</td>';
            html += '<td>' + escapeHtml(row.deviceName) + '</td>';
            html += '<td>' + escapeHtml(row.serialNumber) + '</td>';
            html += '<td>' + escapeHtml(row.vin) + '</td>';
            html += '<td><span class="status ' + statusClass + '"><span class="status-dot"></span>' +
                escapeHtml(row.status) + '</span></td>';
            html += '<td>' + escapeHtml(FRG.dateTime.formatLocal(row.lastCommunication)) + '</td>';
            html += '<td>' + escapeHtml(row.groupNames.join(', ')) + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';

        return html;
    }

    return {
        id: 'device-status',
        name: 'Device Online / Offline',
        description: 'Communication status and device availability summary.',
        version: '0.1.0',
        timeMode: 'CURRENT',
        available: true,

        getDataRequirements: function () {
            return [
                { kind: 'devices' },
                { kind: 'deviceStatusInfo' },
                { kind: 'groups' }
            ];
        },

        fetch: fetch,
        process: process,
        renderSummaryCards: renderSummaryCards,
        renderSection: renderSection
    };
});
