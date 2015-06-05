# diffs-to-string

Turns an array of diffs into a string. You can generate a changes stream by using [sorted-diff-stream](github.com/maxogden/sorted-diff-stream).

[![NPM](https://nodei.co/npm/diffs-to-string.png)](https://nodei.co/npm/diffs-to-string/)

### basic example
```js
var diffs2string = require('diffs-to-string')

var changes = [
  [ { country: 'germany', capital: null },
    { country: 'germany', code: 'de', capital: 'berlin' } ],
  [ { country: 'ireland', capital: 'dublin' },
    { country: 'ireland', code: 'ie', capital: 'dublin' } ],
  [ { country: 'france', capital: 'paris' },
    { country: null, code: 'fr', capital: 'paris'} ],
  [ { country: 'spain', capital: 'madrid' },
    { country: 'spain', code: 'es', capital: 'barcelona' } ]
]

var visual = diffs2string(changes)
console.log(visual)
```

Outputs:

```
row 1
    country: germany
  + capital: berlin
  + code: de
row 2
    country: ireland
    capital: dublin
  + code: ie
row 3
  - country: france
    capital: paris
  + code: fr
row 4
    country: spain
  ? capital: madrid -> barcelona
  + code: es
```


### with streams
```js
var diffs2string = require('diffs-to-string').stream
var diffStream = from.obj(changes)

diffStream.pipe(diffs2string())
```

### custom row path and row header

```js
function getRowValue (row) {
  return row.value
}

function getRowHeader (diff) {
  return 'this is row ' + diff['some-value'] + '\n'
}

var opts = {
  getRowValue: getRowValue,
  getRowHeader: getRowHeader
}

diffStream.pipe(diffs2string.stream(opts))
var visual = diffs2string(changes, opts)
```
