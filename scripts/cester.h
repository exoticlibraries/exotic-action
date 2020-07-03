
/**
    \copyright MIT License Copyright (c) 2020, Adewale Azeez 
    \author Adewale Azeez <azeezadewale98@gmail.com>
    \date 10 April 2020
    \file cester.h

    Cester is a header only unit testing framework for C. The header 
    file can be downloaded and placed in a project folder or can be 
    used as part of libopen library by including it in the projects 
    like `<libopen/cester.h>`. 
    
    A single test file is considered a test suite in cester, a single 
    test file should contain related tests functions only. 
*/

#ifndef LIBOPEN_CESTER_H
#define LIBOPEN_CESTER_H

/*
    BEFORE YOU SUGGEST ANY EDIT PLEASE TRY TO 
    UNDERSTAND THIS CODE VERY WELL. 
*/

#ifdef __cplusplus
extern "C" {
#endif

/** 
    The inline keyword to optimize the function. In 
    C89 and C90 the inline keyword semantic is 
    different from current C standard semantic hence 
    for compilation targeting C89 or C99 the inline 
    keyword is ommited.
*/
#ifdef __STDC_VERSION__
    #define __CESTER_STDC_VERSION__ __STDC_VERSION__
#else
    #ifdef __cplusplus
        #define __CESTER_STDC_VERSION__ __cplusplus
    #endif
#endif
#ifndef __CESTER_STDC_VERSION__
    #define __CESTER_INLINE__ 
    #define __CESTER_LONG_LONG__ long
    #define __FUNCTION__ "<unknown>"
#else 
    #define __CESTER_INLINE__ inline
    #define __CESTER_LONG_LONG__ long long
    #define __FUNCTION__ __func__
#endif

#ifdef __cplusplus
#ifdef _WIN32
    #define __CESTER_CAST_CHAR_ARRAY__ (unsigned)
#else
    #define __CESTER_CAST_CHAR_ARRAY__ (char*)
#endif
#else
    #define __CESTER_CAST_CHAR_ARRAY__
#endif

#include <stdlib.h>
#include <time.h>
#include <stdio.h>
#include <string.h>
#ifndef CESTER_NO_SIGNAL
#include <signal.h>
#include <signal.h>
#include <setjmp.h>
jmp_buf buf;
#endif

#ifndef __BASE_FILE__
#ifdef _MSC_VER
    #pragma message("__BASE_FILE__ not defined. Define the __BASE_FILE__ directive in Properties -> C/C++ -> Preprocessor -> Preprocessor Definition as __BASE_FILE__=\"%(Filename)%(Extension)\" or register your test cases manually.")
#else
    #pragma message("__BASE_FILE__ not defined. Define __BASE_FILE__ during compilation. -D__BASE_FILE__=\"/the/path/to/yout/testfile.c\" or register your test cases manually.")
#endif
#endif

#ifdef _WIN32
#include <windows.h>
/*
**  Windows 
**  Support Windows XP 
**  To avoid error message : procedure entry point **  InitializeConditionVariable could not be located **  in Kernel32.dll 
*/
#ifdef _WIN32_WINNT
#undef _WIN32_WINNT
#endif
#define _WIN32_WINNT 0x502
#define EXOTICTYPES_WINDLLEXPORT 1
/* Linux */
#else
#define EXOTICTYPES_WINDLLEXPORT 0
#endif
#ifndef __cplusplus
    #if EXOTICTYPES_WINDLLEXPORT
        #define EXOTIC_API __declspec(dllexport) /**< the platform is windows use windows export keyword __declspec(dllexport) */ 
    #else
        #define EXOTIC_API extern                /**< Keyword to export the functions to allow ussage dynamically. NOT USED. IGNORED  */
    #endif
#else
    #define EXOTIC_API
#endif

#if defined(__unix__) || defined(__unix) || (defined(__APPLE__) && defined(__MACH__))
#include <unistd.h>
#include <sys/wait.h>
#endif

#ifdef _WIN32

#define CESTER_RESET_TERMINAL           15                                                /**< reset the terminal color //Nothing     */
#define CESTER_BOLD                     15                                                /**< bold text                //Nothing     */
#define CESTER_FOREGROUND_BLACK         8                                                 /**< gray terminal foreground color         */
#define CESTER_FOREGROUND_RED           4                                                 /**< red terminal foreground color          */
#define CESTER_FOREGROUND_GREEN         2                                                 /**< green foreground color                 */
#define CESTER_FOREGROUND_YELLOW        6                                                 /**< yellow terminal foreground color       */
#define CESTER_FOREGROUND_BLUE          3                                                 /**< blue terminal foreground color         */
#define CESTER_FOREGROUND_MAGENTA       5                                                 /**< magenta terminal foreground color      */
#define CESTER_FOREGROUND_CYAN          11                                                /**< cyan terminal foreground color         */
#define CESTER_FOREGROUND_WHITE         15                                                /**< white terminal foreground color        */
#define CESTER_FOREGROUND_GRAY          8                                                 /**< gray terminal foreground color         */
#define CESTER_BACKGROUND_BLACK         0                                                 /**< black terminal background color        */
#define CESTER_BACKGROUND_RED           64                                                /**< red terminal background color          */
#define CESTER_BACKGROUND_GREEN         39                                                /**< green terminal background color        */
#define CESTER_BACKGROUND_YELLOW        96                                                /**< yellow terminal background color       */
#define CESTER_BACKGROUND_BLUE          48                                                /**< blue terminal background color         */
#define CESTER_BACKGROUND_MAGENTA       87                                                /**< magenta terminal background color      */
#define CESTER_BACKGROUND_CYAN          176                                               /**< cyan terminal background color         */
#define CESTER_BACKGROUND_GRAY          0                                                 /**< gray terminal background color         */
#define CESTER_BACKGROUND_WHITE         10                                                /**< gray terminal background color         */
#define CESTER_RESET_TERMINAL_ATTR()    SetConsoleTextAttribute(hConsole, default_color); /**< reset the terminal color               */

#else
    
#define CESTER_RESET_TERMINAL           "\x1B[0m"     /**< reset the terminal color           */
#define CESTER_BOLD                     "\x1B[1m"     /**< bold text                          */
#define CESTER_FOREGROUND_BLACK         "\x1B[30m"    /**< gray terminal foreground color     */
#define CESTER_FOREGROUND_RED           "\x1B[31m"    /**< red terminal foreground color      */
#define CESTER_FOREGROUND_GREEN         "\x1B[32m"    /**< green foreground color             */
#define CESTER_FOREGROUND_YELLOW        "\x1B[33m"    /**< yellow terminal foreground color   */
#define CESTER_FOREGROUND_BLUE          "\x1B[34m"    /**< blue terminal foreground color     */
#define CESTER_FOREGROUND_MAGENTA       "\x1B[35m"    /**< magenta terminal foreground color  */
#define CESTER_FOREGROUND_CYAN          "\x1B[36m"    /**< cyan terminal foreground color     */
#define CESTER_FOREGROUND_WHITE         "\x1B[37m"    /**< white terminal foreground color    */
#define CESTER_FOREGROUND_GRAY          "\x1B[90m"    /**< gray terminal foreground color     */
#define CESTER_BACKGROUND_BLACK         "\x1B[40m"    /**< black terminal background color    */
#define CESTER_BACKGROUND_RED           "\x1B[41m"    /**< red terminal background color      */
#define CESTER_BACKGROUND_GREEN         "\x1B[42m"    /**< green terminal background color    */
#define CESTER_BACKGROUND_YELLOW        "\x1B[43m"    /**< yellow terminal background color   */
#define CESTER_BACKGROUND_BLUE          "\x1B[44m"    /**< blue terminal background color     */
#define CESTER_BACKGROUND_MAGENTA       "\x1B[45m"    /**< magenta terminal background color  */
#define CESTER_BACKGROUND_CYAN          "\x1B[46m"    /**< cyan terminal background color     */
#define CESTER_BACKGROUND_GRAY          "\x1B[100m"   /**< gray terminal background color     */
#define CESTER_BACKGROUND_WHITE         "\x1B[47m"    /**< gray terminal background color     */
#define CESTER_RESET_TERMINAL_ATTR()    ;             /**< reset the terminal color           */

#endif

/**
    Cester current version
*/
#define CESTER_VERSION "0.3"

/**
    Cester current version
*/
#define CESTER_VERSION_NUM 0.3

/**
    Cester License
*/
#define CESTER_LICENSE "MIT License"

/**
    The hash # symbol for macro directive
*/
#define CESTER_HASH_SIGN #

/**
    Concat two items including C macro directives.
*/
#define CESTER_CONCAT(x, y) x y

/**
    The execution status of a test case that indicates 
    whether a test passes of fails. And also enable the 
    detection of the reason if a test fail.
*/
enum cester_test_status {
    CESTER_RESULT_SUCCESS,        /**< the test case passed                                                       */
    CESTER_RESULT_FAILURE,        /**< the test case failes dues to various reason mostly AssertionError          */
    CESTER_RESULT_TERMINATED,     /**< in isolated test, the test case was termiated by a user or another program */
    CESTER_RESULT_SEGFAULT,       /**< the test case crahses or causes segmentation fault                         */
#ifndef CESTER_NO_MEM_TEST
    CESTER_RESULT_MEMORY_LEAK,    /**< the test case passes or fails but failed to free allocated memory          */
#endif
    CESTER_RESULT_TIMED_OUT,      /**< cester terminated the test case because it running for too long            */
    CESTER_RESULT_UNKNOWN         /**< the test case was never ran                                                */
};

typedef enum cester_test_type {
    CESTER_NORMAL_TEST,             /**< normal test in global or test suite. For internal use only.                                              */
    CESTER_NORMAL_TODO_TEST,        /**< test to be implemented in future. For internal use only.                                                 */
    CESTER_NORMAL_SKIP_TEST,        /**< test to be skipped. For internal use only.                                                               */
    CESTER_BEFORE_ALL_TEST,         /**< test to run before all normal tests in global or test suite. For internal use only.                      */
    CESTER_BEFORE_EACH_TEST,        /**< test to run before each normal tests in global or test suite. For internal use only.                     */
    CESTER_AFTER_ALL_TEST,          /**< test to run after all normal tests in global or test suite. For internal use only.                       */
    CESTER_AFTER_EACH_TEST,         /**< test to run after each normal tests in global or test suite. For internal use only.                      */
    CESTER_OPTIONS_FUNCTION,        /**< the cester function for test, this wil be excuted before running the tests. For internal use only.       */
    CESTER_TESTS_TERMINATOR         /**< the last value in the test cases to terminates the tests. For internal use only.                         */
} TestType;

/**
    The test instance that contains the command line argument 
    length and values, with void* pointer that can be used to 
    share data between unit tests.
*/
typedef struct test_instance {
    unsigned argc;                   /**< the length of the command line arg                            */
    char **argv;                   /**< the command line arguments                                    */
    void *arg;                     /**< pointer to an object that can be passed between unit tests    */
} TestInstance;

/**
    The function signature for each test case and the before after functions. 
    It accepts the ::test_instance as it only argument. 
*/
typedef void (*cester_test)(TestInstance*);

/**
    The function signature for function to execute before and after each test 
    cases. It accepts the ::test_instance, char* and unsigned as parameters. 
*/
typedef void (*cester_before_after_each)(TestInstance*, char * const, unsigned);

/**
    A void function signature with no return type and no parameters.
*/
typedef void (*cester_void)();

typedef struct test_case {
    unsigned execution_status;                        /**< the test execution result status. For internal use only.                                      */
    unsigned line_num;                                /**< the line number where the test case is created. For internal use only.                        */
    enum cester_test_status expected_result;           /**< The expected result for the test case. For internal use only.                                 */
#ifndef CESTER_NO_TIME
    double start_tic;                            /**< the time taken for the test case to complete. For internal use only.                          */
    double execution_time;                            /**< the time taken for the test case to complete. For internal use only.                          */
#endif
    char* execution_output;                           /**< the test execution output in string. For internal use only.                                   */
    char *name;                                       /**< the test function name. For internal use only.                                                */
    cester_test test_function;                       /**< the function that enclosed the tests. For internal use only.                                  */
    cester_before_after_each test_ba_function;       /**< the function that enclosed the tests. For internal use only.                                  */
    cester_void test_void_function;                  /**< the function that enclosed the tests. For internal use only.                                  */
    TestType test_type;                               /**< the type of the test function. For internal use only.                                         */
} TestCase; 

#ifndef CESTER_NO_MEM_TEST

typedef struct allocated_memory {
    unsigned line_num;                 /**< the line number where the memory was allocated. For internal use only.   */
    unsigned allocated_bytes;          /**< the number of allocated bytes. For internal use only.                    */
    char* address;                   /**< the allocated pointer address. For internal use only.                    */
    const char* function_name;       /**< the function where the memory is allocated in. For internal use only.    */
    const char* file_name;           /**< the file name where the memory is allocated. For internal use only.      */
} AllocatedMemory;

#endif

/**
    The initial amount of item the ::CesterArray can accept the first 
    time it initialized.
*/
#define CESTER_ARRAY_INITIAL_CAPACITY 30

/**
    The maximum number of item the ::CesterArray can contain, in case of 
    the Memory manager array reaching this max capacity continous mem 
    test will be disabled.
*/
#define CESTER_ARRAY_MAX_CAPACITY ((size_t) - 5)

typedef struct cester_array_struct {
    size_t size;                        /**< the size of the item in the array                         */
    size_t capacity;                    /**< the number of item the array can contain before expanding */
    void** buffer;                      /**< pointer to the pointers of items added to the array       */
} CesterArray;


#define CESTER_ARRAY_FOREACH(w,x,y,z) for (x = 0; x < w->size; ++x) {\
                                          void* y = w->buffer[x];\
                                          z\
                                      }

