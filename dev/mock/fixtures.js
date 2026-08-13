/**
 * Mock fixtures — sample MyGeotab entities used only by the local dev
 * environment. These mimic the verified entity shapes:
 *   Device            { id, name, serialNumber, deviceType, vehicleIdentificationNumber }
 *   Group             { id, name, children }
 *   DeviceStatusInfo  { device, DateTime, IsDeviceCommunicating, IsDriving, Groups, ... }
 *
 * This file is NOT part of the Add-In and must never be deployed.
 */
(function (root) {
    'use strict';

    root.FRG_DEV_FIXTURES = {
        groups: [
            { id: 'CompanyGroupId', name: 'Company Group', children: [] },
            { id: 'g-fleet', name: 'Fleet Operations', children: [] },
            { id: 'g-delivery', name: 'Delivery', children: [] },
            { id: 'g-mgmt', name: 'Management', children: [] }
        ],

        // device -> group membership used to emulate search.groups filtering.
        deviceGroups: {
            'd-001': ['g-fleet'],
            'd-002': ['g-fleet'],
            'd-003': ['g-delivery'],
            'd-004': ['g-mgmt'],
            'd-005': ['g-delivery', 'g-fleet'],
            'd-006': ['g-fleet'],
            'd-007': ['g-delivery'],
            'd-008': ['g-mgmt']
        },

        devices: [
            { id: 'd-001', name: 'B 1234 ABC', serialNumber: 'GTA9000000001', deviceType: 'GO9', vehicleIdentificationNumber: 'MHYAA8230H0011111' },
            { id: 'd-002', name: 'B 5678 XYZ', serialNumber: 'GTA9000000002', deviceType: 'GO9', vehicleIdentificationNumber: 'MHYAA8230H0011112' },
            { id: 'd-003', name: 'B 9012 DEF', serialNumber: 'GTA9000000003', deviceType: 'GO6', vehicleIdentificationNumber: 'MHYAA8230H0011113' },
            { id: 'd-004', name: 'B 3456 GHI', serialNumber: 'GTA9000000004', deviceType: 'GO6', vehicleIdentificationNumber: 'MHYAA8230H0011114' },
            { id: 'd-005', name: 'B 7890 JKL', serialNumber: 'GTA9000000005', deviceType: 'GO9', vehicleIdentificationNumber: 'MHYAA8230H0011115' },
            { id: 'd-006', name: 'B 2345 MNO', serialNumber: 'GTA9000000006', deviceType: 'GO9', vehicleIdentificationNumber: 'MHYAA8230H0011116' },
            { id: 'd-007', name: 'B 6789 PQR', serialNumber: 'GTA9000000007', deviceType: 'GO6', vehicleIdentificationNumber: 'MHYAA8230H0011117' },
            { id: 'd-008', name: 'B 0123 STU', serialNumber: 'GTA9000000008', deviceType: 'GO6', vehicleIdentificationNumber: 'MHYAA8230H0011118' }
        ],

        // NOTE: d-007 has no DeviceStatusInfo record at all, so it must be
        // classified as Unknown (data quality rule DQ-001: never fabricate).
        deviceStatusInfo: [
            { device: { id: 'd-001' }, DateTime: '2026-08-13T11:41:52.000Z', IsDeviceCommunicating: true, IsDriving: true, Speed: 42, Latitude: -6.2088, Longitude: 106.8456, Groups: [{ id: 'g-fleet' }] },
            { device: { id: 'd-002' }, DateTime: '2026-08-13T11:41:36.000Z', IsDeviceCommunicating: true, IsDriving: false, Speed: 0, Latitude: -6.2110, Longitude: 106.8520, Groups: [{ id: 'g-fleet' }] },
            { device: { id: 'd-003' }, DateTime: '2026-08-13T08:27:10.000Z', IsDeviceCommunicating: false, IsDriving: false, Speed: 0, Latitude: -6.2150, Longitude: 106.8330, Groups: [{ id: 'g-delivery' }] },
            { device: { id: 'd-004' }, DateTime: '2026-08-13T11:40:58.000Z', IsDeviceCommunicating: true, IsDriving: false, Speed: 0, Latitude: -6.2000, Longitude: 106.8600, Groups: [{ id: 'g-mgmt' }] },
            { device: { id: 'd-005' }, DateTime: '2026-08-13T11:38:05.000Z', IsDeviceCommunicating: true, IsDriving: true, Speed: 61, Latitude: -6.2190, Longitude: 106.8400, Groups: [{ id: 'g-delivery' }, { id: 'g-fleet' }] },
            { device: { id: 'd-006' }, DateTime: '2026-08-13T02:15:44.000Z', IsDeviceCommunicating: false, IsDriving: false, Speed: 0, Latitude: -6.2088, Longitude: 106.8456, Groups: [{ id: 'g-fleet' }] },
            { device: { id: 'd-008' }, DateTime: '2026-08-13T11:42:11.000Z', IsDeviceCommunicating: true, IsDriving: true, Speed: 55, Latitude: -6.2050, Longitude: 106.8480, Groups: [{ id: 'g-mgmt' }] }
        ]
    };
})(typeof window !== 'undefined' ? window : this);
