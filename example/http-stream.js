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