/**
    This structure manages the _BEFORE_ and _AFTER_ functions 
    for the test main ::test_instance. And also accounts for all the 
    registered test cases. This is for Cester internal use only.
*/
typedef struct super_test_instance {
    unsigned no_color;                                    /**< Do not print to the console with color if one. For internal use only.                                                            */
    unsigned total_tests_count;                           /**< the total number of tests to run, assert, eval e.t.c. To use in your code call CESTER_TOTAL_TESTS_COUNT                          */
    unsigned total_tests_ran;                             /**< the total number of tests that was run e.t.c. To use in your code call CESTER_TOTAL_TESTS_RAN                                    */
    unsigned total_failed_tests_count;                    /**< the total number of tests that failed. To use in your code call CESTER_TOTAL_FAILED_TESTS_COUNT                                  */
    unsigned total_passed_tests_count;                    /**< the total number of tests that passed. To use in your code call CESTER_TOTAL_FAILED_TESTS_COUNT                                  */
    unsigned verbose;                                     /**< prints as much info as possible into the output stream                                                                           */
    unsigned minimal;                                     /**< prints minimal output into the output stream                                                                                     */
    unsigned print_version;                               /**< prints cester version before running tests                                                                                       */
    unsigned selected_test_cases_size;                    /**< the number of selected test casses from command line. For internal use only.                                                     */
    unsigned selected_test_cases_found;                   /**< the number of selected test casses from command line that is found in the test file. For internal use only.                      */
    unsigned single_output_only;                          /**< display the output for a single test only no summary and syntesis. For internal use only.                                        */
    unsigned mem_test_active;                             /**< Enable or disable memory test at runtime. Enabled by default. For internal use only.                                             */
    unsigned current_execution_status;                    /**< the current test case status. This is used when the test cases run on a single process. For internal use only.                   */
    unsigned isolate_tests;                               /**< Isolate each test case to run in different process to prevent a crashing test case from crahsing others. For internal use only.  */
    unsigned skipped_test_count;                          /**< The number of test cases to be skipped. For internal use only.                                                                   */
    unsigned todo_tests_count;                            /**< The number of test cases that would be implemented in future. For internal use only.                                             */
    unsigned format_test_name;                            /**< Format the test name for fine output e.g. 'test_file_exit' becomes 'test file exist'. For internal use only.                     */
#ifndef CESTER_NO_TIME
    double start_tic;                                   /**< The unix time when the tests starts. For internal use only. */
#endif
    char* flattened_cmd_argv;                           /**< Flattened command line argument for sub process. For internal use only.                                                          */
    char* test_file_path;                               /**< The main test file full path. For internal use only.                                                                             */
    char* output_format;                                /**< The output format to print the test result in. For internal use only.                                                            */
    TestInstance *test_instance ;                       /**< The test instance for sharing datas. For internal use only.                                                            */
    FILE* output_stream;                                /**< Output stream to write message to, stdout by default. For internal use only.                                                     */
    char** selected_test_cases_names;                   /**< selected test cases from command line. For internal use only. e.g. --cester-test=Test2,Test1                                     */
    TestCase* current_test_case;                        /**< The currently running test case. For internal use only.                                                                          */
    CesterArray *registered_test_cases;                 /**< all the manually registered test cases in the instance. For internal use only.                                                   */
#ifndef CESTER_NO_MEM_TEST
    CesterArray* mem_alloc_manager;                     /**< the array of allocated memory. For testing and detecting memory leaks. For internal use only.                                    */
#endif
} SuperTestInstance;

