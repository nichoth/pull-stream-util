var S = require('pull-stream/pull')
var filter = require('pull-stream/throughs/filter')
var scan = require('pull-scan')

function _scan (predicate, init) {
    if (typeof predicate === 'object') {
        return S(
            filter(function (ev) {
                return predicate[ev[0]]
            }),

            // scan from a pair of [keyName, argument]
            scan(function (state, ev) {
                var fn = predicate[ev[0]]
                return fn(state, ev[1])
            }, init)
        )
    }

    return scan(predicate, init)
}

module.exports = _scan
