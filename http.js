var xtend = require('xtend')
var async = require('pull-async')
var cat = require('pull-cat')
var once = require('pull-stream/sources/once')
var HTTPCall = require('./lib/http')
var S = require('pull-stream/pull')
var map = require('pull-stream/throughs/map')

function httpStream (fn, onErr) {
    return function (req) {
        var result$ = async(function (cb) {
            if (req) fn(req, onResponse)
            else fn(onResponse)

            function onResponse (err, resp, body) {
                if (err) {
                    if (onErr) return cb(null, onErr(err, req))
                    return cb(err)
                }

                cb(null, {
                    type: 'resolve',
                    req: req,
                    res: resp,
                    body: body
                })
            }
        })

        return cat([
            once({
                type: 'start',
                req: req
            }),
            result$
        ])
    }
}

function _onErr (err, req) {
    return {
        type: 'error',
        req: req,
        err: err
    }
}

function fromObject (fns) {
    var cid = 0

    return Object.keys(fns).reduce(function (acc, k) {
        return acc[k] = function (args) {
            var _id = cid++
            var reqStream = fns[k](args)

            return S(
                reqStream,
                map(function (ev) {
                    return [k, xtend(ev, {
                        cid: _id
                    })]
                })
            )
        }
    }, {})
}

function HTTPStream (opts, onErr) {
    onErr = onErr === undefined ? _onErr : onErr
    var call = HTTPCall(opts)
    return function startStream (url, body) {
        if (!body) return function (_body) {
            return startStream(url, _body)
        }
        return httpStream(call(url), onErr)(body)
    }
}

HTTPStream.fromAsyncFunction = httpStream
HTTPStream.fromObject = fromObject

module.exports = HTTPStream