/* CesterArray */
static __CESTER_INLINE__ unsigned cester_array_init(CesterArray**);
static __CESTER_INLINE__ unsigned cester_array_add(CesterArray*, void*);
static __CESTER_INLINE__ void* cester_array_remove_at(CesterArray*, unsigned);

static __CESTER_INLINE__ unsigned cester_run_all_test(unsigned, char **);
static __CESTER_INLINE__ void cester_str_value_after_first(char *, char, char**);


SuperTestInstance superTestInstance = { 
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    CESTER_RESULT_SUCCESS,
    1,
    0,
    0,
    1,
#ifndef CESTER_NO_TIME
    0.0,
#endif
    (char*)"",
#ifdef __BASE_FILE__
    (char*)__BASE_FILE__,
#else
    (char*)__FILE__,
#endif
    (char*)"text",
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
#ifndef CESTER_NO_MEM_TEST
    NULL
#endif
};

#ifdef _MSC_VER
#define cester_sprintf(x,y,z,a,b,c) sprintf_s(x, y, z, a, b, c);
#define cester_sprintf1(x,y,z,a) cester_sprintf(x,y,z,a,"","")
#define cester_sprintf2(x,y,z,a,b) cester_sprintf(x,y,z,a,b,"")
#define cester_sprintf3(x,y,z,a,b,c) cester_sprintf(x,y,z,a,b,c)
#else
#define cester_sprintf(x,y,z,a,b) sprintf(x, z, a, b);
#define cester_sprintf1(x,y,z,a) sprintf(x, z, a)
#define cester_sprintf2(x,y,z,a,b) sprintf(x, z, a, b)
#define cester_sprintf3(x,y,z,a,b,c) sprintf(x, z, a, b, c)
#endif


