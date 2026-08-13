/**
 * Unit tests — API client wrapper + error mapping.
 */
'use strict';

const h = require('./harness.js');
const { test, assert, assertEqual, assertDeepEqual, FRG } = h;

test('apiClient.call resolves with the API result', function () {
    const client = FRG.apiClient.create(h.mockApi);

    return client.call('Get', { typeName: 'Group' }).then(function (result) {
        assertEqual(result.length, 4, 'groups returned');
    });
});

test('apiClient.call rejects with a categorized error', function () {
    const badApi = {
        call: function (method, params, cb, errCb) {
            errCb({
                code: -32000,
                message: 'Incorrect login credentials',
                data: { type: 'InvalidUserException' }
            });
        }
    };

    const client = FRG.apiClient.create(badApi);

    return client.call('Get', { typeName: 'Device' }).then(function () {
        throw new Error('Expected rejection, but the call resolved.');
    }, function (error) {
        assertEqual(error.category, FRG.errorHandler.CATEGORY.AUTHENTICATION);
        assertEqual(error.rawType, 'InvalidUserException');
    });
});

test('apiClient.multiCall resolves results in order', function () {
    const client = FRG.apiClient.create(h.mockApi);

    return client.multiCall([
        ['Get', { typeName: 'Group' }],
        ['GetCountOf', { typeName: 'Device' }]
    ]).then(function (results) {
        assertEqual(results.length, 2);
        assertEqual(results[0].length, 4, 'first call = groups');
        assertEqual(results[1], 8, 'second call = device count');
    });
});

test('errorHandler maps known exception types to categories', function () {
    assertEqual(
        FRG.errorHandler.fromApiError({ data: { type: 'OverLimitException' }, message: 'x' }).category,
        FRG.errorHandler.CATEGORY.OVER_LIMIT
    );
    assertEqual(
        FRG.errorHandler.fromApiError({ data: { type: 'AccessDeniedException' }, message: 'x' }).category,
        FRG.errorHandler.CATEGORY.PERMISSION
    );
    assertEqual(
        FRG.errorHandler.fromApiError({ data: { type: 'RateLimitException' }, message: 'x' }).category,
        FRG.errorHandler.CATEGORY.RATE_LIMIT
    );
    assertEqual(
        FRG.errorHandler.fromApiError({ message: 'something odd' }).category,
        FRG.errorHandler.CATEGORY.UNKNOWN
    );
});

test('errorHandler.userMessage returns friendly text per category', function () {
    const error = FRG.errorHandler.fromApiError({ data: { type: 'InvalidUserException' }, message: 'bad' });
    const message = FRG.errorHandler.userMessage(error);
    assert(message.indexOf('session') >= 0, 'auth message is user-friendly');
});

test('apiClient requires a valid api object', function () {
    let threw = false;
    try {
        FRG.apiClient.create(null);
    } catch (e) {
        threw = true;
    }
    assert(threw, 'create(null) throws');
});
