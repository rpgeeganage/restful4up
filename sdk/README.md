## Python SDK
## How to instantiate
```python
from restful4up import restful4up

app = restful4up(<Restful4up Domain>)
```
Example:
```python
from restful4up import restful4up

app = restful4up('http://localhost:7887')
```

<br/>

## APIs
* ## `unpack(path)`
### To run the unpacking.
<br/>

| Parameter   | Requirement | Description  |
|---|---|---|
| `path` | **required**    | Path to the executable file  |  
<br/>

### Example: 
```python
path = '/home/user/projects/unipacker/Sample/UPX/Lab18-01.exe'

unpackedFileStream = app.unpack(path)

with open('/home/user/projects/test.exe', 'wb') as f:
    f.write(unpackedFileStream)
```

<br/>

* ## `emulationOutput(path)`

### To get the emulation output from Unipacker when unpacking.
<br/>

| Parameter   | Requirement | Description  |
|---|---|---|
| `path` | **required**    | Path to the executable file  |  
<br/>


### Example: 
```python
path = '/home/user/projects/unipacker/Sample/UPX/Lab18-01.exe'

emulationOutput = app.emulationOutput(path)

print(emulationOutput)
```
<br/>

* ## `clean()`
### To clean the workspace

<br/>

### Example: 

```python
app.clean()
```
<br/>

* ## `generatePartialYaraRule(path, [is_unpacking_required, minimum_string_length, strings_to_ignore])`
### To generate a partial YARA rule
<br/>

| Parameter   | Requirement| Description    |default value|
|---|---|---|---|
| `path`   | **required** | Path to the executable file  |-|
| `is_unpacking_required` | **_optional_**| flag to indicate unpacking is required for the give executable| `False`
| `minimum_string_length`| **_optional_**| Minimum string length to extract| `4`
| `strings_to_ignore`| **_optional_**| Array of string to execlude from the `strings` section| `[]`

<br/>

### Example: 

```python
path = '/home/user/projects/unipacker/Sample/UPX/Lab18-01.exe'

partialYaraRule = app.generatePartialYaraRule(
    path, 
    True,
    10, 
    ['SING error', '!This program cannot be run in DOS mode.']
)

print(partialYaraRule)
```
<br/>

* ## `applyYaraRules(path, rules, [is_unpacking_required])`
### To generate a partial YARA rule
<br/>

| Parameter   | Requirement| Description    |default value|
|---|---|---|---|
| `path`   | **required** | Path to the executable file  |-|
| `rules`   | **required** | Array of **Base64 encoded** strings generated from YARA rules  |-|
| `is_unpacking_required` | **_optional_**| flag to indicate unpacking is required for the give executable| `False`

<br/>

### Example: 

```python
import os
import base64

from restful4up import restful4up

app = restful4up('http://localhost:7887')

path = '/home/user/projects/unipacker/Sample/UPX/Lab18-01.exe'
rules_folder = '/home/user/projects/restful4up/app/__test__/fixtures/yara_rules'

# Base64 encoded rules

rules = []

# Building the Base64 encoded rules
for root, directories, files in os.walk(rules_folder, topdown=False):
    for name in files:
        data = open(os.path.join(root, name), 'rb').read()
        print(data)
        encoded = base64.b64encode(data)
        
        rules.append(encoded)

# Call the API
yaraRuleResult = app.applyYaraRules(path, rules, True)

print(yaraRuleResult)
```