/* cester options */

/**
    Change the output stream used by cester to write data. The default is `stdout`. 
    E.g to change the output stream to a file. 
    
    \code{.c} 
    CESTER_CHANGE_STREAM(fopen("./test.txt", "w+"));
    \endcode
    
    The code above changes the stream to a file test.txt, all the output from 
    the test will be written in the file.
**/
#define CESTER_CHANGE_STREAM(x) (superTestInstance.output_stream = x)

/**
    Do not print to the output stream with color. This should be 
    used to prevent writing the color bytes into a file stream (in case).
    
    This option can also be set from the command line with `--cester-nocolor`
*/
#define CESTER_NOCOLOR() (superTestInstance.no_color = 1)

/**
    Print minimal info into the output stream. With this option set the 
    expression evaluated will not be printed in the result output. 
    
    This option can also be set from the command line with `--cester-minimal`
*/
#define CESTER_MINIMAL() (superTestInstance.minimal = 1)

/**
    Print as much info as possible into the output stream. With this option set  
    both passed and failed expression evaluated will be printed in the result. 
    
    This option can also be set from the command line with `--cester-verbose`
*/
#define CESTER_VERBOSE() (superTestInstance.verbose = 1)

/**
    Print cester version before running any test. 
    
    This option can also be set from the command line with `--cester-printversion`
**/
#define CESTER_PRINT_VERSION() (superTestInstance.print_version = 1)

