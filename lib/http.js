var xhr = require('request')
var xtend = require('xtend')
var urlJoin = require('url-join')

var _xhrOpts = {
    method: 'POST',
    json: true
}

function HTTPCall (xhrOpts) {
    var opts = xtend(_xhrOpts, xhrOpts)
    return function (url) {

        return function httpCall (req, cb) {
            if (typeof req === 'function') {
                cb = req
                req = {}
            }
            if (!cb) return function (_cb) {
                return httpCall(req, _cb)
            }

            var _url = urlJoin.apply(null, (opts.url ?
                [opts.url] : []).concat(url))
            xhr(xtend(opts, {
                url: _url,
                body: xtend(opts.body, req)
            }), function onResponse (err, resp, body) {
                if (err) return cb(err)
                cb(null, resp, body)
            })
        }
    }

}

module.exports = HTTPCall

