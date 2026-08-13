/**
 * Test runner — loads the harness and all test files, then runs them.
 *
 * Usage: npm test  (or: node test/runTests.js)
 */
'use strict';

const harness = require('./harness.js');

require('./apiClient.test.js');
require('./deviceStatusModule.test.js');
require('./reportController.test.js');
require('./reportRenderer.test.js');

harness.runAll();
