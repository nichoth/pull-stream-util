# pull stream util

Helpers for working with pull streams 

## install

    npm install pull-stream-util

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

// --------------------------------------------
// this is data
// bar data
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
S( streams(), S.drain(console.log.bind(console, 'muxed events')) )

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


### mux

```js
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
```

### broadcast

```js
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
```

