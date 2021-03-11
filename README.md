# RESTful API for [Unipacker](https://github.com/unipacker/unipacker)

### Table of content
+ [Features](#features)
+ [Software Requirements](#software-requirements)
+ [How to use](#how-to-use)
+ [APIs](#apis)
+ [SDKs](#sdks)
    - [Python](sdk/README.md#python-sdk)   
+ [About the Partial YARA rule](#about-the-partial-yara-rule)

## Features
- Unpack the given executable using [Unipacker](https://github.com/unipacker/unipacker)
- Extract the output when Unipacker run the unpacking
- Generate partial [YARA](https://yara.readthedocs.io/) rule.
- Apply given YARA rules to given executable.
## Software Requirements
* Docker

## How to use
1. Clone this repo

```sh
git clone https://github.com/rpgeeganage/restful4up.git
```
2. use the `Makefile` to execute the `build`

```sh
make build
```
3. use the `Makefile` to execute the `run`

```sh
make run
```
4. The application is available at the following path
```
http://localhost:7887/spec
```

## APIs
### `/v1/unpack`

Upload the file to unpack and get the unpacked file.

HTTP method: 
```
POST
```
Request:
```
{
    file: <Binary string>
}
```

### `/v1/emulation-output`

Upload the file to unpack and get the emulation output of the Unipacker.

HTTP method: 
```
POST
```
Request:
```
{
    file: <Binary string>
}
```

### `/v1/clean`

Cleanup the uploaded executables
HTTP method: 
```
HEAD
```
Request:
```
none
```

### `/generate-partial-yara-rules`
Generates partial YARA rules
HTTP method: 
```
POST
```
Request:

```javascript
{
   "is_unpacking_required":"true", // flag to indicate unpacking required or not
   "minimum_string_length":"10", // Minimum length of the strings to extract
   "strings_to_ignore": [
      "SING error",
      "!This program cannot be run in DOS mode."
   ], // Strings to ignore from "strings" section in YARA rule
   "file": <Binary string> // File content
}
```
Reponse: [About the Partial YARA rule](#about-the-partial-yara-rule)
<br/>
<br/>
### `/apply-yara-rules`
Apply YARA rules to give executable
HTTP method: 
```
POST
```
Request:

```javascript
{
   "is_unpacking_required":"true", // flag to indicate unpacking required or not
   "rules": [
      "<BASE64 encoded string>"
   ], // Base 64 encoded string of YARA files
   "file": <Binary string> // File content
}
```
Reponse: [Results after applying the given YARA rule](#results-after-applying-the-given-yara-rule)
<br/>
<br/>
## SDKs
### Python SDK is available in `sdk/restful4up.py`
### [Read Me](sdk/)
```python
#!/usr/bin/python3

from restful4up import restful4up

path = '/home/user/projects/unipacker/Sample/UPX/Lab18-01.exe'

app = restful4up('http://localhost:7887')

# Unpack file
unpackedFileStream = app.unpack(path)

with open('/home/user/projects/test.exe', 'wb') as f:
    f.write(unpackedFileStream)

# Get emulation output
emulationOutput = app.emulationOutput(path)

print(emulationOutput)

# Clean
app.clean()

# Partial YARA rule generator
partialYaraRule = app.generatePartialYaraRule(path, True, 10, ['SING error', '!This program cannot be run in DOS mode.'])
print(partialYaraRule)
```

## About the Partial YARA rule
App generates a YARA rule without the `condition` block from given executable.

eg:
```json
{
    "rule": {
        "name": "rule_for_extracted_string",
        "meta": {
            "date": "Tue Mar 09 2021 16:20:46 GMT+0000 (Coordinated Universal Time)",
            "md5sum": "2a3f2816a33ac55e1d78c8ce4b331273",
            "sha256sum": "abffbf69a2a4830637f1e4f67de2a32cccc05a8ed6da6a1c16ac42e5b6dc457c",
            "sha512sum": "afac8b8eef6eb97777a13945c5c4cc34b291653ad1f5fd3084d7794b3adf1b5446baedf7f8bf5e7e63bab9cb54c02d8581788093648015aeec0781099d840da5"
        },
        "strings": [
            [
                "text_0",
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
            ],
            [
                "text_1",
                "- unable to initialize heap"
            ],
            [
                "text_2",
                "- not enough space for lowio initialization"
            ],
            [
                "text_3",
                "- not enough space for stdio initialization"
            ],
            [
                "text_4",
                "- pure virtual function call"
            ],
            [
                "text_5",
                "- not enough space for _onexit/atexit table"
            ],
            [
                "text_6",
                "- unable to open console device"
            ],
            [
                "text_7",
                "- unexpected multithread lock error"
            ],
            [
                "text_8",
                "- not enough space for thread data"
            ],
            [
                "text_9",
                "abnormal program termination"
            ],
            [
                "text_10",
                "- not enough space for environment"
            ],
            [
                "text_11",
                "- not enough space for arguments"
            ],
            [
                "text_12",
                "- floating point not loaded"
            ],
            [
                "text_13",
                "Microsoft Visual C++ Runtime Library"
            ],
            [
                "text_14",
                "http://www.practicalmalwareanalysis.com/%s/%c.png"
            ],
            [
                "text_15",
                "%c%c:%c%c:%c%c:%c%c:%c%c:%c%c"
            ],
            [
                "text_16",
                "(((((                  H"
            ],
            [
                "data_17",
                "FGHIJKLMNOPQRST@XYZabcdefg"
            ],
            [
                "data_18",
                "hijklmnopqrstuvwxyz0123456789+/"
            ]
        ]
    }
}
```

## Results after applying the given YARA rule

```json
{
    "output": {
    "matched_yara_rules": [
        {
            "rule": "test_rule_1",
            "string_information": [
                "0x4e:39:$my_text_string: This program cannot be run in DOS mode."
            ]
        },
        {
            "rule": "test_rule_3",
            "string_information": [
                "0x50e1:31:$my_text_string: hijklmnopqrstuvwxyz0123456789+/",
                "0x9724:31:$my_text_string: hijklmnopqrstuvwxyz0123456789+/"
            ]
        }
    ],
    "yara_command": "yara --print-strings --print-string-length --fail-on-warnings /tmp/restful4up/1615496936444_yara_workspace/rules/c35143ae5515181b3b2b892cc9c2c5590029dd3668095bcf /tmp/restful4up/1615496936444_yara_workspace/rules/7e8070e40a5c06991f80e98aa648038ab2aa332e32069211 /tmp/restful4up/1615496936444_yara_workspace/rules/f9971bd6ee57c4b3dc1dbde4b0e6ca420c9bcfa7a103ef5d /tmp/restful4up/1615496936444_yara_workspace/app_yoAVQ3/1615496937530.invactive",
    "is_success": true
    }
}
```
