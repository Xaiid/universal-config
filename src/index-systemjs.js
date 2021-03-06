(function (factory) {

  if ( typeof define === 'function' && define.amd ) {

    // AMD. Register as an anonymous module.
    define([], factory);

  } else if ( typeof exports === 'object' ) {

    // Node/CommonJS
    module.exports = factory();

  } else {

    // Browser globals
    window.config = factory();
  }

}(function( ){

  class Config {
    constructor() {
      this.setEnvironment();

      this._server = this.getServerVars();
      this._client = this.getClientVars();
      this._localOverrides = this.getLocalOverrides();

      this._store = Object.assign({},
        this._client,
        this._server,
        this._localOverrides
      );
    }

    set(key, value) {
      if (key.match(/:/)) {
        const keys = key.split(':');
        let store_key = this._store;

        keys.forEach(function(k, i) {
          if (keys.length === (i + 1)) {
            store_key[k] = value;
          }

          if (store_key[k] === undefined) {
            store_key[k] = {};
          }

          store_key = store_key[k];
        });

      } else {
        this._store[key] = value;
      }
    }

    get(key) {
      // Is the key a nested object
      if (key.match(/:/)) {
        // Transform getter string into object
        const store_key = this.buildNestedKey(key);

        return store_key;
      }

      // Return regular key
      return this._store[key];
    }

    has(key) {
      return this.get(key) ? true : false;
    }

    setEnvironment() {
      if(typeof(window) == 'object' || process.browser) {
        this._env = 'client';
      } else {
        this._env = 'server';
      }
    }

    getServerVars() {
      if(typeof(window) == 'object') {
        return {};
      }

      let serverVars = {};
      serverVars = require('./config/server')();

      if (this._env === 'server') {
        try {
          serverVars = require('./config/server')();
        } catch(e) {
          if (typeof(window) == 'object' || process.env.NODE_ENV === 'development') {
            console.warn(`Didn't find a server config in \`./config\`.`);
          }
        }
      }

      return serverVars;
    }

    getClientVars() {
      let clientVars;

      try {
        clientVars = {};
      } catch(e) {
        clientVars = {};

        if (typeof(window) == 'object' || process.env.NODE_ENV === 'development') {
          console.warn(`Didn't find a client config in \`./config\`.`);
        }
      }

      return clientVars;
    }

    getLocalOverrides() {
      let overrides;
      const filename = (typeof(window) == 'object' || process.env.NODE_ENV === 'production') ? 'prod' : 'dev';

      if(typeof(window) == 'object') {
        return {};
      }

      try {
        overrides = (typeof(window) == 'object' || process.env.NODE_ENV === 'production')
          ? require('./config/prod')()
          : require('./config/dev')();

        console.warn(`Using local overrides in \`./config/${filename}.js\`.`);
      } catch(e) {
        overrides = {};
      }

      return overrides;
    }

    // Builds out a nested key to get nested values
    buildNestedKey(nested_key) {
      // Transform getter string into object
      const keys = nested_key.split(':');
      let store_key = this._store;

      keys.forEach(function(k) {
        try {
          store_key = store_key[k];
        } catch(e) {
          return undefined;
        }
      });

      return store_key;
    }

    getConfigDb(){
    }
  }


  return new Config();
}));

