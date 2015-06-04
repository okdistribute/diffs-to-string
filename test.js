var test = require('tape')
var through = require('through2')
var from = require('from2')
var batcher = require('byte-stream')
var diffs2string = require('./')

var changes = [
  [ { country: 'germany', capital: null },
    { country: 'germany', code: 'de', capital: 'berlin' } ],
  [ { country: 'ireland', capital: 'dublin' },
    { country: 'ireland', code: 'ie', capital: 'dublin' } ],
  [ { country: 'france', capital: 'paris' },
    { country: null, code: 'fr', capital: 'paris'} ],
  [ { country: 'spain', capital: 'madrid' },
    { country: 'spain', code: 'es', capital: 'barcelona' }],
  [ null,
    { country: 'united states', code: 'us', capital: 'washington'}]
]
var visual = diffs2string(changes)
var lines = visual.split('\n')

test('add prints correctly', function (t) {
  t.equals(lines[0], "row 1")
  t.equals(lines[1], "    country: germany")
  t.equals(lines[2], "  + capital: berlin")
  t.equals(lines[3], "  + code: de")
  t.equals(lines[4], "row 2")
  t.end()
})

test('add row prints correctly', function (t) {
  t.equals(lines[19], '  + capital: washington')
  t.end()
})

test('custom header row prints correctly', function (t) {
  var opts = {
    rowHeader: function (diff, i) {
      var arow = diff && diff[0] || diff[1]
      return 'haha im a row header ' + arow['country'] + '\n'
    }
  }
  var visual = diffs2string(changes, opts)
  var lines = visual.split('\n')
  t.equals(lines[0], 'haha im a row header germany')
  t.end()
})

test('change prints correctly', function (t) {
  t.equals(lines[14], "  ? capital: madrid -> barcelona")
  t.end()
})

test('delete prints correctly', function (t) {
  t.equals(lines[9], "  - country: france")
  t.end()
})

test('stream prints correctly with a batcher', function (t) {
  var diffStream = from.obj(changes).pipe(batcher(1))
  diffStream.pipe(diffs2string.stream()).pipe(through.obj(function (data, enc, next) {
    var these_lines = data.split('\n')
    t.equals(these_lines[0], "row 1")
    t.equals(these_lines[1], "    country: germany")
    t.equals(these_lines[2], "  + capital: berlin")
    t.equals(these_lines[3], "  + code: de")
    t.equals()
  }))

  t.end()
})

test('stream prints correctly with uptype to array of ararys', function (t) {
  var diffStream = from.obj(changes)
  diffStream.pipe(diffs2string.stream()).pipe(through.obj(function (data, enc, next) {
    var these_lines = data.split('\n')
    t.equals(these_lines[0], "row 1")
    t.equals(these_lines[1], "    country: germany")
    t.equals(these_lines[2], "  + capital: berlin")
    t.equals(these_lines[3], "  + code: de")
    t.equals()
  }))

  t.end()
})