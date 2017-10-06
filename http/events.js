function Start (req) {
    return { type: 'start', req: req }
}

function ErrorEvent (req, err) {
    return { type: 'error', err: err, req: req }
}

function Resolve (req, res, body) {
    return { type: 'resolve', req: req, res: res, body: body }
}

module.exports = {
    Start: Start,
    ErrorEvent: ErrorEvent,
    Resolve: Resolve
}

