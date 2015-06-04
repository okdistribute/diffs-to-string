var Transform = require('stream').Transform
var inherits = require('inherits')
var debug = require('debug')('simplediffer')

function addedValue (key, value) {
  debug('added value', key, value)
  return "  + " + key + ': ' + value + '\n'
}

function deletedValue (key, value) {
  debug('deleted value', key, value)
  return "  - " + key + ': ' + value + '\n'
}

function changedValue (key, value1, value2) {
  debug('changed value', key, value1, value2)
  return "  ? " + key + ': ' + value1  + ' -> ' + value2 + '\n'
}

function unchangedValue (key, value) {
  debug('unchanged value', key, value)
  return "    " + key + ': ' + value + '\n'
}


function concatRow (row, operation) {
  debug('contactRow', row, operation)
  var visual = ''
  for (var key in row) {
    if (row.hasOwnProperty(key)) {
      visual += operation(key, row[key])
    }
  }
  return visual
}

function getAllKeys (left, right) {
  var keys = {}

  function addKeys(row) {
    for (var key in row) {
      if (row.hasOwnProperty(key)) {
        keys[key] = 1
      }
    }
  }

  addKeys(left)
  addKeys(right)

  return keys
}


module.exports = simplediffer
module.exports.stream = streamIt

inherits(streamIt, Transform)
function streamIt (getRowValue) {
  /*
  transforms from a diffStream to:
    {
      tables: daff tables,
      visual: the terminal visual for that daff
    }
  */
  if (!(this instanceof streamIt)) return new streamIt(getRowValue)
  Transform.call(this, {objectMode: true})
  this.destroyed = false
  this.getRowValue = getRowValue
}

streamIt.prototype._transform = function (data, enc, next) {
  var self = this
  debug('_transform', data)
  var opts = {
    getRowValue: self.getRowValue
  }
  if (data[0].length) data = data
  else data = [data]
  visual = simplediffer(data, opts)
  next(null, visual)
}

streamIt.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  this.err = err
  this.end()
}

function simplediffer (diffs, opts) {
  // takes a diff stream to new heights
  if (!opts) opts = {}
  if (!opts.getRowValue) opts.getRowValue = function (i) { return i }
  debug('diffs', diffs)
  var visual = ''

  var rowHeader = opts.rowHeader || function (row, i) {
    return 'row ' + (i + 1) + '\n'
  }

  for (var i = 0; i < diffs.length; i++) {
    var row = diffs[i]
    debug('opts', opts)
    debug('row', row)
    visual += rowHeader(row, i)

    var left = row[0] && opts.getRowValue(row[0])
    var right = row[1] && opts.getRowValue(row[1])

    debug('left', left)
    debug('right', right)

    if (!left) visual += concatRow(right, addedValue)
    else if (!right) visual += concatRow(left, deletedValue)
    else {
      var allKeys = getAllKeys(left, right)
      debug('allKeys', allKeys)
      for (var key in allKeys) {
        var leftValue = left[key]
        var rightValue = right[key]
        debug('leftValue', leftValue)
        debug('rightValue', rightValue)
        if (!leftValue && rightValue) {
          visual += addedValue(key, rightValue)
        }
        else if (!rightValue && leftValue) {
          visual += deletedValue(key, leftValue)
        }
        else if (leftValue !== rightValue) {
          visual += changedValue(key, leftValue, rightValue)
        }
        else{
          visual += unchangedValue(key, leftValue)
        }
      }
    }
  }
  return visual
}
