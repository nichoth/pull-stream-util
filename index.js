module.exports = {
    fromEvent: require('./from-event'),
    fromEmitter: require('./from-emitter'),
    mux: require('./mux'),
    byKey: require('./by-key'),
    HTTP: require('./http'),
    HTTPData: require('./http-data'),
    broadcast: require('./broadcast'),
    join: require('pull-flat-merge'),
    chain: require('pull-flat-merge/chain')
}

