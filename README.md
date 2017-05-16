# UTest
A simple Unit Testing framework for GAS (Google Apps Script). GAS is a cloud based javascript platform built into Google's application suite. For more info check out this link: https://developers.google.com/apps-script/

To use this framework:
1. Add the library UTest to your code:
   In your script file go to Resources->Libraries and copy in the following library key. Select the latest stable version and click Save.  
   (Further information on adding libraries to your scripts can be found here: https://developers.google.com/apps-script/guide_libraries)
```   
   MfVkvoq5roRM2C2Hl70BB1ZMWPiBgPoq6
```
2. Create a function to contain all your unit testing
```javascript
      doTests() {
      }
 ```
2. Create an object either inside or outside of the scope of your function who's elements are functions containing groups of tests.  
  These functions are called test suites and allow groups of related tests to be run together. They must accept at least one parameter (the test manager) and can accept more if passed in later on (more on that later)
```javascript
      doTests() {
        var TESTS {
          testSuite1: function(t) {
          },
          testSuite2: function(t) {
          },
          testSuite3: function(t) {
          }
        };
      }
``` 
3. Now we are going to set up the actual tests.
   In the test suite functions call t.expect and pass it the function you want to test followed by its expected output.  
   
   You can also provide an optional 3rd parameter passing a comparison function that takes two values and returns a boolen. This is useful if the type returned by your function cannot be compared with '===', the default
```javascript 
      doTests() {
        var TESTS {
          testSuite1: function(t) {
            t.compare(my_function1(), expected_output1);
            t.compare(my_function2(), expected_output2);
          },
          testSuite2: function(t) {
            t.compare(my_function3(), expected_output3);
          },
          testSuite3: function(t) {
            t.compare(my_array_function4(), expected_output4, function(a,b) { return a.equals(b); });
          }

        };
      }
``` 
4. After the TESTS variable, we will be creating our unit testing wrapper. This creates the testManager which is passed the object containing all your test suites. It also handles optional arguments that can be used to set up configuration for the tests in your test suite.  

   First, lets just initialise the Unit Testing Framework
```javascript 
      doTests() {
        var TESTS {
          testSuite1: function(t) {
            t.compare(my_function1(), expected_output1);
            t.compare(my_function2(), expected_output2);
          },
          testSuite2: function(t) {
            t.compare(my_function3(), expected_output3);
          },
          testSuite3: function(t) {
            t.compare(my_array_function4(), expected_output4, function(a,b) { return a.equals(b); });
          }
        };
        var UTEST = initUTest(TESTS);
      }
``` 
  5. Now we can add the lines that actually execute the test suites:
```javascript 
      doTests() {
        var TESTS {
          testSuite1: function(t) {
            t.compare(my_function1(), expected_output1);
            t.compare(my_function2(), expected_output2);
          },
          testSuite2: function(t) {
            t.compare(my_function3(), expected_output3);
          },
          testSuite3: function(t) {
            t.compare(my_array_function4(), expected_output4, function(a,b) { return a.equals(b); });
          }
        };
        var UTEST = initUTest(TESTS);
 
        UTEST('testSuite1');
        UTEST('testSuite2');
        UTEST('testSuite3');
      }
``` 
  6. But it turns out that the tests in the second and third test suite (testSuite2 & testSuite3) need some configuration data. Let's add that in using the optional parameters mentioned earlier.
```javascript 
      doTests() {
        var TESTS {
          testSuite1: function(t) {
            t.compare(my_function1(), expected_output1);
            t.compare(my_function2(), expected_output2);
          },
          testSuite2: function(t, cfg, testSheetId) {
            t.compare(my_function3(cfg, testSheetId), expected_output3);
          },
          testSuite3: function(t, cfg) {
            t.compare(my_array_function4(cfg), expected_output4, function(a,b) { return a.equals(b); });
          }
        };
 
        var UTEST = initUTest(TESTS);
 
        var cfg = getConfig();
        var testSheetId = 'xxc777r_YYheh22pl78...';
 
        UTEST('testSuite1');
        UTEST('testSuite2', cfg, testSheetId);
        UTEST('testSuite3', cfg);
      }
``` 
  7. All test success and failure output goes to the logs which you can check under 'View->Logs'
 
  8. If your results are getting obscured in the default Log output, or if you just want them to be handled differently, you can add in a custom logger function. It will be called with an 'outcome' object containing all the results of the current test suite.  
   The outcome object looks like this:
   ```javascript
   {
     numPassed: Number, 
     numFailed: Number, 
     suiteName: String, 
     testResults[] // of testResult { passed: boolean, suiteName: String, expected: String, output: String, summary: String }
   }
   ```
   As a simple example we could just re-direct the output, but you could always store them all up to output together at a later date.
  ```javascript
      function logger(outcome) {
        OtherLogger.log("%s: %s", outcome.suiteName, outcome.numFailed === 0 ? "PASSED" : "FAILED");
        if (outcome.numFailed > 0)
          OtherLogger.log(outcome.toString());
      }
  ```
 9. Adding this to our testing function would like like this:  
 ```javascript
       doTests() {
        var TESTS {
          testSuite1: function(t) {
            t.compare(my_function1(), expected_output1);
            t.compare(my_function2(), expected_output2);
          },
          testSuite2: function(t, cfg, testSheetId) {
            t.compare(my_function3(cfg, testSheetId), expected_output3);
          },
          testSuite3: function(t, cfg) {
            t.compare(my_array_function4(cfg), expected_output4, function(a,b) { return a.equals(b); });
          }
        };
 
        var UTEST = UTest.initUTest(TESTS, logger);
 
        var cfg = getConfig();
        var testSheetId = 'xxc777r_YYheh22pl78...';
 
        UTEST('testSuite1');
        UTEST('testSuite2', cfg, testSheetId);
        UTEST('testSuite3', cfg);
      }
  ```
