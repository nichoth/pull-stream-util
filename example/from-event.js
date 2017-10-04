var S = require('pull-stream')
var FromEvent = require('../from-event')
var EE = require('events').EventEmitter

var bus = new EE()

var createFooStream = FromEvent('foo', bus)

bus.emit('foo', 'we havent subscribed yet')

S( createFooStream(), S.log() )

bus.emit('foo', 'this is data')

// ------ curry -------------
var barStream = FromEvent('bar')
S( barStream(bus)(), S.log() )
bus.emit('bar', 'bar data')

