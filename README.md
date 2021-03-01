# RESTful API for [Unipacker](https://github.com/unipacker/unipacker)

# How to use
1. Clone this repo

```sh
git clone https://github.com/o4isec/restful4up.git
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

# APIs
* `/v1/unpack`

Upload the file to unpack

* `/v1/clean`

Cleanup the uploaded executables


# How to use the SDK
### Python SDK is available in `sdk/restful4up.py`
```
#!/usr/bin/python3

from restful4up import restful4up

app = restful4up('http://localhost:7887')

path = '/home/o4isec/projects/unipacker/Sample/UPX/Lab18-01.exe'

# unpack api
response = app.unpack(path)

with open('/home/o4isec/projects/test.exe', 'wb') as f:
    f.write(response)

# clean
app.clean()
```

### [Comments, suggestions, features are welcome.]