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
  for (var key in left) {
    if (left.hasOwnProperty(key)) {
      keys[key] = 1
    }
  }

  for (var key in right) {
    if (right.hasOwnProperty(key)) {
      keys[key] = 1
    }
  }

  return keys
}

function simplediffer (changes, opts, cb) {
  // takes a diff stream to new heights
  if (!cb) cb = opts
  debug('changes', changes)
  var visual = ''

  for (var i = 0; i < changes.length; i++) {
    visual += 'row ' + (i + 1) + '\n'

    var row = changes[i]
    var left = row[0]
    var right = row[1]
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
  cb(changes, visual)
}

module.exports = simplediffer
