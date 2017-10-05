var xtend = require('xtend')
var urlJoin = require('url-join')

function HttpRequest (opts, path, body) {
    if (path === undefined) return function (_path, _body) {
        return HttpRequest(opts, _path, _body)
    }

    if (Array.isArray(path) && !body) {
        return function (_body) {
            return HttpRequest(opts, path, _body || {})
        }
    }

    if (path && !Array.isArray(path)) {
        body = path
        path = []
    }

    var _url = [opts.url || opts.uri].concat(path ? path : [])
    return xtend(opts, {
        url: urlJoin.apply(null, _url),
        body: xtend(opts.body || {}, body)
    })
}

module.exports = HttpRequest

