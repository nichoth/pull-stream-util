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



