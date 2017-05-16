/*
 * A simple unit testing framework for GAS by Adam Moyes
 */

/*
 * getTestManager:
 * A helper function used by the UTEST function returned by initUTest.
 * Returns a tracking object that provides the 'expect' function and stores the results of this suite of tests.
 * Also provides various other useful functions for interogating results of tests through the 'outcome' obect
 * getOutcome() reurns the outcome object
 * {
 *   numPassed - number of tests that passed in this suite
 *   numFailed - number of tests that failed in this suite
 *   suiteName - name of the suite of tests who's results this object holds
 *   testResults[] - an array of testResult objects in the order in which they were produced
 *   toString() -  function returning a formatted string representation of all the results in this suite of tests
 * }
 *
 * @param {string} suiteName - the name of the testing function to invoke when the UTEST function 
 * @returns {Object} - An object that provides the 'expect' function and keeps track of test results
 *
 */

function getTestManager_(suiteName) {
  var that = {};
  var outcome = { numPassed:0, numFailed: 0, suiteName: suiteName, testResults: [] };
  
  // compare test output and expected output with either '===' or optional evaluator argument
  // add result to the array of results for this test suite
  var expect = function(output, expected, evaluator) {
    var testResult = {
      suiteName: suiteName,
      expected: expected,
      output: output,
      passed: typeof evaluator !== 'undefined' ? evaluator(output, expected) : expected === output        
    };
    testResult.summary = suiteName + ' test #' + outcome.testResults.length + ': ' + (testResult.passed ? 'PASSED' : 'FAILED')
    + (!testResult.passed ? ' - (output: "' + output + '", expected: "' + expected + '")' : '');
    
    testResult.passed ? outcome.numPassed++ : outcome.numFailed++;
    outcome.testResults[outcome.testResults.length] = testResult;
  };

  var toString = function() {
    return "[ " + outcome.suiteName + " suite ] - PASSED: " + outcome.numPassed + ", FAILED: " + outcome.numFailed + "\n"
    + function() { var ri, s=''; for (ri=0; ri<outcome.testResults.length; ri++) { s+=outcome.testResults[ri].summary + '\n'; }; return s; }();
  };
  outcome.toString = toString;
  
  var getOutcome = function() { return outcome; };
  var testSuiteName = function() {return suiteName; };
  
  that.testSuiteName = testSuiteName;
  that.expect = expect;
  that.getOutcome = getOutcome;
  
  return that;
};

/*
 * checkResult:
 * Called at the end of a suite of tests to log the results
 * @param {String} testSuite - the name of this test suite
 * @param {Function} logger - A function to use to send the results of the tests. Takes a single parameter, the results object
 */
function checkResult_(testManager, logger) {
  var customLogging = typeof logger === 'function';
  var outcome = testManager.getOutcome();
  
  if (customLogging) {
    logger(testManager.getOutcome());
  }
  else {
    Logger.log('%s - %s', testManager.testSuiteName(), testManager.getOutcome().numFailed === 0 ? "PASSED" : "FAILED");
    if (testManager.getOutcome().numFailed > 0) {
      Logger.log(testManager.getOutcome().toString());
    }
  }
}

/*
 * initUTests: initialise the UTest framework with the list of tests and return the UTEST function
 * @param {Object} tests - An object containing test suite functions as elements that take the TestManager object as the first parameter
 * @param {Function(testResults)} logger - A function that takes a single parameter - the testResults object
 * @returns {Function} - An object that provides the 'expect' function and keeps track of test results
 */
function initUTest(tests, logger) {
  // return a function that invokes the testing framework on a 'test suite' - a group of related tests
  // Takes the expect function as the first parameter followed by optional extra parameters to be passed to the testing function
  return function(testSuite) {
    var testFn, tm, args, fnArgs, slice;
    
    testFn = tests[testSuite];        // get the test suite function from the test collection
    tm = getTestManager_(testSuite);   // generate the test manager that keeps track of all of the results
    
    // construct the argument list for the test suite
    // first arg is always the expecter, followed by the extra args passed to the UTEST function
    slice = Array.prototype.slice;
    args = slice.apply(arguments);
    fnArgs = [tm].concat(args.splice(1));

    ASSERT_TRUE_(typeof testFn !== "undefined", "Test '" + testSuite + "' not found, aborting");
    
    testFn.apply(null, fnArgs);
    checkResult_(tm, logger);
  };
}

/*
 * A simple assert function to help with exception management
 * @param {boolean} test - condition to be tested
 * @param {string} message - error message if test fails
 */
function ASSERT_TRUE_(test, message) {
  if (!test) {
    Logger.log('!!! EXCEPTION THROWN: %s', message);
    throw (message);
  }
}
