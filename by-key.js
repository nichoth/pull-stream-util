var S = require('pull-stream/pull')

function StreamByKey (sources, sinks) {
    return Object.keys(sources).reduce(function (acc, k) {
        acc[k] = S( sources[k], sinks[k] )
        return acc
    }, {})
}

module.exports = StreamByKey

