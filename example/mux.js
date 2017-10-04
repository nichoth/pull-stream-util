var S = require('pull-stream')
var mux = require('../mux')

var streams = {
    foo: S.values(['foo1', 'foo2']),
    bar: S.values(['bar1', 'bar2'])
}

S(
    mux(streams),
    S.log()
)

// ---------------------
// [ 'foo', 'foo1' ]
// [ 'bar', 'bar1' ]
// [ 'foo', 'foo2' ]
// [ 'bar', 'bar2' ]


var pair = mux.namespace('type', 'data')
console.log(pair)  // [ 'type', 'data' ]
console.log(mux.namespace.type(pair))  // 'type'
console.log(mux.namespace.data(pair))  // 'data'


