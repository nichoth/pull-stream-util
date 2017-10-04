var S = require('pull-stream/pull')
var many = require('pull-many')
var map = require('pull-stream/throughs/map')
var FromEvent = require('./from-event')

function namespace (type, data) {
    if (!data) return function (_data) {
        return namespace(type, _data)
    }
    return [type, data]
}

function mux (streams) {
    return many(Object.keys(streams).map(function (k) {
        return S( streams[k], map(namespace(k)) )
    }))
}

function FromEmitter (names, bus) {
    function streams () {
        return mux(Object.keys(streams).reduce(function (acc, k) {
            acc[k] = streams[k]()
            return acc
        }, {}))
    }

    names.forEach(function (name) {
        streams[name] = FromEvent(name, bus)
    })

    return streams
}

module.exports = FromEmitter

