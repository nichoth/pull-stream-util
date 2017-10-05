var S = require('pull-stream/pull')
var Drain = require('pull-stream/sinks/drain')
var Notify = require('pull-notify')

function broadcast (source) {
    if (typeof source === 'object') return fromObject(source)
    var notify = Notify()
    S( source, Drain(notify, notify.abort) )
    return notify.listen
}

function fromObject (streams) {
    var clone = Object.keys(streams).reduce(function (acc, k) {
        acc[k] = broadcast(streams[k])
        return acc
    }, {})

    return function () {
        return Object.keys(clone).reduce(function (acc, k) {
            acc[k] = clone[k]()
            return acc
        }, {})
    }
}

module.exports = broadcast

