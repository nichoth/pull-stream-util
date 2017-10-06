var async = require('pull-async')
var cat = require('pull-cat')
var once = require('pull-stream/sources/once')
var evs = require('./events')
var Start = evs.Start
var ErrorEvent = evs.ErrorEvent
var Resolve = evs.Resolve

function fromCallback (fn) {
    return function (data) {
        return cat([
            once(Start(data)),
            async(function (cb) {
                fn(data, function (err, res) {
                    if (err) return cb(null, ErrorEvent(data, err))
                    return cb(null, Resolve(data, res, res.body))
                })
            })
        ])
    }
}

module.exports = fromCallback

