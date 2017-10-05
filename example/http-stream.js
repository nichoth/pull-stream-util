var S = require('pull-stream')
var createServer = require('http').createServer
var HTTPStream = require('../http')
var assert = require('assert')

var Requests = HTTPStream({
    url: 'http://localhost:8000',
    headers: { foo: 'bar' },
    body: { test: 'test' }
})

// pass in a url path ['foo', 'bar'] or nothing
var request = Requests()

var server = createServer(function onRequest (req, res) {
    assert.equal(req.headers.foo, 'bar')
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
        request({ bar: 'baz' }),
        S.collect(function (err, res) {
            console.log('err', err)
            var _res = res.map(function (ev) {
                return {
                    type: ev.type,
                    req: ev.req,
                    body: ev.body
                }
            })
            console.log('res', _res)

            assert.deepEqual(_res, [
                { type: 'start', req: { bar: 'baz' }, body: undefined },
                { type: 'resolve', req: { bar: 'baz' }, body: {
                    hello: 'world' } }
            ])
            server.close()
        })
    )
})



