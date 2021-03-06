# pull stream util

Helpers for working with pull streams 

* [from event](#from-event)
* [from emitter](#from-emitter)
* [mux](#mux)
* [broadcast](#broadcast)
* [by key](#by-key)
* [http](#http)
* [http data](#http-data)
* [from cb](#from-cb)

-----------------------------

* cat
* chain
* combine latest
* join
* many
* notify
* sample
* scan

## install

    npm install pull-stream-util


## examples

### from event

Create a stream from a single node style event

```js
var S = require('pull-stream')
var test = require('tape')
var EE = require('events').EventEmitter
var FromEvent = require('../from-event')

test('from event', function (assert) {
    assert.plan(4)
    var bus = new EE()
    var fooStream = FromEvent('foo', bus)

    // this event will be buffered and emitted when the stream is drained
    bus.emit('foo', 'hello')

    S(
        fooStream,
        S.through(console.log.bind(console)),
        S.collect(function (err, res) {
            assert.equal(err, null)
            assert.deepEqual(res, ['hello', 'world'])
        })
    )

    bus.emit('foo', 'world')
    bus.on('removeListener', function (fn) {
        assert.pass('should remove listener on stream end')
    })

    // end the stream and remove the listener from the event emitter
    fooStream.end()

    // ------ curry -------------
    var barStream = FromEvent('bar')
    S(
        barStream(bus),
        S.through(console.log.bind(console)),
        S.drain(function (ev) {
            assert.deepEqual(ev, 'bar data')
        })
    )
    bus.emit('bar', 'bar data')
})


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


### from cb

Take an async (node style) function, and return a function that returns streams of http events, just like the http request stream in this module.

```js
var assert = require('assert')
var fromCb = require('../http/from-cb')
var S = require('pull-stream')

function echo (data, cb) {
    process.nextTick(cb.bind(null, null, data))
}

S(
    fromCb(echo)('hello'),
    S.collect(function (err, res) {
        console.log(res)
        assert.deepEqual(res, [
            { type: 'start', req: 'hello' },
            { type: 'resolve', req: 'hello', res: 'hello', body: undefined }
        ])
    })
)
```