/**
    Display test for a single test case only, skip syntesis and summary.
    
    This option can also be set from the command line with `--cester-singleoutput`
**/
#define CESTER_SINGLE_OUPUT_ONLY() (superTestInstance.single_output_only = 1)

/**
    Do not isolate the tests, run each of the test cases in a single process. 
    The drawback is if a test case causes segfault or crash the entire test 
    crashes and no summary is displayed. No isolation causes a crash one 
    crash all scenerio.
    
    This option can also be set from the command line with `--cester-noisolation`
**/
#define CESTER_NO_ISOLATION() (superTestInstance.isolate_tests = 0)

/**
    Disable memory leak detection test.
    
    This option can also be set from the command line with `--cester-nomemtest`
**/
#define CESTER_NO_MEMTEST() (superTestInstance.mem_test_active = 0)

/**
    Enable memory allocation. The combination of CESTER_NO_MEMTEST() and 
    CESTER_DO_MEMTEST() is valid only in non isolated tests. 
    
    This togle combined with `CESTER_NO_MEMTEST()` can be used to selectively 
    test memory allocation in a test e.g. Calling CESTER_NO_MEMTEST() before 
    a test case will prevent memory test from the beginning of that function and 
    calling CESTER_DO_MEMTEST() at the end of the test case will ensure memory 
    allocation will be validated in all the other test case that follows.
**/
#define CESTER_DO_MEMTEST() (superTestInstance.mem_test_active = 1)

/**
    Change the output format to text
*/
#define CESTER_OUTPUT_TEXT() superTestInstance.output_format = (char*) "text";

