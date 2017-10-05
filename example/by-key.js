var S = require('pull-stream')
var SS = require('../by-key')

var sources = {
    foo: S.values(['foo1', 'foo2', 'foo3']),
    bar: S.values(['bar1', 'bar2', 'bar3'])
}

var sinks = {
    foo: S.log(),
    bar: S.log()
}

SS(sources, sinks)

