var createServer = require('http').createServer
var HTTP = require('../lib/http')
var assert = require('assert')

var server = createServer(function onRequest (req, res) {
    assert.equal(req.headers.foo, 'bar')

    var data = ''
    req.on('data', function (d) {
        data += d
    })
    req.on('end', function () {
        assert.deepEqual(JSON.parse(data), {
            test: 'test',
            foo: 'bar'
        }, 'merge request body data')
    })

    if (req.url === '/foo/bar') {
        res.end(JSON.stringify({ footest: 'footest' }))
    }


    res.end('{ "hello": "world" }')
})

var Request = HTTP({
    url: 'http://localhost:8000',
    headers: {
        'Foo': 'bar'
    },
    body: { test: 'test' }
})

var request = Request()
var fooRequest = Request(['foo', 'bar'])

server.listen(8000, function () {
    request({ foo: 'bar' }, function (err, resp, body) {
        assert(!err)
        assert.deepEqual(body, {
            hello: 'world'
        })
        console.log('response', err, body)
        doFoo()
    })

})

function doFoo () {
    fooRequest({ foo: 'bar' })(function (err, resp, body) {
        assert(!err)
        assert.deepEqual(body, {
            footest: 'footest'
        })
        console.log('foo response', err, body)
        server.close()
    })
}

