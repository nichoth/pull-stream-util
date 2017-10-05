var S = require('pull-stream')
var broadcast = require('../broadcast')

// source *must* be async, or else it will drain before we subscribe
var source = S(
    S.values([1,2,3]),
    S.asyncMap((n, cb) => process.nextTick(cb.bind(null, null, n)))
)

// take a normal source, return a function that returns a clone of
// the source
var _source = broadcast(source)

S( _source(), S.log() )
S( _source(), S.map(n => n + 'a'), S.log() )

