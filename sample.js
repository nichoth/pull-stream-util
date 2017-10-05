var curry = require('curry')
var sample = curry(require('pull-with-latest'))

sample.toArray = sample(null)

module.exports = sample

