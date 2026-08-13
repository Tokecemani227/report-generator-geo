/**
 * Mock MyGeotab API — emulates the `api` object injected by the MyGeotab host.
 *
 * Implements the subset of behavior used by this Add-In:
 *   api.call('Get', { typeName, search, propertySelector, resultsLimit })
 *   api.call('GetCountOf', ...)
 *   api.multiCall(calls)
 *   api.getSession(callback)
 *
 * Group filtering follows the verified contract: DeviceSearch.groups accepts
 * an array of Group references. The mock resolves devices whose membership
 * intersects the requested group set.
 *
 * This file is NOT part of the Add-In and must never be deployed.
 */
(function (root) {
    'use strict';

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function hasIntersection(a, b) {
        if (!a || a.length === 0) {
            return false;
        }
        return a.some(function (id) {
            return b.indexOf(id) >= 0;
        });
    }

    function extractGroupIds(groupRefs) {
        if (!Array.isArray(groupRefs)) {
            return [];
        }
        return groupRefs.map(function (ref) {
            return ref.id;
        });
    }

    function applyPropertySelector(entity, selector) {
        if (!selector || !selector.fields) {
            return entity;
        }
        var result = {};
        if (selector.isIncluded === false) {
            // Exclude mode: copy all fields except the listed ones.
            Object.keys(entity).forEach(function (key) {
                if (selector.fields.indexOf(key) < 0) {
                    result[key] = entity[key];
                }
            });
        } else {
            selector.fields.forEach(function (field) {
                if (entity[field] !== undefined) {
                    result[field] = entity[field];
                }
            });
        }
        return result;
    }

    function getDevices(params) {
        var fixtures = root.FRG_DEV_FIXTURES;
        var search = params.search || {};
        var groupIds = extractGroupIds(search.groups);

        var devices = fixtures.devices.filter(function (device) {
            if (groupIds.length === 0) {
                return true;
            }
            return hasIntersection(fixtures.deviceGroups[device.id], groupIds);
        });

        return devices.map(function (device) {
            return applyPropertySelector(clone(device), params.propertySelector);
        });
    }

    function getGroups(params) {
        return root.FRG_DEV_FIXTURES.groups.map(function (group) {
            return applyPropertySelector(clone(group), params.propertySelector);
        });
    }

    function getDeviceStatusInfo(params) {
        var fixtures = root.FRG_DEV_FIXTURES;
        var search = params.search || {};
        var deviceSearch = search.deviceSearch || {};
        var deviceGroupIds = extractGroupIds(deviceSearch.groups);

        return fixtures.deviceStatusInfo.filter(function (info) {
            var deviceId = info.device.id;

            if (deviceSearch.id) {
                return deviceId === deviceSearch.id;
            }

            if (deviceGroupIds.length > 0) {
                var membership = fixtures.deviceGroups[deviceId] || [];
                if (!hasIntersection(membership, deviceGroupIds)) {
                    return false;
                }
            }

            if (search.includeUntrackedDevices === false) {
                // In the real API this excludes untracked/archived devices.
                // The mock dataset has none, so this is a no-op.
            }

            return true;
        }).map(clone);
    }

    function getCountOf(params) {
        var typeName = params.typeName;
        if (typeName === 'Device') {
            return getDevices(params).length;
        }
        if (typeName === 'DeviceStatusInfo') {
            return getDeviceStatusInfo(params).length;
        }
        throw { message: 'Unsupported GetCountOf typeName: ' + typeName };
    }

    function dispatch(method, params) {
        if (method === 'Get') {
            switch (params.typeName) {
                case 'Device':
                    return getDevices(params);
                case 'Group':
                    return getGroups(params);
                case 'DeviceStatusInfo':
                    return getDeviceStatusInfo(params);
                default:
                    throw { message: 'Mock does not support Get for typeName: ' + params.typeName };
            }
        }
        if (method === 'GetCountOf') {
            return getCountOf(params);
        }
        throw { message: 'Mock does not support method: ' + method };
    }

    function run(params, callback, errorCallback) {
        // Simulate a small asynchronous network delay.
        setTimeout(function () {
            try {
                callback(clone(dispatch(params.method, params.params || {})));
            } catch (e) {
                errorCallback(e && e.message ? e.message : String(e));
            }
        }, 30);
    }

    root.FRG_DEV_MOCK_API = {
        call: function (method, params, callback, errorCallback) {
            run({ method: method, params: params }, callback, errorCallback);
        },

        multiCall: function (calls, callback, errorCallback) {
            var results = [];
            var index = 0;

            function next() {
                if (index >= calls.length) {
                    callback(results);
                    return;
                }
                var entry = calls[index];
                run({ method: entry[0], params: entry[1] }, function (result) {
                    results.push(result);
                    index += 1;
                    next();
                }, function (error) {
                    errorCallback(error);
                });
            }

            next();
        },

        getSession: function (callback) {
            setTimeout(function () {
                callback({
                    database: 'demo',
                    userName: 'demo@example.com',
                    sessionId: 'mock-session'
                });
            }, 10);
        }
    };
})(typeof window !== 'undefined' ? window : this);
