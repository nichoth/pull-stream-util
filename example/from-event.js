var S = require('pull-stream')
var test = require('tape')
var EE = require('events').EventEmitter
var FromEvent = require('../from-event')

test('from event', function (assert) {
    assert.plan(4)
    var bus = new EE()
    var fooStream = FromEvent('foo', bus)
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

