/**
 * Test harness — loads the app modules and mock API into a Node global
 * sandbox, and exposes a tiny assertion + registration API for test files.
 *
 * The app modules are plain browser scripts that attach to a global `FRG`
 * namespace. Setting `global.window = global` makes them attach to Node's
 * global object, mirroring how the browser resolves them.
 */
'use strict';

global.window = global;
global.self = global;

require('../app/scripts/core/frgBase.js');
require('../app/scripts/core/dateTime.js');
require('../app/scripts/core/errorHandler.js');
require('../app/scripts/core/apiClient.js');
require('../app/scripts/modules/registry.js');
require('../app/scripts/modules/deviceStatus/deviceStatusModule.js');
require('../app/scripts/core/reportController.js');
require('../app/scripts/render/reportRenderer.js');

require('../dev/mock/fixtures.js');
require('../dev/mock/mockApi.js');
require('../dev/mock/mockState.js');

const tests = [];

function test(name, fn) {
    tests.push({ name: name, fn: fn });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error((message || 'Values are not equal') +
            ' — expected [' + expected + '], got [' + actual + ']');
    }
}

function assertDeepEqual(actual, expected, message) {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) {
        throw new Error((message || 'Objects are not deep equal') +
            '\n  expected: ' + b + '\n  actual:   ' + a);
    }
}

function runAll() {
    let passed = 0;
    const failures = [];
    const queue = tests.slice();

    function runNext() {
        if (queue.length === 0) {
            finish();
            return;
        }

        const entry = queue.shift();
        let promise;

        try {
            promise = Promise.resolve(entry.fn());
        } catch (error) {
            failures.push({ name: entry.name, error: error });
            console.log('  FAIL  ' + entry.name);
            console.log('        ' + (error && error.message ? error.message : error));
            runNext();
            return;
        }

        promise.then(function () {
            passed += 1;
            console.log('  PASS  ' + entry.name);
            runNext();
        }, function (error) {
            failures.push({ name: entry.name, error: error });
            console.log('  FAIL  ' + entry.name);
            console.log('        ' + (error && error.message ? error.message : error));
            runNext();
        });
    }

    function finish() {
        console.log('');
        console.log(passed + ' passed, ' + failures.length + ' failed, ' + tests.length + ' total');
        if (failures.length > 0) {
            process.exitCode = 1;
        }
    }

    runNext();
}

module.exports = {
    test: test,
    assert: assert,
    assertEqual: assertEqual,
    assertDeepEqual: assertDeepEqual,
    FRG: global.FRG,
    fixtures: global.FRG_DEV_FIXTURES,
    mockApi: global.FRG_DEV_MOCK_API,
    mockState: global.FRG_DEV_MOCK_STATE,
    runAll: runAll
};
