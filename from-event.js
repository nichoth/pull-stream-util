var Notify = require('pull-notify')

function FromEvent (name, emitter) {
    if (!emitter) return function (ee) {
        return FromEvent(name, ee)
    }
    var stream = Notify()
    emitter.on(name, stream)
    return stream.listen
}

module.exports = FromEvent

