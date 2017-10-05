var S = require('pull-stream/pull')
var Drain = require('pull-stream/sinks/drain')
var Notify = require('pull-notify')

function broadcast (source) {
    var notify = Notify()
    S( source, Drain(notify, notify.abort) )
    return notify.listen
}

module.exports = broadcast

