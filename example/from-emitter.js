var S = require('pull-stream')
var FromEmitter = require('../from-emitter')
var EE = require('events').EventEmitter

var bus = new EE()
var streams = FromEmitter(['foo', 'bar', 'baz'], bus)

S( streams.foo(), S.log() )

bus.emit('foo', 'this is the foos')

// all events namespaced by key
S( streams(), S.drain(console.log.bind(console, 'muxed events')) )

bus.emit('foo', 'foo event')
bus.emit('bar', 'bar event')
bus.emit('baz', 'baz event')

