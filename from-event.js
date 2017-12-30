var Pushable = require('pull-pushable')

function FromEvent (name, emitter, onEnd) {
    if (!emitter) return function (ee, _onEnd) {
        return FromEvent(name, ee, _onEnd)
    }

    var stream = Pushable(function onStreamEnd (err) {
        emitter.removeListener(name, stream.push)
        if (typeof onEnd === 'function') onEnd(err)
    })

    emitter.on(name, stream.push)
    return stream
}

module.exports = FromEvent

