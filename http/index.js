var S = require('pull-stream/pull')
var map = require('pull-stream/throughs/map')
var async = require('pull-async')
var cat = require('pull-cat')
var once = require('pull-stream/sources/once')
var xhr = require('request')
var HTTPData = require('../http-data')

function Err (err, data) {
    return {
        type: 'error',
        err: err,
        req: data
    }
}

function HTTPStream (data, onErr) {
    onErr = onErr === undefined ? Err : onErr

    var response$ = async(function (cb) {
        xhr(data, function onResponse (err, resp, body) {
            if (err) {
                if (onErr) return cb(null, onErr(err, data))
                return cb(err)
            }

            cb(null, {
                type: 'resolve',
                req: data,
                res: resp,
                body: body
            })
        })
    })

    return cat([
        once({
            type: 'start',
            req: data
        }),
        response$
    ])
}

// take http opts and an object of path segments
// return an object of functions that return streams of
// http events namespaced by key
function fromObject (opts, paths) {
    var Request = HTTPData(opts)
    if (!paths) return function (_paths) {
        return fromObject(opts, _paths)
    }

    var cid = 0
    return Object.keys(paths).reduce(function (acc, k) {
        acc[k] = function (args) {
            var _id = cid++
            return S(
                HTTPStream(Request(paths[k], args)),
                map(function (ev) {
                    ev.cid = _id
                    return [k, ev]
                })
            )
        }

        return acc
    }, {})
}

// for request/response semantics
function AddId (prop) {
    prop = prop || cid
    var cid = 0
    return function addId () {
        var _id = cid++
        return function (data) {
            data[prop] = _id
            return data
        }
    }
}

HTTPStream.FromObject = fromObject
HTTPStream.AddId = AddId
module.exports = HTTPStream

