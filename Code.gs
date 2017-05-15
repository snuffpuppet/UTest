/*
 * A simple flexible unit testing framework for GAS by Adam Moyes
 * To use this framework:
 *   1. Create a function to contain all your unit tests. e.g.
 *
 *     doTests() {
 *   }
 *
 *   2. Create an object either inside or outside of the scope of your function who's elements are functions containing groups of tests.
 *      These functions are called 'Test Suites' and allow groups of related tests to be run together. 
 *      They must accept at least one parameter (more on that later) e.g.
 *
 *     doTests() {
 *       var TESTS {
 *         testSuite1: function(t) {
 *         },
 *         testSuite2: function(t) {
 *         }
 *       };
 *     }
 *
 *   3. Now we are going to set up the actual tests.
 *      In the test suite functions call t.expect and pass it the function you want to test followed by its expected output.
 *      You can also provide an optional 3rd parameter passing a comparison function that takes two values and returns a boolen
 *      - this is useful if the type returned by your function is annot be compared with '===', the default
 *
 *     doTests() {
 *       var TESTS {
 *         testSuite1: function(t) {
 *           t.compare(my_function1(), expected_output1);
 *           t.compare(my_function2(), expected_output2);
 *         },
 *         testSuite2: function(t) {
 *           t.compare(my_function1(), expected_output1);
 *         }
 *       };
 *     }
 *
 *   4. After the TETSTS variable, we will be creating our unit testing wrapper. This creates the testManager which is passed your test suites.
 *      It also handles optional arguments that can be used to set up configuratipon for the tests in your test suite.
 *      First, lets just initialise the Unit Testing Framework
 *
 *     doTests() {
 *       var TESTS {
 *         testSuite1: function(t) {
 *           t.compare(my_function1(), expected_output1);
 *           t.compare(my_function2(), expected_output2);
 *         },
 *         testSuite2: function(t) {
 *           t.compare(my_function1(), expected_output1);
 *         }
 *       };
 *       var UTEST = initUTest(TESTS);
 *     }
 *
 *
 *   5. Now we can add the lines that actually execute the test suites:
 *
 *     doTests() {
 *       var TESTS {
 *         testSuite1: function(t) {
 *           t.compare(my_function1(), expected_output1);
 *           t.compare(my_function2(), expected_output2);
 *         },
 *         testSuite2: function(t) {
 *           t.compare(my_function1(), expected_output1);
 *         }
 *       };
 *       var UTEST = initUTest(TESTS);
 *
 *       UTEST('testSuite1');
 *       UTEST('testSuite2');
 *     }
 *
 *   6. But it turns out that the tests in the second test suite (testSuite2) need some configuration data. Let's add that in:
 *
 *     doTests() {
 *       var TESTS {
 *         testSuite1: function(t) {
 *           t.compare(my_function1(), expected_output1);
 *           t.compare(my_function2(), expected_output2);
 *         },
 *         testSuite2: function(t, cfg, testSheetId) {
 *           t.compare(my_function3(cfg, testSheetId), expected_output3);
 *         }
 *       };
 *
 *       var UTEST = initUTest(TESTS);
 *
 *       var cfg = getConfig();
 *       var testSheetId = 'xxc777r_YYheh22pl78...';
 *
 *       UTEST('testSuite1');
 *       UTEST('testSuite2', cfg, testSheetId);
 *     }
 *
 *   7. All test success and failure output goes to the logs which you can check under 'View->Logs'
 *
 */

/*
 * getTestManager:
 * A helper function used by the UTEST function returned by initUTest.
 * Returns a tracking object that provides the 'expect' function and stores the results of this suite of tests.
 * Also provides various other useful functions for interogating results of tests.
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
    
    // construct the argument list for the test suite
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
