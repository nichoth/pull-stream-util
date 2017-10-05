# pull stream util

Helpers for working with pull streams 

## install

    npm install pull-stream-util

## examples

### from event

Create a stream from a single node style event

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

Take an event emitter and return a stream of it's events 

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

Take an object of streams and return a single stream of their values,
namespaced by key 

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

Take a source stream and pipe it to multiple subscribers

```js

var S = require('pull-stream')
var broadcast = require('../broadcast')
var assert = require('assert')

// source *must* be async, or else it will drain before we subscribe
var source = S(
    S.values([1,2,3]),
    S.asyncMap((n, cb) => process.nextTick(cb.bind(null, null, n)))
)

// take a normal source, return a function that returns a clone of
// the source
var _source = broadcast(source)

S( _source(), S.log() )
S( _source(), S.map(n => n + 'a'), S.log(function onEnd () {
    doObject()
}) )

// -------------------------------
// 1
// 1a
// 2
// 2a
// 3
// 3a

S( _source(), S.collect(function (err, res) {
    assert(!err)
    assert.deepEqual(res, [1,2,3])
}) )


function doObject () {
    var streams = {
        a: S(
            S.values(['1aa','2aa','3aa']),
            S.asyncMap((n, cb) => process.nextTick(cb.bind(null, null, n)))
        ),
        b: S(
            S.values(['1bb','2bb','3bb']),
            S.asyncMap((n, cb) => process.nextTick(cb.bind(null, null, n)))
        )
    }

    // pass in an object of streams
    // return a function that creates an object of clones
    var createStreams = broadcast(streams)
    var _streams = createStreams()
    S( _streams.a, S.collect(function (err, res) {
        assert(!err)
        assert.deepEqual(res, [ '1aa', '2aa', '3aa' ])
    }) )
    S( _streams.b, S.collect(function (err, res) {
        assert(!err)
        assert.deepEqual(res, [ '1bb', '2bb', '3bb' ])
    }) )

    // --------------------------------
    // 1aa
    // 1bb
    // 2aa
    // 2bb
    // 3aa
    // 3bb
}
```

### by key

Pipe an object of sources to an object of sinks

```js
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

// ------------------------
// foo1
// foo2
// foo3
// bar1
// bar2
// bar3
```

### http

Create streams of http events from objects of request data

```js
var S = require('pull-stream')
var createServer = require('http').createServer
var HTTPStream = require('../http')
var HTTPData = require('../http-data')
var assert = require('assert')

// xhr args
var RequestData = HTTPData({
    url: 'http://localhost:8000',
    headers: { foo: 'bar' },
    body: { test: 'test' },
    method: 'POST',
    json: true
})

// path and request body
var requestData = RequestData(['foo'], { bar: 'baz' })

var server = createServer(function onRequest (req, res) {
    assert.equal(req.headers.foo, 'bar')
    assert.equal(req.url, '/foo')

    var data = ''
    req.on('data', function (d) {
        data += d
    })
    req.on('end', function () {
        assert.deepEqual(JSON.parse(data), {
            test: 'test',
            bar: 'baz'
        })
    })

    res.end(JSON.stringify({ hello: 'world' }))
})

server.listen(8000, function () {
    S(
        HTTPStream(requestData),
        S.collect(function (err, res) {
            var resData = res.map(function (ev) {
                return {
                    type: ev.type,
                    reqBody: ev.req.body,
                    body: ev.body
                }
            })

            assert.deepEqual(resData, [
                {
                    type: 'start',
                    reqBody: { test: 'test', bar: 'baz' },
                    body: undefined
                },
                {
                    type: 'resolve',
                    reqBody: { test: 'test', bar: 'baz' },
                    body: { hello: 'world' }
                }
            ])

            console.log('http stream', err, resData)
            server.close()
        })
    )
})
```

### http data

Helper for creating request data

```js
var HttpRequest = require('../http-data')
var assert = require('assert')

// take this data and return a new function
var RequestData = HttpRequest({
    url: 'http://localhost:8000',
    method: 'POST',
    headers: { foo: 'bar' },
    body: { a: 'b' },
    json: true
})

// merge this argument with the request body from above, 
// return new request object
var data = RequestData({ test: 'test' })
console.log(data)
assert.deepEqual(data, {
    url: 'http://localhost:8000',
    method: 'POST',
    headers: { foo: 'bar' },
    body: { a: 'b', test: 'test' },
    json: true
})

// pass an array to add path segments to the `url` key,
// return a new function
var FooRequest = RequestData(['foo'])

// add body data, return request data
var fooData = FooRequest({ hello: 'world' })
console.log(fooData)
assert.deepEqual(fooData, {
    url: 'http://localhost:8000/foo',
    method: 'POST',
    headers: { foo: 'bar' },
    body: { a: 'b', hello: 'world' },
    json: true
})
```



