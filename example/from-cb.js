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

