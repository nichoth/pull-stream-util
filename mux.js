var S = require('pull-stream/pull')
var many = require('pull-many')
var map = require('pull-stream/throughs/map')

function namespace (type, data) {
    if (!data) return function (_data) {
        return namespace(type, _data)
    }
    return [type, data]
}

namespace.type = function (ev) {
    return ev[0]
}

namespace.data = function (ev) {
    return ev[1]
}

function mux (streams) {
    return many(Object.keys(streams).map(function (k) {
        return S( streams[k], map(namespace(k)) )
    }))
}

mux.namespace = namespace
module.exports = mux

