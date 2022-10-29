# Backend Coding Challenge
Set up a simple web service to implement a calculator. The service offers an endpoint that reads a string input and parses it. It should return either an HTTP error code, or a solution to the calculation in JSON form. Furthermore, the service should offer the possibility to return the last 5 calculations with their results.
Supported mathematical symbols are `+, -, *, /, (, )`

An example calculus query:
```
query: 2 * (23/(3*3))- 23 * (2*3)
encoded: MiAqICgyMy8oMyozKSktIDIzICogKDIqMyk=
```



## API Description

**Endpoints:**
```
GET /calculus?query=[input]
```

The input can be expected to be UTF-8 with BASE64 encoding

**Result** 
* On success: JSON response of format: `{ "error": false, "result": number }`
* On error: Either a HTTP error code or: `{ "error": true, "message": "string" }`
 
 <br />

```
GET /calculus/history
```

**Result**
* On success: ___Find a suitable scheme yourself___
* On error: Either a HTTP error code or: `{ "error": true, "message": "string" }`

<br />
<br />

## Rules
* Ideally use TypeScript
* Ideally use Docker to run node.js
* Add unit tests where it makes sense
* Add integration tests where it makes sense
* When writing your code, imagine the service is meant to be released to production (with a low-to-moderate expected load)
* Come up with a deployment strategy to a Cloud provider