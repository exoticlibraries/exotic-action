
![](https://github.com/exoticlibraries/exotic-action/raw/main/exotic-action.png)

# Exotic Action

This GitHub Action will automatically download all [exotic libraries](https://exoticlibraries.github.io/) into your repo workflow environment. It can also be configured to run regression test on your project.

You can include the action in your workflow to trigger on any event that GitHub actions supports. Your workflow will need to include the actions/checkout step if you wish to run regression test on your project.

You can view an example of this below.

```yaml
name: CI with C/C++ Exotic Action
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
        platform: [x86, x64]
        compiler: [gcc, clang, tcc, msvc]
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        
      - name: Setup Exotic Libraries
        uses: exoticlibraries/exotic-action@v1.1
        with:
          download-exotic-libraries: true
          run-regression: false
          selected-exotic-libraries: |
            libcester@main
            libxtd@dev
          test-folders: |
            test/
          test-file-pattern: |
            ^test_
          compiler-options-for-tests: |
            -O2 
            -Wall
          compiler-options-for-tests-msvc: |
            /I./src
            /I./include
          regression-cli-options: |
            --show-version
            --verbose
```

The example above only install the exotic libraries into the environment and does not run regression test. To run regression set the value of `run-regression` to true, in a situation where the action is used to run regression only set the value of `download-exotic-libraries` to false to disable downloading exotic libraries. For more detail on configuring the regression see the section [Regression Test](#regression-test).

___
## Table of content
- [Configuration](#configuration)
  - [Output variables](#output-variables)
- [Operating System Support](#operating-system-support)
  - [Job Table](#job-table)
- [Test Compilation](#test-compilation)
- [Regression Test](#regression-test)
- [Runtime Options](#runtime-options)
- [How it works](#how-it-works)
- [Contributing](#contributing)
- [References](#references)
- [License](#license)

## Configuration

The `with` portion of the workflow can be configured before the action will work. You can add these in the with section found in the examples above. None of the option is required.

| Key <img width=600/> | Value Information | DataType <img width=200/> | Required | 
| ------------ | ----------------- | --------- | -------- |
|  `download-exotic-libraries` | This option if set to false will skip downloading the exotic libraries and just continue to run the regression test. The default value is true. | boolean | No     |
| `run-regression` | Set the option to indicate whethere the action should run regression on the matching test files in the test folder. The default value is false. | boolean | No | 
| `test-folders` | The list of folder to search for the tsst files to compile and execute. The default value is `test/`. The values should be relative to the repo folder structure. | Multiline String | No | 
| `test-folder-recursive` | Set this option to true to search for matching test file recursively in test folders. The default is false. | boolean | No |
| `test-file-pattern` | List of multiline regex strings to match files to run in the test folders. The default is `^test_` `_test[.c](c\+\+|cpp|c)` | Multiline Regex | No | 
| `test-exclude-file-pattern` | List of multiline regex strings to match files to skip when searching for test files in the test folders. | Multiline Regex | No |
| `test-exclude-file-pattern-x86` | List of multiline regex strings to match files to skip on the x86 platform when searching for test files in the test folders. | Multiline Regex | No |
| `test-exclude-file-pattern-x64` | List of multiline regex strings to match files to skip on the x64 platform when searching for test files in the test folders. | Multiline Regex | No |
| `test-exclude-file-pattern-macos` | List of multiline regex strings to match files to skip on MacOS when searching for test files in the test folders. | Multiline Regex | No |
| `test-exclude-file-pattern-linux` | List of multiline regex strings to match files to skip on linux os when searching for test files in the test folders. | Multiline Regex | No |
| `test-exclude-file-pattern-windows` | List of multiline regex strings to match files to skip on windows os when searching for test files in the test folders. | Multiline Regex | No |
| `compiler-options-for-tests` | The multiline string of flags to pass to the compiler when compiling the test files. | Multiline String | No |
| `regression-cli-options` | The multiline string of flags to pass to the compiled executable when running it. | Multiline String | No |
| `selected-exotic-libraries` | The selected list of exotic libraries to install, if skipped only libcester is installed. | Multiline String | No |
| `test-exclude-file-pattern-{compiler}` | List of multiline regex strings to match files to skip when searching for test files if the `${compiler}` matches the compiler in the strategy.matrx.compiler. E.g. to exclude some test if the compiler is gcc set `test-exclude-file-pattern-gcc`, to exclude some test when using tcc compiler `test-exclude-file-pattern-tcc` | Multiline Regex | No |
| `compiler-options-for-tests-{compiler}` | The multiline string of flags to pass to a compiler when compiling the test files. E.g. to pass the flag during compilation if the selected compiler is tcc  `compiler-options-for-tests-tcc` to pass flag to only msvc compiler `compiler-options-for-tests-msvc`. If the compiler options is specified for a particular compiler the general `compiler-options-for-tests` will be ignored and the compiler specific will be used instead. | Multiline String | No |

### Output variables


## Operating System Support

This action is suport the following operating systems. 

- Windows 
- MacOS
- Linux

In your workflow job configuration you can set the runs-on property to any of `macos-latest`, `ubuntu-20.04`, `ubuntu-18.04`, `ubuntu-20.04`, `ubuntu-latest`, `windows-latest` or any variant of the three platform. Both the **x86** and **x64** platform is supported and can be specified in the `matrix.platform` option. If the platform option x86 is specified for macos it is ignored and x64 version of macosx is initialized as the x86 platform is long deprecated. 

The following compilers are supported in the action. 

- gcc
- clang
- tcc
- msvc

If any or combination of the compiler above is specified the compiler will be used to compile each test file in the tests folder. 

The example below show a workflow setup that runs on all the three os (latest) with the supported compilers on the x86 and x64 platform.

```yaml
#...
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
        platform: [x86, x64]
        compiler: [gcc, clang]
#...
```

The matrix configuration above will creates 12 jobs

### Job Table


|  | macosx-latest | ubuntu-latest | windows-latest |
| ------ | ------ | ------- | ------- |
| **x86 (6 jobs)** |
| gcc    |  1      |     2    |    3     |
| clang  |  4      |     5    |    6     |
| **x64 (6 jobs)** |
| gcc    |  7      |     8    |    9     |
| clang  |  10      |     11    |    12     |

## Test Compilation

Using the last sample `runs-on` configuration above, on each of the job the platform, os, and compiler affects the way the test is ran. On any Job running on the x86 platform the flag `-m32` will be issued during compilation on the x64 platform the flag `-m64` will be issued to the compiler.

The action option `compiler-options-for-tests` can be used to add more flag for compilation. E.g. to compile the test `test_json_parser.cpp` on x86 platform the command is executed:

```bash
g++ -m32 -I. test_json_parser.cpp -o out
```

To add more option e.g. to report more error, the `compiler-options-for-tests` can be set with the flags option like the example below:

```yaml
#...
      - name: Run Regression
        uses: exoticlibraries/exotic-action@v1.1
        with:
          download-exotic-libraries: false
          run-regression: true
          compiler-options-for-tests: |
            -O2 
            -Wall 
            -Wpointer-arith 
            -Wmissing-noreturn
```

With the extra configurations above the test `test_json_parser.cpp` is compiled with the extra flags like:

```bash
g++ -m32 -O2 -Wall -Wpointer-arith -Wmissing-noreturn -I. test_json_parser.cpp -o out
```

## Regression Test

The action looks at the values of the option `test-folders` to determine the folder to begin testing. The default folder where the test file is searched for is `test/`, more test folder can be added or changed in your configuration incase the test file is in other or multiple folder. The search for test file is non-recursive by default to make the action look into subfolders of the test folders set the value of `test-folder-recursive` to true.

 Since the action is built to run C and C++ test files the following file pattern is searched for in the provided test folders `^test_`, `_test[.c](c\+\+|cpp|c)` the two patterns matches a file that it name starts with test_ or ends with _test.c or _test.cpp. More pattern can be added to the option `test-file-pattern` for other file name. 

The example below shows how to add the test folders, disable recursive search in test folder and add more matching file pattern.

```yaml
#...
      - name: Run Regression
        uses: exoticlibraries/exotic-action@v1.1
        with:
          download-exotic-libraries: false
          run-regression: true
          test-folders: |
            test/
            tests/
          test-folder-recursive: false
          test-file-pattern: |
            ^test_
            _test[.c](c\+\+|cpp|c)
            _test.cxx
            _test.uno
```

To exclude some folder from compilation and execution it can be added to the `test-exclude-file-pattern` option. E.g. to exclude some files that requires system resources from executed:

```yaml
#...
      - name: Run Regression
        uses: exoticlibraries/exotic-action@v1.1
        with:
          download-exotic-libraries: false
          run-regression: true
          test-folders: |
            test/
            tests/
          test-exclude-file-pattern: |
            system_+
            win32_+ 
```

Any file starting with *system_* and *win32_* will be skipped during the test file search. There are also other file exclude options for various platform and os, `test-exclude-file-pattern-x86`, `test-exclude-file-pattern-x64`, `test-exclude-file-pattern-macos`, `test-exclude-file-pattern-linux`and `test-exclude-file-pattern-windows`.

  > The Action can be configured to run other programming language files by setting the appropriate values for the `compiler-options-for-tests` and `regression-cli-options`options.

## Runtime Options

To send a flag to the compiled executable, add the flags to the `regression-cli-options` option. E.g. a compiled executable is executed as:

```bash
./test_assert
```

The sample configuration below shows how to add runtime option to the executable:

```yaml
#...
      - name: Run Regression
        uses: exoticlibraries/exotic-action@v1.1
        with:
          download-exotic-libraries: false
          run-regression: true
          regression-cli-options: |
            --show-version
            --verbose
```

The executable will be executed with the provided flags like below:

```bash
./test_assert --show-version --verbose
```

## How it works

The main source file used in the project is [dist/index.js](https://github.com/exoticlibraries/exotic-action/blob/main/dist/index.js) which is a compiled version of [index.js](https://github.com/exoticlibraries/exotic-action/blob/main/dist/index.js) compiled using [zeit/ncc](https://github.com/zeit/ncc). The reason for the compiled version is to prevent commiting the node_modules folder and instead use compiled index.js as described [here](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github).

Exotic Action determined the environment Operating system and platform from the build matrix, `matrix.os`, `matrix.platform` and `matrix.compiler`. The three options determine what compiler and version of the exotic libraries to download. If the *matrix.platform* value is x86 the flag `-m32` will be issued to the compiler and if the value is `x64` the flag `-m64` will be issued. On the windows platform the powershell script [scripts/install.ps1](https://github.com/exoticlibraries/exotic-action/blob/main/scripts/install.ps1) is invoked to install the correct libraries and on other platforms (mac and linux) [scripts/install.sh](https://github.com/exoticlibraries/exotic-action/blob/main/scripts/install.ps1) is invoked to download the libraries. On windows it uses the clang and gcc installed by default in the folder `C:\\msys64\\mingw32|mingw64\\bin\\`, the folder is exported as output parameter for use in other step as `win32-clang-gcc-folder`.

It optional to download the libraries incase the action is to be used to run regression only, setting the option `download-exotic-libraries` to false skip the exotic libraries install phase. If the `run-regression` option is set to true, each file in the test folders matching the file patterns is compiled and executed. See the sections above on setting the compilation and runtime cli options.

## Contributing

If you have any issue or you want to request a feature you can open a request [here](https://github.com/exoticlibraries/exotic-action/issues/new/choose) anytime and if you made some changes that should be added to the main project send in a [pull request](https://github.com/exoticlibraries/exotic-action/compare). 

To install ncc and build the distributable dit/index.js file. Never commit the node_modules folder.

```
npm i -g @vercel/ncc
ncc build index.js
```

## References

 - [About Actions](https://docs.github.com/en/actions/creating-actions/about-actions)
 - [Creating a JavaScript action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
 - [Publishing actions in GitHub Marketplace](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace)
 - [Exotic Libraries](https://exoticlibraries.github.io/)
 - [Author](https://thecarisma.github.io/)

## License

MIT License Copyright (c) 2020, Adewale Azeez