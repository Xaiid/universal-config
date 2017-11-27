var Config = /** @class */ (function () {
    function Config() {
        this.setEnvironment();
        this._server = this.getServerVars();
        this._client = this.getClientVars();
        this._localOverrides = this.getLocalOverrides();
        this._store = Object.assign({}, this._client, this._server, this._localOverrides);
    }
    Config.prototype.set = function (key, value) {
        if (key.match(/:/)) {
            var keys_1 = key.split(':');
            var store_key_1 = this._store;
            keys_1.forEach(function (k, i) {
                if (keys_1.length === (i + 1)) {
                    store_key_1[k] = value;
                }
                if (store_key_1[k] === undefined) {
                    store_key_1[k] = {};
                }
                store_key_1 = store_key_1[k];
            });
        }
        else {
            this._store[key] = value;
        }
    };
    Config.prototype.get = function (key) {
        // Is the key a nested object
        if (key.match(/:/)) {
            // Transform getter string into object
            var store_key = this.buildNestedKey(key);
            return store_key;
        }
        // Return regular key
        return this._store[key];
    };
    Config.prototype.has = function (key) {
        return this.get(key) ? true : false;
    };
    Config.prototype.setEnvironment = function () {
        if (typeof (window) == 'object' || process.browser) {
            this._env = 'client';
        }
        else {
            this._env = 'server';
        }
    };
    Config.prototype.getServerVars = function () {
        if (typeof (window) == 'object') {
            return {};
        }
        var serverVars = {};
        serverVars = require('./config/server')();
        if (this._env === 'server') {
            try {
                serverVars = require('./config/server')();
            }
            catch (e) {
                if (typeof (window) == 'object' || process.env.NODE_ENV === 'development') {
                    console.warn("Didn't find a server config in `./config`.");
                }
            }
        }
        return serverVars;
    };
    Config.prototype.getClientVars = function () {
        var clientVars;
        try {
            clientVars = {};
        }
        catch (e) {
            clientVars = {};
            if (typeof (window) == 'object' || process.env.NODE_ENV === 'development') {
                console.warn("Didn't find a client config in `./config`.");
            }
        }
        return clientVars;
    };
    Config.prototype.getLocalOverrides = function () {
        var overrides;
        var filename = (typeof (window) == 'object' || process.env.NODE_ENV === 'production') ? 'prod' : 'dev';
        if (typeof (window) == 'object') {
            return {};
        }
        try {
            overrides = (typeof (window) == 'object' || process.env.NODE_ENV === 'production')
                ? require('./config/prod')()
                : require('./config/dev')();
            console.warn("Using local overrides in `./config/" + filename + ".js`.");
        }
        catch (e) {
            overrides = {};
        }
        return overrides;
    };
    // Builds out a nested key to get nested values
    Config.prototype.buildNestedKey = function (nested_key) {
        // Transform getter string into object
        var keys = nested_key.split(':');
        var store_key = this._store;
        keys.forEach(function (k) {
            try {
                store_key = store_key[k];
            }
            catch (e) {
                return undefined;
            }
        });
        return store_key;
    };
    Config.prototype.getConfigDb = function () {
    };
    return Config;
}());
var config = new Config();
export default config;
