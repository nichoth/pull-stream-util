# pull stream util

Helpers for working with pull streams 

## install

npm i -S pull-stream-util

## examples

### from event

```js
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
```


### from emitter

```js
var S = require('pull-stream')
var FromEmitter = require('../from-emitter')
var EE = require('events').EventEmitter

var bus = new EE()
var streams = FromEmitter(['foo', 'bar', 'baz'], bus)

S( streams.foo(), S.log() )

bus.emit('foo', 'this is the foos')

// all events namespaced by key
S( streams(), S.drain(function (ev) {
    console.log('muxed events', ev)
}) )

bus.emit('foo', 'foo event')
bus.emit('bar', 'bar event')
bus.emit('baz', 'baz event')

// ---------------------------------------------
// this is the foos
// foo event
// muxed events [ 'foo', 'foo event' ]
// muxed events [ 'bar', 'bar event' ]
// muxed events [ 'baz', 'baz event' ]
```