/**
    Change the output format to junitxml
*/
#define CESTER_OUTPUT_JUNITXML() superTestInstance.output_format = (char*) "junitxml";

/**
    Change the output format to TAP (Test Anything Protocol)
*/
#define CESTER_OUTPUT_TAP() superTestInstance.output_format = (char*) "tap";

/**
    Change the output format to TAP (Test Anything Protocol) Version 13
*/
#define CESTER_OUTPUT_TAPV13() superTestInstance.output_format = (char*) "tapV13";

/**
    Format the test case name for output. E.g the test name 
    `modify_test_instance` becomes `modify test instance`. This 
    does not apply to junitxml as the test name remain the way it 
    declared in the test source.
*/
#define CESTER_FORMAT_TESTNAME() superTestInstance.format_test_name = 1;

/**
    Do not format the test case name, it remain the way it 
    declared in the test source.
*/
#define CESTER_DONT_FORMAT_TESTNAME() superTestInstance.format_test_name = 0;

/* test counts */

/**
    The total number of tests that is present in the test file.
*/
#define CESTER_TOTAL_TESTS_COUNT (superTestInstance.total_tests_count)

/**
    The total number of tests that was ran.
*/
#define CESTER_TOTAL_TESTS_RAN (superTestInstance.total_tests_ran)

/**
    The total number of tests that failed.
*/
#define CESTER_TOTAL_FAILED_TESTS_COUNT (superTestInstance.total_failed_tests_count)

/**
    The number of test that was skipped. 
    
    If the selected test_cases_size is 0 then no test was skipped else the 
    number of executed selected test cases minus the total number of test cases 
    is the number of test that was skipped.
*/
#define CESTER_TOTAL_TESTS_SKIPPED (superTestInstance.skipped_test_count)

/**
    The total number of tests that passed. CESTER_TOTAL_TESTS_COUNT - CESTER_TOTAL_FAILED_TESTS_COUNT
*/
#define CESTER_TOTAL_PASSED_TESTS_COUNT (superTestInstance.total_passed_tests_count)

/**
    The total number of tests that passed. CESTER_TOTAL_TESTS_COUNT - CESTER_TOTAL_FAILED_TESTS_COUNT
*/
#define CESTER_TOTAL_TODO_TESTS (superTestInstance.todo_tests_count)

/**
    Run all the test registered in cester, the TestInstance* pointer 
    will be initalized with the pointer to the string arguments from 
    cli and the length of the arguments. The `void* arg` pointer in the 
    TestInstance* can be initalized in the *_BEFORE_* function to share 
    data between the unit tests.
*/
#define CESTER_RUN_ALL_TESTS(x,y) cester_run_all_test(x,y)

#ifdef _WIN32
    int default_color = CESTER_RESET_TERMINAL;
    HANDLE hConsole;
#else
    const char* default_color = CESTER_RESET_TERMINAL;
#endif

static __CESTER_INLINE__ char *cester_extract_name(char const* const file_path) {
    unsigned i = 0, j = 0;
    char *file_name_only = (char*) malloc (sizeof (char) * 30);
    while (file_path[i] != '\0') {
        if (file_path[i] == '\\' || file_path[i] == '/') {
            j = 0;
        } else {
            file_name_only[j] = file_path[i];
            j++;
        }
        ++i;
    }
    file_name_only[j] = '\0';
    return file_name_only;
}

static __CESTER_INLINE__ char *cester_extract_name_only(char const* const file_path) {
    unsigned i = 0;
    char *file_name = cester_extract_name(file_path);
    while (file_name[i] != '\0') {
        if (file_name[i] == '.') {
            file_name[i] = '\0';
            break;
        }
        ++i;
    }
    return file_name;
}

static __CESTER_INLINE__ unsigned cester_str_after_prefix(const char* arg, char* prefix, unsigned prefix_size, char** out) {
    unsigned i = 0;
    *out = (char*) malloc (sizeof (char) * 200);
    
    while (1) {
        if (arg[i] == '\0') {
            if (i < prefix_size) {
                free(*out);
                return 0;
            } else {
                break;
            }
        }
        if (arg[i] != prefix[i] && i < prefix_size) {
            free(*out);
            return 0;
        }
        if (i >= prefix_size) {
            (*out)[i-prefix_size] = arg[i];
        }
        ++i;
    }
    (*out)[i-prefix_size] = '\0';
    return 1;
}

static __CESTER_INLINE__ char* cester_str_replace(char* str, char old_char, char new_char) {
    char* tmp = 