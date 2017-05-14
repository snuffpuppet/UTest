/*
 * A simple unit testing framework for GAS by Adam Moyes
 * To use this framework:
 *   1. write a testing function like doTests() {} containing any context you need for your tests
 *   2. split your tests into test suites - groups of related tests tat make sense to be run together
 *   3. create a variable called e.g. TESTS that has the test suites as function members who take a parameter 't'
 *   4. in your testing function call initUtest and assign the result to UTEST (this is your unit testing wrapper)
 *   5. in your test suite functions, call t.expect(your_test, expected output, [comparison function]
 *   6. in your testing function call UTEST('name_of_test_suite_function')
 *   7. A message indicating the test results will be in the logs
 *
 *
 * e.g.
 * function doTests() {
 *   var TESTS = function() {
 *     testSuite1: function(t) {
 *       t.expect(someFunction(), expected_output, [optional comparison function]);
 *       t.expect(someOtherFn(), expected_output, [optional comparison function]);
 *     }
 *   };
 *
 *   var UTEST = initUTest(TESTS);
 *
 *   UTEST('testSuite1');
 * }
 *
 * The UTEST function will also take extra arguments which will get passed to your test suite function after
 * the testManager object.
 * e.g.
 *   var TESTS = function() {
 *     ...
 *     testSuite2: function(t, configItem1, configItem2) {
 *       t.expect(someFunction(configItem1), expected_output, [optional comparison function]);
 *       t.expect(someOtherFn(configItem1, configItem2), expected_output, [optional comparison function]);
 *     }
 *   };
 *
 *   var UTEST = initUTest(TESTS);
 *   var configItem1 = someConfig();
 *   var configItem2 = someOtherConfig();
 *
 *   UTEST('testSuite1', configItem1, configItem2);
 * }
 *
 * The expect function can take an optional comparison function. This allows comparison of expected output
 * of non basic types such as arrays or objects
 *
 */

/*
 * getTestManager:
 * A helper function used by the UTEST function returned by initUTest.
 * Returns a tracking object that provides the 'expect' function and stores the results of this suite of tests.
 * Also provides various other seful functions for interogating results of tests.
 *
 * @param {string} suiteName - the name of the testing function to invoke when the UTEST function 
 * @returns {Object} - An object that provides the 'expect' function and keeps track of test results
 *
 */
function getTestManager(suiteName) {
  var that = {};
  var results = [];
  var passed = null;
  
  var expect = function(output, expected, evaluator) {
    var result = {
      suite: suiteName,
      expected: expected,
      passed: typeof evaluator !== 'undefined' ? evaluator(output, expected) : expected === output        
    };
    result.description = suiteName + ' test #' + results.length + ': ' + (result.passed ? 'PASSED' : 'FAILED')
    + (!result.passed ? ' - (output: "' + output + '", expected: "' + expected + '")' : '');
    
    passed = passed === null ? result.passed : (result.passed ? passed : false);
    //Logger.log(result.description);
    results[results.length] = result;
  }
  
  var getResults = function() {
    return results;
  }    
  var toString = function() {
    return '<< ' + suiteName + ' suite >>\n' 
    + function() { var ri, s=''; for (ri=0; ri<results.length; ri++) { s+=results[ri].description + '\n'; }; return s; }();
  }
  var allPassed = function() { return passed; };
  var testSuiteName = function() { return suiteName; };
  
  //that.results = results;
  that.expect = expect;
  that.getResults = getResults;
  that.allPassed = allPassed;
  that.toString = toString;
  that.testSuiteName = testSuiteName;
  
  return that;
};

/*
 * checkResult:
 * Called at the end of a suite of tests to log the results
 * @param {string} testSuite - the name of this test suite
 */
var checkResult = function (testManager) {
  if (testManager.allPassed()) {
    Logger.log('%s - PASSED', testManager.testSuiteName());
  }
  else {
    Logger.log('%s - FAILED\n%s', testManager.testSuiteName(), testManager.toString());
  }
};

function initUTest(tests) {
  // return a function that invokes the testing framework on a 'test suite' - a group of related tests
  // Takes the expect function as the first parameter followed by optional extra parameters to be passed to the testing function
  return function(testSuite) {
    var testFn, tm, args, fnArgs, slice;
    
    testFn = tests[testSuite];        // get the test suite function from the test collection
    tm = getTestManager(testSuite);   // generate the test manager that keeps track of all of the results
    
    // construct the argument lest for the test suite
    // first arg is always the expecter, followed by the extra args passed to the UTEST function
    slice = Array.prototype.slice;
    args = slice.apply(arguments);
    fnArgs = [tm].concat(args.splice(1));

    ASSERT_TRUE(typeof testFn !== "undefined", "Test '" + testSuite + "' not found, aborting");
    
    testFn.apply(null, fnArgs);
    checkResult(tm);
  };
}

/*
 * A simple assert function to help with exception management
 * @param {boolean} test - condition to be tested
 * @param {string} message - error message if test fails
 */
function ASSERT_TRUE(test, message) {
  if (!test) {
    Logger.log('!!! EXCEPTION THROWN: %s', message);
    throw (message);
  }
}
