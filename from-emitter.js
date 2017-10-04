var mux = require('./mux')
var FromEvent = require('./from-event')

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

