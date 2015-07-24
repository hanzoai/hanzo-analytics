(function (global) {
  var process = {
    title: 'browser',
    browser: true,
    env: {},
    argv: [],
    nextTick: function (fn) {
      setTimeout(fn, 0)
    },
    cwd: function () {
      return '/'
    },
    chdir: function () {
    }
  };
  // Require module
  function require(file, callback) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    // Handle async require
    if (typeof callback == 'function') {
      require.load(file, callback);
      return
    }
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
      id: file,
      require: require,
      filename: file,
      exports: {},
      loaded: false,
      parent: null,
      children: []
    };
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0
  };
  // define normal static module
  require.define = function (file, fn) {
    require.modules[file] = fn
  };
  // source: /Users/dtai/work/verus/espy/node_modules/store/store.js
  require.define('store/store', function (module, exports, __dirname, __filename) {
    ;
    (function (win) {
      var store = {}, doc = win.document, localStorageName = 'localStorage', scriptTag = 'script', storage;
      store.disabled = false;
      store.version = '1.3.17';
      store.set = function (key, value) {
      };
      store.get = function (key, defaultVal) {
      };
      store.has = function (key) {
        return store.get(key) !== undefined
      };
      store.remove = function (key) {
      };
      store.clear = function () {
      };
      store.transact = function (key, defaultVal, transactionFn) {
        if (transactionFn == null) {
          transactionFn = defaultVal;
          defaultVal = null
        }
        if (defaultVal == null) {
          defaultVal = {}
        }
        var val = store.get(key, defaultVal);
        transactionFn(val);
        store.set(key, val)
      };
      store.getAll = function () {
      };
      store.forEach = function () {
      };
      store.serialize = function (value) {
        return JSON.stringify(value)
      };
      store.deserialize = function (value) {
        if (typeof value != 'string') {
          return undefined
        }
        try {
          return JSON.parse(value)
        } catch (e) {
          return value || undefined
        }
      };
      // Functions to encapsulate questionable FireFox 3.6.13 behavior
      // when about.config::dom.storage.enabled === false
      // See https://github.com/marcuswestin/store.js/issues#issue/13
      function isLocalStorageNameSupported() {
        try {
          return localStorageName in win && win[localStorageName]
        } catch (err) {
          return false
        }
      }
      if (isLocalStorageNameSupported()) {
        storage = win[localStorageName];
        store.set = function (key, val) {
          if (val === undefined) {
            return store.remove(key)
          }
          storage.setItem(key, store.serialize(val));
          return val
        };
        store.get = function (key, defaultVal) {
          var val = store.deserialize(storage.getItem(key));
          return val === undefined ? defaultVal : val
        };
        store.remove = function (key) {
          storage.removeItem(key)
        };
        store.clear = function () {
          storage.clear()
        };
        store.getAll = function () {
          var ret = {};
          store.forEach(function (key, val) {
            ret[key] = val
          });
          return ret
        };
        store.forEach = function (callback) {
          for (var i = 0; i < storage.length; i++) {
            var key = storage.key(i);
            callback(key, store.get(key))
          }
        }
      } else if (doc.documentElement.addBehavior) {
        var storageOwner, storageContainer;
        // Since #userData storage applies only to specific paths, we need to
        // somehow link our data to a specific path.  We choose /favicon.ico
        // as a pretty safe option, since all browsers already make a request to
        // this URL anyway and being a 404 will not hurt us here.  We wrap an
        // iframe pointing to the favicon in an ActiveXObject(htmlfile) object
        // (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
        // since the iframe access rules appear to allow direct access and
        // manipulation of the document element, even for a 404 page.  This
        // document can be used instead of the current document (which would
        // have been limited to the current path) to perform #userData storage.
        try {
          storageContainer = new ActiveXObject('htmlfile');
          storageContainer.open();
          storageContainer.write('<' + scriptTag + '>document.w=window</' + scriptTag + '><iframe src="/favicon.ico"></iframe>');
          storageContainer.close();
          storageOwner = storageContainer.w.frames[0].document;
          storage = storageOwner.createElement('div')
        } catch (e) {
          // somehow ActiveXObject instantiation failed (perhaps some special
          // security settings or otherwse), fall back to per-path storage
          storage = doc.createElement('div');
          storageOwner = doc.body
        }
        var withIEStorage = function (storeFunction) {
          return function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(storage);
            // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
            // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
            storageOwner.appendChild(storage);
            storage.addBehavior('#default#userData');
            storage.load(localStorageName);
            var result = storeFunction.apply(store, args);
            storageOwner.removeChild(storage);
            return result
          }
        };
        // In IE7, keys cannot start with a digit or contain certain chars.
        // See https://github.com/marcuswestin/store.js/issues/40
        // See https://github.com/marcuswestin/store.js/issues/83
        var forbiddenCharsRegex = new RegExp('[!"#$%&\'()*+,/\\\\:;<=>?@[\\]^`{|}~]', 'g');
        function ieKeyFix(key) {
          return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
        }
        store.set = withIEStorage(function (storage, key, val) {
          key = ieKeyFix(key);
          if (val === undefined) {
            return store.remove(key)
          }
          storage.setAttribute(key, store.serialize(val));
          storage.save(localStorageName);
          return val
        });
        store.get = withIEStorage(function (storage, key, defaultVal) {
          key = ieKeyFix(key);
          var val = store.deserialize(storage.getAttribute(key));
          return val === undefined ? defaultVal : val
        });
        store.remove = withIEStorage(function (storage, key) {
          key = ieKeyFix(key);
          storage.removeAttribute(key);
          storage.save(localStorageName)
        });
        store.clear = withIEStorage(function (storage) {
          var attributes = storage.XMLDocument.documentElement.attributes;
          storage.load(localStorageName);
          for (var i = 0, attr; attr = attributes[i]; i++) {
            storage.removeAttribute(attr.name)
          }
          storage.save(localStorageName)
        });
        store.getAll = function (storage) {
          var ret = {};
          store.forEach(function (key, val) {
            ret[key] = val
          });
          return ret
        };
        store.forEach = withIEStorage(function (storage, callback) {
          var attributes = storage.XMLDocument.documentElement.attributes;
          for (var i = 0, attr; attr = attributes[i]; ++i) {
            callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
          }
        })
      }
      try {
        var testKey = '__storejs__';
        store.set(testKey, testKey);
        if (store.get(testKey) != testKey) {
          store.disabled = true
        }
        store.remove(testKey)
      } catch (e) {
        store.disabled = true
      }
      store.enabled = !store.disabled;
      if (typeof module != 'undefined' && module.exports && this.module !== module) {
        module.exports = store
      } else if (typeof define === 'function' && define.amd) {
        define(store)
      } else {
        win.store = store
      }
    }(Function('return this')()))
  });
  // source: /Users/dtai/work/verus/espy/node_modules/cookies-js/dist/cookies.js
  require.define('cookies-js/dist/cookies', function (module, exports, __dirname, __filename) {
    /*
 * Cookies.js - 1.2.1
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
    (function (global, undefined) {
      'use strict';
      var factory = function (window) {
        if (typeof window.document !== 'object') {
          throw new Error('Cookies.js requires a `window` with a `document` object')
        }
        var Cookies = function (key, value, options) {
          return arguments.length === 1 ? Cookies.get(key) : Cookies.set(key, value, options)
        };
        // Allows for setter injection in unit tests
        Cookies._document = window.document;
        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.';
        // Hurr hurr, :)
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');
        Cookies.defaults = {
          path: '/',
          secure: false
        };
        Cookies.get = function (key) {
          if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
            Cookies._renewCache()
          }
          return Cookies._cache[Cookies._cacheKeyPrefix + key]
        };
        Cookies.set = function (key, value, options) {
          options = Cookies._getExtendedOptions(options);
          options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);
          Cookies._document.cookie = Cookies._generateCookieString(key, value, options);
          return Cookies
        };
        Cookies.expire = function (key, options) {
          return Cookies.set(key, undefined, options)
        };
        Cookies._getExtendedOptions = function (options) {
          return {
            path: options && options.path || Cookies.defaults.path,
            domain: options && options.domain || Cookies.defaults.domain,
            expires: options && options.expires || Cookies.defaults.expires,
            secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure
          }
        };
        Cookies._isValidDate = function (date) {
          return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())
        };
        Cookies._getExpiresDate = function (expires, now) {
          now = now || new Date;
          if (typeof expires === 'number') {
            expires = expires === Infinity ? Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000)
          } else if (typeof expires === 'string') {
            expires = new Date(expires)
          }
          if (expires && !Cookies._isValidDate(expires)) {
            throw new Error('`expires` parameter cannot be converted to a valid Date instance')
          }
          return expires
        };
        Cookies._generateCookieString = function (key, value, options) {
          key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
          key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
          value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
          options = options || {};
          var cookieString = key + '=' + value;
          cookieString += options.path ? ';path=' + options.path : '';
          cookieString += options.domain ? ';domain=' + options.domain : '';
          cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
          cookieString += options.secure ? ';secure' : '';
          return cookieString
        };
        Cookies._getCacheFromString = function (documentCookie) {
          var cookieCache = {};
          var cookiesArray = documentCookie ? documentCookie.split('; ') : [];
          for (var i = 0; i < cookiesArray.length; i++) {
            var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);
            if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
              cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value
            }
          }
          return cookieCache
        };
        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
          // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
          var separatorIndex = cookieString.indexOf('=');
          // IE omits the "=" when the cookie value is an empty string
          separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;
          return {
            key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
            value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
          }
        };
        Cookies._renewCache = function () {
          Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
          Cookies._cachedDocumentCookie = Cookies._document.cookie
        };
        Cookies._areEnabled = function () {
          var testKey = 'cookies.js';
          var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
          Cookies.expire(testKey);
          return areEnabled
        };
        Cookies.enabled = Cookies._areEnabled();
        return Cookies
      };
      var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;
      // AMD support
      if (typeof define === 'function' && define.amd) {
        define(function () {
          return cookiesExport
        })  // CommonJS/Node.js support
      } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
          exports = module.exports = cookiesExport
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport
      } else {
        global.Cookies = cookiesExport
      }
    }(typeof window === 'undefined' ? this : window))
  });
  // source: /Users/dtai/work/verus/espy/node_modules/ua-parser-js/src/ua-parser.js
  require.define('ua-parser-js/src/ua-parser', function (module, exports, __dirname, __filename) {
    /**
 * UAParser.js v0.7.9
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */
    (function (window, undefined) {
      'use strict';
      //////////////
      // Constants
      /////////////
      var LIBVERSION = '0.7.9', EMPTY = '', UNKNOWN = '?', FUNC_TYPE = 'function', UNDEF_TYPE = 'undefined', OBJ_TYPE = 'object', STR_TYPE = 'string', MAJOR = 'major',
        // deprecated
        MODEL = 'model', NAME = 'name', TYPE = 'type', VENDOR = 'vendor', VERSION = 'version', ARCHITECTURE = 'architecture', CONSOLE = 'console', MOBILE = 'mobile', TABLET = 'tablet', SMARTTV = 'smarttv', WEARABLE = 'wearable', EMBEDDED = 'embedded';
      ///////////
      // Helper
      //////////
      var util = {
        extend: function (regexes, extensions) {
          for (var i in extensions) {
            if ('browser cpu device engine os'.indexOf(i) !== -1 && extensions[i].length % 2 === 0) {
              regexes[i] = extensions[i].concat(regexes[i])
            }
          }
          return regexes
        },
        has: function (str1, str2) {
          if (typeof str1 === 'string') {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1
          } else {
            return false
          }
        },
        lowerize: function (str) {
          return str.toLowerCase()
        },
        major: function (version) {
          return typeof version === STR_TYPE ? version.split('.')[0] : undefined
        }
      };
      ///////////////
      // Map helper
      //////////////
      var mapper = {
        rgx: function () {
          var result, i = 0, j, k, p, q, matches, match, args = arguments;
          // loop through all regexes maps
          while (i < args.length && !matches) {
            var regex = args[i],
              // even sequence (0,2,4,..)
              props = args[i + 1];
            // odd sequence (1,3,5,..)
            // construct object barebones
            if (typeof result === UNDEF_TYPE) {
              result = {};
              for (p in props) {
                q = props[p];
                if (typeof q === OBJ_TYPE) {
                  result[q[0]] = undefined
                } else {
                  result[q] = undefined
                }
              }
            }
            // try matching uastring with regexes
            j = k = 0;
            while (j < regex.length && !matches) {
              matches = regex[j++].exec(this.getUA());
              if (!!matches) {
                for (p = 0; p < props.length; p++) {
                  match = matches[++k];
                  q = props[p];
                  // check if given property is actually array
                  if (typeof q === OBJ_TYPE && q.length > 0) {
                    if (q.length == 2) {
                      if (typeof q[1] == FUNC_TYPE) {
                        // assign modified match
                        result[q[0]] = q[1].call(this, match)
                      } else {
                        // assign given value, ignore regex match
                        result[q[0]] = q[1]
                      }
                    } else if (q.length == 3) {
                      // check whether function or regex
                      if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                        // call function (usually string mapper)
                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined
                      } else {
                        // sanitize match using given regex
                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined
                      }
                    } else if (q.length == 4) {
                      result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined
                    }
                  } else {
                    result[q] = match ? match : undefined
                  }
                }
              }
            }
            i += 2
          }
          return result
        },
        str: function (str, map) {
          for (var i in map) {
            // check if array
            if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
              for (var j = 0; j < map[i].length; j++) {
                if (util.has(map[i][j], str)) {
                  return i === UNKNOWN ? undefined : i
                }
              }
            } else if (util.has(map[i], str)) {
              return i === UNKNOWN ? undefined : i
            }
          }
          return str
        }
      };
      ///////////////
      // String map
      //////////////
      var maps = {
        browser: {
          oldsafari: {
            version: {
              '1.0': '/8',
              '1.2': '/1',
              '1.3': '/3',
              '2.0': '/412',
              '2.0.2': '/416',
              '2.0.3': '/417',
              '2.0.4': '/419',
              '?': '/'
            }
          }
        },
        device: {
          amazon: {
            model: {
              'Fire Phone': [
                'SD',
                'KF'
              ]
            }
          },
          sprint: {
            model: { 'Evo Shift 4G': '7373KT' },
            vendor: {
              'HTC': 'APA',
              'Sprint': 'Sprint'
            }
          }
        },
        os: {
          windows: {
            version: {
              'ME': '4.90',
              'NT 3.11': 'NT3.51',
              'NT 4.0': 'NT4.0',
              '2000': 'NT 5.0',
              'XP': [
                'NT 5.1',
                'NT 5.2'
              ],
              'Vista': 'NT 6.0',
              '7': 'NT 6.1',
              '8': 'NT 6.2',
              '8.1': 'NT 6.3',
              '10': [
                'NT 6.4',
                'NT 10.0'
              ],
              'RT': 'ARM'
            }
          }
        }
      };
      //////////////
      // Regex map
      /////////////
      var regexes = {
        browser: [
          [
            // Presto based
            /(opera\smini)\/([\w\.-]+)/i,
            // Opera Mini
            /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,
            // Opera Mobi/Tablet
            /(opera).+version\/([\w\.]+)/i,
            // Opera > 9.80
            /(opera)[\/\s]+([\w\.]+)/i  // Opera < 9.80
          ],
          [
            NAME,
            VERSION
          ],
          [/\s(opr)\/([\w\.]+)/i  // Opera Webkit
],
          [
            [
              NAME,
              'Opera'
            ],
            VERSION
          ],
          [
            // Mixed
            /(kindle)\/([\w\.]+)/i,
            // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
            // Lunascape/Maxthon/Netfront/Jasmine/Blazer
            // Trident based
            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
            // Avant/IEMobile/SlimBrowser/Baidu
            /(?:ms|\()(ie)\s([\w\.]+)/i,
            // Internet Explorer
            // Webkit/KHTML based
            /(rekonq)\/([\w\.]+)*/i,
            // Rekonq
            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium)\/([\w\.-]+)/i  // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium
          ],
          [
            NAME,
            VERSION
          ],
          [/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i  // IE11
],
          [
            [
              NAME,
              'IE'
            ],
            VERSION
          ],
          [/(edge)\/((\d+)?[\w\.]+)/i  // Microsoft Edge
],
          [
            NAME,
            VERSION
          ],
          [/(yabrowser)\/([\w\.]+)/i  // Yandex
],
          [
            [
              NAME,
              'Yandex'
            ],
            VERSION
          ],
          [/(comodo_dragon)\/([\w\.]+)/i  // Comodo Dragon
],
          [
            [
              NAME,
              /_/g,
              ' '
            ],
            VERSION
          ],
          [
            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,
            // Chrome/OmniWeb/Arora/Tizen/Nokia
            /(uc\s?browser|qqbrowser)[\/\s]?([\w\.]+)/i  // UCBrowser/QQBrowser
          ],
          [
            NAME,
            VERSION
          ],
          [/(dolfin)\/([\w\.]+)/i  // Dolphin
],
          [
            [
              NAME,
              'Dolphin'
            ],
            VERSION
          ],
          [/((?:android.+)crmo|crios)\/([\w\.]+)/i  // Chrome for Android/iOS
],
          [
            [
              NAME,
              'Chrome'
            ],
            VERSION
          ],
          [/XiaoMi\/MiuiBrowser\/([\w\.]+)/i  // MIUI Browser
],
          [
            VERSION,
            [
              NAME,
              'MIUI Browser'
            ]
          ],
          [/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i  // Android Browser
],
          [
            VERSION,
            [
              NAME,
              'Android Browser'
            ]
          ],
          [/FBAV\/([\w\.]+);/i  // Facebook App for iOS
],
          [
            VERSION,
            [
              NAME,
              'Facebook'
            ]
          ],
          [/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i  // Mobile Safari
],
          [
            VERSION,
            [
              NAME,
              'Mobile Safari'
            ]
          ],
          [/version\/([\w\.]+).+?(mobile\s?safari|safari)/i  // Safari & Safari Mobile
],
          [
            VERSION,
            NAME
          ],
          [/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i  // Safari < 3.0
],
          [
            NAME,
            [
              VERSION,
              mapper.str,
              maps.browser.oldsafari.version
            ]
          ],
          [
            /(konqueror)\/([\w\.]+)/i,
            // Konqueror
            /(webkit|khtml)\/([\w\.]+)/i
          ],
          [
            NAME,
            VERSION
          ],
          [// Gecko based
            /(navigator|netscape)\/([\w\.-]+)/i  // Netscape
],
          [
            [
              NAME,
              'Netscape'
            ],
            VERSION
          ],
          [/fxios\/([\w\.-]+)/i  // Firefox for iOS
],
          [
            VERSION,
            [
              NAME,
              'Firefox'
            ]
          ],
          [
            /(swiftfox)/i,
            // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
            // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
            // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,
            // Mozilla
            // Other
            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf)[\/\s]?([\w\.]+)/i,
            // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf
            /(links)\s\(([\w\.]+)/i,
            // Links
            /(gobrowser)\/?([\w\.]+)*/i,
            // GoBrowser
            /(ice\s?browser)\/v?([\w\._]+)/i,
            // ICE Browser
            /(mosaic)[\/\s]([\w\.]+)/i  // Mosaic
          ],
          [
            NAME,
            VERSION
          ]  /* /////////////////////
            // Media players BEGIN
            ////////////////////////

            , [

            /(apple(?:coremedia|))\/((\d+)[\w\._]+)/i,                          // Generic Apple CoreMedia
            /(coremedia) v((\d+)[\w\._]+)/i
            ], [NAME, VERSION], [

            /(aqualung|lyssna|bsplayer)\/((\d+)?[\w\.-]+)/i                     // Aqualung/Lyssna/BSPlayer
            ], [NAME, VERSION], [

            /(ares|ossproxy)\s((\d+)[\w\.-]+)/i                                 // Ares/OSSProxy
            ], [NAME, VERSION], [

            /(audacious|audimusicstream|amarok|bass|core|dalvik|gnomemplayer|music on console|nsplayer|psp-internetradioplayer|videos)\/((\d+)[\w\.-]+)/i,
                                                                                // Audacious/AudiMusicStream/Amarok/BASS/OpenCORE/Dalvik/GnomeMplayer/MoC
                                                                                // NSPlayer/PSP-InternetRadioPlayer/Videos
            /(clementine|music player daemon)\s((\d+)[\w\.-]+)/i,               // Clementine/MPD
            /(lg player|nexplayer)\s((\d+)[\d\.]+)/i,
            /player\/(nexplayer|lg player)\s((\d+)[\w\.-]+)/i                   // NexPlayer/LG Player
            ], [NAME, VERSION], [
            /(nexplayer)\s((\d+)[\w\.-]+)/i                                     // Nexplayer
            ], [NAME, VERSION], [

            /(flrp)\/((\d+)[\w\.-]+)/i                                          // Flip Player
            ], [[NAME, 'Flip Player'], VERSION], [

            /(fstream|nativehost|queryseekspider|ia-archiver|facebookexternalhit)/i
                                                                                // FStream/NativeHost/QuerySeekSpider/IA Archiver/facebookexternalhit
            ], [NAME], [

            /(gstreamer) souphttpsrc (?:\([^\)]+\)){0,1} libsoup\/((\d+)[\w\.-]+)/i
                                                                                // Gstreamer
            ], [NAME, VERSION], [

            /(htc streaming player)\s[\w_]+\s\/\s((\d+)[\d\.]+)/i,              // HTC Streaming Player
            /(java|python-urllib|python-requests|wget|libcurl)\/((\d+)[\w\.-_]+)/i,
                                                                                // Java/urllib/requests/wget/cURL
            /(lavf)((\d+)[\d\.]+)/i                                             // Lavf (FFMPEG)
            ], [NAME, VERSION], [

            /(htc_one_s)\/((\d+)[\d\.]+)/i                                      // HTC One S
            ], [[NAME, /_/g, ' '], VERSION], [

            /(mplayer)(?:\s|\/)(?:(?:sherpya-){0,1}svn)(?:-|\s)(r\d+(?:-\d+[\w\.-]+){0,1})/i
                                                                                // MPlayer SVN
            ], [NAME, VERSION], [

            /(mplayer)(?:\s|\/|[unkow-]+)((\d+)[\w\.-]+)/i                      // MPlayer
            ], [NAME, VERSION], [

            /(mplayer)/i,                                                       // MPlayer (no other info)
            /(yourmuze)/i,                                                      // YourMuze
            /(media player classic|nero showtime)/i                             // Media Player Classic/Nero ShowTime
            ], [NAME], [

            /(nero (?:home|scout))\/((\d+)[\w\.-]+)/i                           // Nero Home/Nero Scout
            ], [NAME, VERSION], [

            /(nokia\d+)\/((\d+)[\w\.-]+)/i                                      // Nokia
            ], [NAME, VERSION], [

            /\s(songbird)\/((\d+)[\w\.-]+)/i                                    // Songbird/Philips-Songbird
            ], [NAME, VERSION], [

            /(winamp)3 version ((\d+)[\w\.-]+)/i,                               // Winamp
            /(winamp)\s((\d+)[\w\.-]+)/i,
            /(winamp)mpeg\/((\d+)[\w\.-]+)/i
            ], [NAME, VERSION], [

            /(ocms-bot|tapinradio|tunein radio|unknown|winamp|inlight radio)/i  // OCMS-bot/tap in radio/tunein/unknown/winamp (no other info)
                                                                                // inlight radio
            ], [NAME], [

            /(quicktime|rma|radioapp|radioclientapplication|soundtap|totem|stagefright|streamium)\/((\d+)[\w\.-]+)/i
                                                                                // QuickTime/RealMedia/RadioApp/RadioClientApplication/
                                                                                // SoundTap/Totem/Stagefright/Streamium
            ], [NAME, VERSION], [

            /(smp)((\d+)[\d\.]+)/i                                              // SMP
            ], [NAME, VERSION], [

            /(vlc) media player - version ((\d+)[\w\.]+)/i,                     // VLC Videolan
            /(vlc)\/((\d+)[\w\.-]+)/i,
            /(xbmc|gvfs|xine|xmms|irapp)\/((\d+)[\w\.-]+)/i,                    // XBMC/gvfs/Xine/XMMS/irapp
            /(foobar2000)\/((\d+)[\d\.]+)/i,                                    // Foobar2000
            /(itunes)\/((\d+)[\d\.]+)/i                                         // iTunes
            ], [NAME, VERSION], [

            /(wmplayer)\/((\d+)[\w\.-]+)/i,                                     // Windows Media Player
            /(windows-media-player)\/((\d+)[\w\.-]+)/i
            ], [[NAME, /-/g, ' '], VERSION], [

            /windows\/((\d+)[\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ (home media server)/i
                                                                                // Windows Media Server
            ], [VERSION, [NAME, 'Windows']], [

            /(com\.riseupradioalarm)\/((\d+)[\d\.]*)/i                          // RiseUP Radio Alarm
            ], [NAME, VERSION], [

            /(rad.io)\s((\d+)[\d\.]+)/i,                                        // Rad.io
            /(radio.(?:de|at|fr))\s((\d+)[\d\.]+)/i
            ], [[NAME, 'rad.io'], VERSION]

            //////////////////////
            // Media players END
            ////////////////////*/
        ],
        cpu: [
          [/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i  // AMD64
],
          [[
              ARCHITECTURE,
              'amd64'
            ]],
          [/(ia32(?=;))/i  // IA32 (quicktime)
],
          [[
              ARCHITECTURE,
              util.lowerize
            ]],
          [/((?:i[346]|x)86)[;\)]/i  // IA32
],
          [[
              ARCHITECTURE,
              'ia32'
            ]],
          [// PocketPC mistakenly identified as PowerPC
            /windows\s(ce|mobile);\sppc;/i],
          [[
              ARCHITECTURE,
              'arm'
            ]],
          [/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i  // PowerPC
],
          [[
              ARCHITECTURE,
              /ower/,
              '',
              util.lowerize
            ]],
          [/(sun4\w)[;\)]/i  // SPARC
],
          [[
              ARCHITECTURE,
              'sparc'
            ]],
          [/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i  // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
],
          [[
              ARCHITECTURE,
              util.lowerize
            ]]
        ],
        device: [
          [/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i  // iPad/PlayBook
],
          [
            MODEL,
            VENDOR,
            [
              TYPE,
              TABLET
            ]
          ],
          [/applecoremedia\/[\w\.]+ \((ipad)/  // iPad
],
          [
            MODEL,
            [
              VENDOR,
              'Apple'
            ],
            [
              TYPE,
              TABLET
            ]
          ],
          [/(apple\s{0,1}tv)/i  // Apple TV
],
          [
            [
              MODEL,
              'Apple TV'
            ],
            [
              VENDOR,
              'Apple'
            ]
          ],
          [
            /(archos)\s(gamepad2?)/i,
            // Archos
            /(hp).+(touchpad)/i,
            // HP TouchPad
            /(kindle)\/([\w\.]+)/i,
            // Kindle
            /\s(nook)[\w\s]+build\/(\w+)/i,
            // Nook
            /(dell)\s(strea[kpr\s\d]*[\dko])/i  // Dell Streak
          ],
          [
            VENDOR,
            MODEL,
            [
              TYPE,
              TABLET
            ]
          ],
          [/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i  // Kindle Fire HD
],
          [
            MODEL,
            [
              VENDOR,
              'Amazon'
            ],
            [
              TYPE,
              TABLET
            ]
          ],
          [/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i  // Fire Phone
],
          [
            [
              MODEL,
              mapper.str,
              maps.device.amazon.model
            ],
            [
              VENDOR,
              'Amazon'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [/\((ip[honed|\s\w*]+);.+(apple)/i  // iPod/iPhone
],
          [
            MODEL,
            VENDOR,
            [
              TYPE,
              MOBILE
            ]
          ],
          [/\((ip[honed|\s\w*]+);/i  // iPod/iPhone
],
          [
            MODEL,
            [
              VENDOR,
              'Apple'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [
            /(blackberry)[\s-]?(\w+)/i,
            // BlackBerry
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
            // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Huawei/Meizu/Motorola/Polytron
            /(hp)\s([\w\s]+\w)/i,
            // HP iPAQ
            /(asus)-?(\w+)/i  // Asus
          ],
          [
            VENDOR,
            MODEL,
            [
              TYPE,
              MOBILE
            ]
          ],
          [/\(bb10;\s(\w+)/i  // BlackBerry 10
],
          [
            MODEL,
            [
              VENDOR,
              'BlackBerry'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [// Asus Tablets
            /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i],
          [
            MODEL,
            [
              VENDOR,
              'Asus'
            ],
            [
              TYPE,
              TABLET
            ]
          ],
          [
            /(sony)\s(tablet\s[ps])\sbuild\//i,
            // Sony
            /(sony)?(?:sgp.+)\sbuild\//i
          ],
          [
            [
              VENDOR,
              'Sony'
            ],
            [
              MODEL,
              'Xperia Tablet'
            ],
            [
              TYPE,
              TABLET
            ]
          ],
          [/(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i],
          [
            [
              VENDOR,
              'Sony'
            ],
            [
              MODEL,
              'Xperia Phone'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [
            /\s(ouya)\s/i,
            // Ouya
            /(nintendo)\s([wids3u]+)/i  // Nintendo
          ],
          [
            VENDOR,
            MODEL,
            [
              TYPE,
              CONSOLE
            ]
          ],
          [/android.+;\s(shield)\sbuild/i  // Nvidia
],
          [
            MODEL,
            [
              VENDOR,
              'Nvidia'
            ],
            [
              TYPE,
              CONSOLE
            ]
          ],
          [/(playstation\s[3portablevi]+)/i  // Playstation
],
          [
            MODEL,
            [
              VENDOR,
              'Sony'
            ],
            [
              TYPE,
              CONSOLE
            ]
          ],
          [/(sprint\s(\w+))/i  // Sprint Phones
],
          [
            [
              VENDOR,
              mapper.str,
              maps.device.sprint.vendor
            ],
            [
              MODEL,
              mapper.str,
              maps.device.sprint.model
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i  // Lenovo tablets
],
          [
            VENDOR,
            MODEL,
            [
              TYPE,
              TABLET
            ]
          ],
          [
            /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,
            // HTC
            /(zte)-(\w+)*/i,
            // ZTE
            /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i  // Alcatel/GeeksPhone/Huawei/Lenovo/Nexian/Panasonic/Sony
          ],
          [
            VENDOR,
            [
              MODEL,
              /_/g,
              ' '
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [/(nexus\s9)/i  // HTC Nexus 9
],
          [
            MODEL,
            [
              VENDOR,
              'HTC'
            ],
            [
              TYPE,
              TABLET
            ]
          ],
          [/[\s\(;](xbox(?:\sone)?)[\s\);]/i  // Microsoft Xbox
],
          [
            MODEL,
            [
              VENDOR,
              'Microsoft'
            ],
            [
              TYPE,
              CONSOLE
            ]
          ],
          [/(kin\.[onetw]{3})/i  // Microsoft Kin
],
          [
            [
              MODEL,
              /\./g,
              ' '
            ],
            [
              VENDOR,
              'Microsoft'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [
            // Motorola
            /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,
            /mot[\s-]?(\w+)*/i,
            /(XT\d{3,4}) build\//i
          ],
          [
            MODEL,
            [
              VENDOR,
              'Motorola'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],
          [
            MODEL,
            [
              VENDOR,
              'Motorola'
            ],
            [
              TYPE,
              TABLET
            ]
          ],
          [
            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i,
            /((SM-T\w+))/i
          ],
          [
            [
              VENDOR,
              'Samsung'
            ],
            MODEL,
            [
              TYPE,
              TABLET
            ]
          ],
          [
            // Samsung
            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i,
            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
            /sec-((sgh\w+))/i
          ],
          [
            [
              VENDOR,
              'Samsung'
            ],
            MODEL,
            [
              TYPE,
              MOBILE
            ]
          ],
          [/(samsung);smarttv/i],
          [
            VENDOR,
            MODEL,
            [
              TYPE,
              SMARTTV
            ]
          ],
          [/\(dtv[\);].+(aquos)/i  // Sharp
],
          [
            MODEL,
            [
              VENDOR,
              'Sharp'
            ],
            [
              TYPE,
              SMARTTV
            ]
          ],
          [/sie-(\w+)*/i  // Siemens
],
          [
            MODEL,
            [
              VENDOR,
              'Siemens'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [
            /(maemo|nokia).*(n900|lumia\s\d+)/i,
            // Nokia
            /(nokia)[\s_-]?([\w-]+)*/i
          ],
          [
            [
              VENDOR,
              'Nokia'
            ],
            MODEL,
            [
              TYPE,
              MOBILE
            ]
          ],
          [/android\s3\.[\s\w;-]{10}(a\d{3})/i  // Acer
],
          [
            MODEL,
            [
              VENDOR,
              'Acer'
            ],
            [
              TYPE,
              TABLET
            ]
          ],
          [/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i  // LG Tablet
],
          [
            [
              VENDOR,
              'LG'
            ],
            MODEL,
            [
              TYPE,
              TABLET
            ]
          ],
          [/(lg) netcast\.tv/i  // LG SmartTV
],
          [
            VENDOR,
            MODEL,
            [
              TYPE,
              SMARTTV
            ]
          ],
          [
            /(nexus\s[45])/i,
            // LG
            /lg[e;\s\/-]+(\w+)*/i
          ],
          [
            MODEL,
            [
              VENDOR,
              'LG'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [/android.+(ideatab[a-z0-9\-\s]+)/i  // Lenovo
],
          [
            MODEL,
            [
              VENDOR,
              'Lenovo'
            ],
            [
              TYPE,
              TABLET
            ]
          ],
          [/linux;.+((jolla));/i  // Jolla
],
          [
            VENDOR,
            MODEL,
            [
              TYPE,
              MOBILE
            ]
          ],
          [/((pebble))app\/[\d\.]+\s/i  // Pebble
],
          [
            VENDOR,
            MODEL,
            [
              TYPE,
              WEARABLE
            ]
          ],
          [/android.+;\s(glass)\s\d/i  // Google Glass
],
          [
            MODEL,
            [
              VENDOR,
              'Google'
            ],
            [
              TYPE,
              WEARABLE
            ]
          ],
          [
            /android.+(\w+)\s+build\/hm\1/i,
            // Xiaomi Hongmi 'numeric' models
            /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,
            // Xiaomi Hongmi
            /android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i  // Xiaomi Mi
          ],
          [
            [
              MODEL,
              /_/g,
              ' '
            ],
            [
              VENDOR,
              'Xiaomi'
            ],
            [
              TYPE,
              MOBILE
            ]
          ],
          [/(mobile|tablet);.+rv\:.+gecko\//i  // Unidentifiable
],
          [
            [
              TYPE,
              util.lowerize
            ],
            VENDOR,
            MODEL
          ]  /*//////////////////////////
            // TODO: move to string map
            ////////////////////////////

            /(C6603)/i                                                          // Sony Xperia Z C6603
            ], [[MODEL, 'Xperia Z C6603'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
            /(C6903)/i                                                          // Sony Xperia Z 1
            ], [[MODEL, 'Xperia Z 1'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [

            /(SM-G900[F|H])/i                                                   // Samsung Galaxy S5
            ], [[MODEL, 'Galaxy S5'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G7102)/i                                                       // Samsung Galaxy Grand 2
            ], [[MODEL, 'Galaxy Grand 2'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G530H)/i                                                       // Samsung Galaxy Grand Prime
            ], [[MODEL, 'Galaxy Grand Prime'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G313HZ)/i                                                      // Samsung Galaxy V
            ], [[MODEL, 'Galaxy V'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-T805)/i                                                        // Samsung Galaxy Tab S 10.5
            ], [[MODEL, 'Galaxy Tab S 10.5'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
            /(SM-G800F)/i                                                       // Samsung Galaxy S5 Mini
            ], [[MODEL, 'Galaxy S5 Mini'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-T311)/i                                                        // Samsung Galaxy Tab 3 8.0
            ], [[MODEL, 'Galaxy Tab 3 8.0'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [

            /(R1001)/i                                                          // Oppo R1001
            ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [
            /(X9006)/i                                                          // Oppo Find 7a
            ], [[MODEL, 'Find 7a'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
            /(R2001)/i                                                          // Oppo YOYO R2001
            ], [[MODEL, 'Yoyo R2001'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
            /(R815)/i                                                           // Oppo Clover R815
            ], [[MODEL, 'Clover R815'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
             /(U707)/i                                                          // Oppo Find Way S
            ], [[MODEL, 'Find Way S'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [

            /(T3C)/i                                                            // Advan Vandroid T3C
            ], [MODEL, [VENDOR, 'Advan'], [TYPE, TABLET]], [
            /(ADVAN T1J\+)/i                                                    // Advan Vandroid T1J+
            ], [[MODEL, 'Vandroid T1J+'], [VENDOR, 'Advan'], [TYPE, TABLET]], [
            /(ADVAN S4A)/i                                                      // Advan Vandroid S4A
            ], [[MODEL, 'Vandroid S4A'], [VENDOR, 'Advan'], [TYPE, MOBILE]], [

            /(V972M)/i                                                          // ZTE V972M
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [

            /(i-mobile)\s(IQ\s[\d\.]+)/i                                        // i-mobile IQ
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(IQ6.3)/i                                                          // i-mobile IQ IQ 6.3
            ], [[MODEL, 'IQ 6.3'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
            /(i-mobile)\s(i-style\s[\d\.]+)/i                                   // i-mobile i-STYLE
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(i-STYLE2.1)/i                                                     // i-mobile i-STYLE 2.1
            ], [[MODEL, 'i-STYLE 2.1'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
            
            /(mobiistar touch LAI 512)/i                                        // mobiistar touch LAI 512
            ], [[MODEL, 'Touch LAI 512'], [VENDOR, 'mobiistar'], [TYPE, MOBILE]], [

            /////////////
            // END TODO
            ///////////*/
        ],
        engine: [
          [/windows.+\sedge\/([\w\.]+)/i  // EdgeHTML
],
          [
            VERSION,
            [
              NAME,
              'EdgeHTML'
            ]
          ],
          [
            /(presto)\/([\w\.]+)/i,
            // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,
            // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,
            // KHTML/Tasman/Links
            /(icab)[\/\s]([23]\.[\d\.]+)/i  // iCab
          ],
          [
            NAME,
            VERSION
          ],
          [/rv\:([\w\.]+).*(gecko)/i  // Gecko
],
          [
            VERSION,
            NAME
          ]
        ],
        os: [
          [// Windows based
            /microsoft\s(windows)\s(vista|xp)/i  // Windows (iTunes)
],
          [
            NAME,
            VERSION
          ],
          [
            /(windows)\snt\s6\.2;\s(arm)/i,
            // Windows RT
            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
          ],
          [
            NAME,
            [
              VERSION,
              mapper.str,
              maps.os.windows.version
            ]
          ],
          [/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],
          [
            [
              NAME,
              'Windows'
            ],
            [
              VERSION,
              mapper.str,
              maps.os.windows.version
            ]
          ],
          [// Mobile/Embedded OS
            /\((bb)(10);/i  // BlackBerry 10
],
          [
            [
              NAME,
              'BlackBerry'
            ],
            VERSION
          ],
          [
            /(blackberry)\w*\/?([\w\.]+)*/i,
            // Blackberry
            /(tizen)[\/\s]([\w\.]+)/i,
            // Tizen
            /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
            // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
            /linux;.+(sailfish);/i  // Sailfish OS
          ],
          [
            NAME,
            VERSION
          ],
          [/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i  // Symbian
],
          [
            [
              NAME,
              'Symbian'
            ],
            VERSION
          ],
          [/\((series40);/i  // Series 40
],
          [NAME],
          [/mozilla.+\(mobile;.+gecko.+firefox/i  // Firefox OS
],
          [
            [
              NAME,
              'Firefox OS'
            ],
            VERSION
          ],
          [
            // Console
            /(nintendo|playstation)\s([wids3portablevu]+)/i,
            // Nintendo/Playstation
            // GNU/Linux based
            /(mint)[\/\s\(]?(\w+)*/i,
            // Mint
            /(mageia|vectorlinux)[;\s]/i,
            // Mageia/VectorLinux
            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
            // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
            // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
            /(hurd|linux)\s?([\w\.]+)*/i,
            // Hurd/Linux
            /(gnu)\s?([\w\.]+)*/i  // GNU
          ],
          [
            NAME,
            VERSION
          ],
          [/(cros)\s[\w]+\s([\w\.]+\w)/i  // Chromium OS
],
          [
            [
              NAME,
              'Chromium OS'
            ],
            VERSION
          ],
          [// Solaris
            /(sunos)\s?([\w\.]+\d)*/i  // Solaris
],
          [
            [
              NAME,
              'Solaris'
            ],
            VERSION
          ],
          [// BSD based
            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i  // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
],
          [
            NAME,
            VERSION
          ],
          [/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i  // iOS
],
          [
            [
              NAME,
              'iOS'
            ],
            [
              VERSION,
              /_/g,
              '.'
            ]
          ],
          [
            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
            /(macintosh|mac(?=_powerpc)\s)/i  // Mac OS
          ],
          [
            [
              NAME,
              'Mac OS'
            ],
            [
              VERSION,
              /_/g,
              '.'
            ]
          ],
          [
            // Other
            /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,
            // Solaris
            /(haiku)\s(\w+)/i,
            // Haiku
            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,
            // AIX
            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
            // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
            /(unix)\s?([\w\.]+)*/i  // UNIX
          ],
          [
            NAME,
            VERSION
          ]
        ]
      };
      /////////////////
      // Constructor
      ////////////////
      var UAParser = function (uastring, extensions) {
        if (!(this instanceof UAParser)) {
          return new UAParser(uastring, extensions).getResult()
        }
        var ua = uastring || (window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : EMPTY);
        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;
        this.getBrowser = function () {
          var browser = mapper.rgx.apply(this, rgxmap.browser);
          browser.major = util.major(browser.version);
          return browser
        };
        this.getCPU = function () {
          return mapper.rgx.apply(this, rgxmap.cpu)
        };
        this.getDevice = function () {
          return mapper.rgx.apply(this, rgxmap.device)
        };
        this.getEngine = function () {
          return mapper.rgx.apply(this, rgxmap.engine)
        };
        this.getOS = function () {
          return mapper.rgx.apply(this, rgxmap.os)
        };
        this.getResult = function () {
          return {
            ua: this.getUA(),
            browser: this.getBrowser(),
            engine: this.getEngine(),
            os: this.getOS(),
            device: this.getDevice(),
            cpu: this.getCPU()
          }
        };
        this.getUA = function () {
          return ua
        };
        this.setUA = function (uastring) {
          ua = uastring;
          return this
        };
        this.setUA(ua);
        return this
      };
      UAParser.VERSION = LIBVERSION;
      UAParser.BROWSER = {
        NAME: NAME,
        MAJOR: MAJOR,
        // deprecated
        VERSION: VERSION
      };
      UAParser.CPU = { ARCHITECTURE: ARCHITECTURE };
      UAParser.DEVICE = {
        MODEL: MODEL,
        VENDOR: VENDOR,
        TYPE: TYPE,
        CONSOLE: CONSOLE,
        MOBILE: MOBILE,
        SMARTTV: SMARTTV,
        TABLET: TABLET,
        WEARABLE: WEARABLE,
        EMBEDDED: EMBEDDED
      };
      UAParser.ENGINE = {
        NAME: NAME,
        VERSION: VERSION
      };
      UAParser.OS = {
        NAME: NAME,
        VERSION: VERSION
      };
      ///////////
      // Export
      //////////
      // check js environment
      if (typeof exports !== UNDEF_TYPE) {
        // nodejs env
        if (typeof module !== UNDEF_TYPE && module.exports) {
          exports = module.exports = UAParser
        }
        exports.UAParser = UAParser
      } else {
        // requirejs env (optional)
        if (typeof define === FUNC_TYPE && define.amd) {
          define(function () {
            return UAParser
          })
        } else {
          // browser env
          window.UAParser = UAParser
        }
      }
      // jQuery/Zepto specific (optional)
      // Note: 
      //   In AMD env the global scope should be kept clean, but jQuery is an exception.
      //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
      //   and we should catch that.
      var $ = window.jQuery || window.Zepto;
      if (typeof $ !== UNDEF_TYPE) {
        var parser = new UAParser;
        $.ua = parser.getResult();
        $.ua.get = function () {
          return parser.getUA()
        };
        $.ua.set = function (uastring) {
          parser.setUA(uastring);
          var result = parser.getResult();
          for (var prop in result) {
            $.ua[prop] = result[prop]
          }
        }
      }
    }(typeof window === 'object' ? window : this))
  });
  // source: /Users/dtai/work/verus/espy/node_modules/query-string/index.js
  require.define('query-string', function (module, exports, __dirname, __filename) {
    'use strict';
    exports.extract = function (maybeUrl) {
      return maybeUrl.split('?')[1] || ''
    };
    exports.parse = function (str) {
      if (typeof str !== 'string') {
        return {}
      }
      str = str.trim().replace(/^(\?|#|&)/, '');
      if (!str) {
        return {}
      }
      return str.split('&').reduce(function (ret, param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        var key = parts[0];
        var val = parts[1];
        key = decodeURIComponent(key);
        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);
        if (!ret.hasOwnProperty(key)) {
          ret[key] = val
        } else if (Array.isArray(ret[key])) {
          ret[key].push(val)
        } else {
          ret[key] = [
            ret[key],
            val
          ]
        }
        return ret
      }, {})
    };
    exports.stringify = function (obj) {
      return obj ? Object.keys(obj).sort().map(function (key) {
        var val = obj[key];
        if (Array.isArray(val)) {
          return val.sort().map(function (val2) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(val2)
          }).join('&')
        }
        return encodeURIComponent(key) + '=' + encodeURIComponent(val)
      }).join('&') : ''
    }
  });
  // source: /Users/dtai/work/verus/espy/node_modules/node-uuid/uuid.js
  require.define('node-uuid/uuid', function (module, exports, __dirname, __filename) {
    //     uuid.js
    //
    //     Copyright (c) 2010-2012 Robert Kieffer
    //     MIT License - http://opensource.org/licenses/mit-license.php
    (function () {
      var _global = this;
      // Unique ID creation requires a high quality random # generator.  We feature
      // detect to determine the best RNG source, normalizing to a function that
      // returns 128-bits of randomness, since that's what's usually required
      var _rng;
      // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
      //
      // Moderately fast, high quality
      if (typeof _global.require == 'function') {
        try {
          var _rb = _global.require('crypto').randomBytes;
          _rng = _rb && function () {
            return _rb(16)
          }
        } catch (e) {
        }
      }
      if (!_rng && _global.crypto && crypto.getRandomValues) {
        // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
        //
        // Moderately fast, high quality
        var _rnds8 = new Uint8Array(16);
        _rng = function whatwgRNG() {
          crypto.getRandomValues(_rnds8);
          return _rnds8
        }
      }
      if (!_rng) {
        // Math.random()-based (RNG)
        //
        // If all else fails, use Math.random().  It's fast, but is of unspecified
        // quality.
        var _rnds = new Array(16);
        _rng = function () {
          for (var i = 0, r; i < 16; i++) {
            if ((i & 3) === 0)
              r = Math.random() * 4294967296;
            _rnds[i] = r >>> ((i & 3) << 3) & 255
          }
          return _rnds
        }
      }
      // Buffer class to use
      var BufferClass = typeof _global.Buffer == 'function' ? _global.Buffer : Array;
      // Maps for number <-> hex string conversion
      var _byteToHex = [];
      var _hexToByte = {};
      for (var i = 0; i < 256; i++) {
        _byteToHex[i] = (i + 256).toString(16).substr(1);
        _hexToByte[_byteToHex[i]] = i
      }
      // **`parse()` - Parse a UUID into it's component bytes**
      function parse(s, buf, offset) {
        var i = buf && offset || 0, ii = 0;
        buf = buf || [];
        s.toLowerCase().replace(/[0-9a-f]{2}/g, function (oct) {
          if (ii < 16) {
            // Don't overflow!
            buf[i + ii++] = _hexToByte[oct]
          }
        });
        // Zero out remaining bytes if string was short
        while (ii < 16) {
          buf[i + ii++] = 0
        }
        return buf
      }
      // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
      function unparse(buf, offset) {
        var i = offset || 0, bth = _byteToHex;
        return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]]
      }
      // **`v1()` - Generate time-based UUID**
      //
      // Inspired by https://github.com/LiosK/UUID.js
      // and http://docs.python.org/library/uuid.html
      // random #'s we need to init node and clockseq
      var _seedBytes = _rng();
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      var _nodeId = [
        _seedBytes[0] | 1,
        _seedBytes[1],
        _seedBytes[2],
        _seedBytes[3],
        _seedBytes[4],
        _seedBytes[5]
      ];
      // Per 4.2.2, randomize (14 bit) clockseq
      var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 16383;
      // Previous uuid creation time
      var _lastMSecs = 0, _lastNSecs = 0;
      // See https://github.com/broofa/node-uuid for API details
      function v1(options, buf, offset) {
        var i = buf && offset || 0;
        var b = buf || [];
        options = options || {};
        var clockseq = options.clockseq != null ? options.clockseq : _clockseq;
        // UUID timestamps are 100 nano-second units since the Gregorian epoch,
        // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
        // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
        // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
        var msecs = options.msecs != null ? options.msecs : new Date().getTime();
        // Per 4.2.1.2, use count of uuid's generated during the current clock
        // cycle to simulate higher resolution clock
        var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;
        // Time since last uuid creation (in msecs)
        var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;
        // Per 4.2.1.2, Bump clockseq on clock regression
        if (dt < 0 && options.clockseq == null) {
          clockseq = clockseq + 1 & 16383
        }
        // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
        // time interval
        if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
          nsecs = 0
        }
        // Per 4.2.1.2 Throw error if too many uuids are requested
        if (nsecs >= 10000) {
          throw new Error("uuid.v1(): Can't create more than 10M uuids/sec")
        }
        _lastMSecs = msecs;
        _lastNSecs = nsecs;
        _clockseq = clockseq;
        // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
        msecs += 12219292800000;
        // `time_low`
        var tl = ((msecs & 268435455) * 10000 + nsecs) % 4294967296;
        b[i++] = tl >>> 24 & 255;
        b[i++] = tl >>> 16 & 255;
        b[i++] = tl >>> 8 & 255;
        b[i++] = tl & 255;
        // `time_mid`
        var tmh = msecs / 4294967296 * 10000 & 268435455;
        b[i++] = tmh >>> 8 & 255;
        b[i++] = tmh & 255;
        // `time_high_and_version`
        b[i++] = tmh >>> 24 & 15 | 16;
        // include version
        b[i++] = tmh >>> 16 & 255;
        // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
        b[i++] = clockseq >>> 8 | 128;
        // `clock_seq_low`
        b[i++] = clockseq & 255;
        // `node`
        var node = options.node || _nodeId;
        for (var n = 0; n < 6; n++) {
          b[i + n] = node[n]
        }
        return buf ? buf : unparse(b)
      }
      // **`v4()` - Generate random UUID**
      // See https://github.com/broofa/node-uuid for API details
      function v4(options, buf, offset) {
        // Deprecated - 'format' argument, as supported in v1.2
        var i = buf && offset || 0;
        if (typeof options == 'string') {
          buf = options == 'binary' ? new BufferClass(16) : null;
          options = null
        }
        options = options || {};
        var rnds = options.random || (options.rng || _rng)();
        // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
        rnds[6] = rnds[6] & 15 | 64;
        rnds[8] = rnds[8] & 63 | 128;
        // Copy bytes to buffer, if provided
        if (buf) {
          for (var ii = 0; ii < 16; ii++) {
            buf[i + ii] = rnds[ii]
          }
        }
        return buf || unparse(rnds)
      }
      // Export public API
      var uuid = v4;
      uuid.v1 = v1;
      uuid.v4 = v4;
      uuid.parse = parse;
      uuid.unparse = unparse;
      uuid.BufferClass = BufferClass;
      if (typeof module != 'undefined' && module.exports) {
        // Publish as node.js module
        module.exports = uuid
      } else if (typeof define === 'function' && define.amd) {
        // Publish as AMD module
        define(function () {
          return uuid
        })
      } else {
        // Publish as global (in browsers)
        var _previousRoot = _global.uuid;
        // **`noConflict()` - (browser only) to reset global 'uuid' var**
        uuid.noConflict = function () {
          _global.uuid = _previousRoot;
          return uuid
        };
        _global.uuid = uuid
      }
    }.call(this))
  });
  // source: /Users/dtai/work/verus/espy/src/index.coffee
  require.define('./index', function (module, exports, __dirname, __filename) {
    var Espy, Record, cookie, qs, sessionIdCookie, store, userIdCookie, useragent, uuid;
    Espy = function () {
    };
    if (typeof window !== 'undefined' && window !== null) {
      if (window.console == null || window.console.log == null) {
        window.console.log = function () {
        }
      }
      store = require('store/store');
      cookie = require('cookies-js/dist/cookies');
      useragent = require('ua-parser-js/src/ua-parser');
      qs = require('query-string');
      uuid = require('node-uuid/uuid');
      userIdCookie = '__cs-uid';
      sessionIdCookie = '__cs-sid';
      Record = function () {
        function Record() {
        }
        Record.prototype.pageId = '';
        Record.prototype.lastPageId = '';
        Record.prototype.pageViewId = '';
        Record.prototype.lastPageViewId = '';
        Record.prototype.count = 0;
        Record.prototype.queue = [];
        return Record
      }();
      (function () {
        var flush, getPageId, getPageViewId, getQueryParams, getSessionId, getTimestamp, getUserId, refreshSession, updatePage, useRecord;
        getTimestamp = function () {
          return new Date().getMilliseconds()
        };
        useRecord = function (fn) {
          var record, ref;
          record = (ref = store.get(getSessionId())) != null ? ref : new Record;
          fn(record);
          return store.set(getSessionId(), record)
        };
        cachedUserId;
        getUserId = function () {
          var cachedUserId, userId;
          if (typeof cachedUserId !== 'undefined' && cachedUserId !== null) {
            return cachedUserId
          }
          userId = cookie.get(userIdCookie);
          if (userId == null) {
            userId = uuid.v4();
            cookies.set(userIdCookie, userId, { domain: '.' + document.domain })
          }
          cachedUserId = userId;
          return userId
        };
        cachedSessionId;
        getSessionId = function () {
          var cachedSessionId, sessionId;
          if (typeof cachedSessionId !== 'undefined' && cachedSessionId !== null) {
            return cachedSessionId
          }
          sessionId = cookie.get(sessionIdCookie);
          if (sessionId == null) {
            sessionId = getUserId() + '_' + getTimestamp();
            cookies.set(sessionIdCookie, sessionId, {
              domain: '.' + document.domain,
              expires: 1800
            })
          }
          useRecord(function (record) {
            return record.count = 0
          });
          cachedSessionId = sessionId;
          return sessionId
        };
        refreshSession = function () {
          var sessionId;
          sessionId = cookies.get;
          return cookies.set(sessionIdCookie, sessionId, {
            domain: '.' + document.domain,
            expires: 1800
          })
        };
        cachedPageId;
        cachedPageViewId;
        getPageId = function () {
          return cachedPageId
        };
        getPageViewId = function () {
          return cachedPageViewId
        };
        getQueryParams = function () {
          return qs.parse(window.location.search)
        };
        updatePage = function () {
          var cachedPageId, cachedPageViewId, newPageId;
          newPageId = window.location.pathname + window.location.hash;
          if (newPageId !== cachedPageId) {
            cachedPageId = newPageId;
            cachedPageViewId = cachedPageId + '_' + getTimestamp();
            useRecord(function (record) {
              record.lastPageId = record.pageId;
              record.lastPageViewId = record.pageViewId;
              record.pageId = cachedPageId;
              return record.pageViewId = cachedPageViewId
            });
            return Espy('PageView', {
              lastPageId: record.lastPageId,
              lastPageViewId: record.lastPageViewId,
              url: window.location.href,
              referrerUrl: document.referrer,
              queryParams: getQueryParams()
            })
          }
        };
        Espy = function (name, data) {
          var ua;
          ua = window.navigator.userAgent;
          useRecord(function (record) {
            record.queue.push({
              userId: getUserId(),
              sessionId: getSessionId(),
              pageId: record.pageId,
              pageViewId: record.pageViewId,
              uaString: ua,
              ua: userAgent(ua),
              timestamp: new Date,
              event: name,
              data: data,
              count: record.count
            });
            return record.count++
          });
          return refreshSession()
        };
        flush = function () {
          return useRecord(function (record) {
            var data, retry, xhr;
            retry = 0;
            data = record.queue.slice(0);
            xhr = new XMLHttpRequest;
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status !== 200) {
                  retry++;
                  if (retry === 3) {
                    return console.log('Espy: failed to send', data)
                  } else {
                    return console.log('Espy: retrying send x' + retry)
                  }
                }
              }
            };
            xhr.open('POST', Espy.url);
            xhr.send(data);
            return record.queue.length = 0
          })
        };
        window.addEspyListener('hashchange', updatePage);
        window.addEspyListener('popstate', updatePage);
        window.beforeUnload('beforeunload', function () {
          return Espy('PageLeave')
        });
        flush();
        updatePage();
        return setInterval(function () {
          return flush()
        }, 2000)
      }())
    }
    Espy.url = 'https://analytics.crowdstart.com/';
    module.exports = Espy
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9zdG9yZS9zdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb29raWVzLWpzL2Rpc3QvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy91YS1wYXJzZXItanMvc3JjL3VhLXBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJpbmRleC5jb2ZmZWUiXSwibmFtZXMiOlsid2luIiwic3RvcmUiLCJkb2MiLCJkb2N1bWVudCIsImxvY2FsU3RvcmFnZU5hbWUiLCJzY3JpcHRUYWciLCJzdG9yYWdlIiwiZGlzYWJsZWQiLCJ2ZXJzaW9uIiwic2V0Iiwia2V5IiwidmFsdWUiLCJnZXQiLCJkZWZhdWx0VmFsIiwiaGFzIiwidW5kZWZpbmVkIiwicmVtb3ZlIiwiY2xlYXIiLCJ0cmFuc2FjdCIsInRyYW5zYWN0aW9uRm4iLCJ2YWwiLCJnZXRBbGwiLCJmb3JFYWNoIiwic2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRlc2VyaWFsaXplIiwicGFyc2UiLCJlIiwiaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkIiwiZXJyIiwic2V0SXRlbSIsImdldEl0ZW0iLCJyZW1vdmVJdGVtIiwicmV0IiwiY2FsbGJhY2siLCJpIiwibGVuZ3RoIiwiZG9jdW1lbnRFbGVtZW50IiwiYWRkQmVoYXZpb3IiLCJzdG9yYWdlT3duZXIiLCJzdG9yYWdlQ29udGFpbmVyIiwiQWN0aXZlWE9iamVjdCIsIm9wZW4iLCJ3cml0ZSIsImNsb3NlIiwidyIsImZyYW1lcyIsImNyZWF0ZUVsZW1lbnQiLCJib2R5Iiwid2l0aElFU3RvcmFnZSIsInN0b3JlRnVuY3Rpb24iLCJhcmdzIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJ1bnNoaWZ0IiwiYXBwZW5kQ2hpbGQiLCJsb2FkIiwicmVzdWx0IiwiYXBwbHkiLCJyZW1vdmVDaGlsZCIsImZvcmJpZGRlbkNoYXJzUmVnZXgiLCJSZWdFeHAiLCJpZUtleUZpeCIsInJlcGxhY2UiLCJzZXRBdHRyaWJ1dGUiLCJzYXZlIiwiZ2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwiYXR0cmlidXRlcyIsIlhNTERvY3VtZW50IiwiYXR0ciIsIm5hbWUiLCJ0ZXN0S2V5IiwiZW5hYmxlZCIsIm1vZHVsZSIsImV4cG9ydHMiLCJkZWZpbmUiLCJhbWQiLCJGdW5jdGlvbiIsImdsb2JhbCIsImZhY3RvcnkiLCJ3aW5kb3ciLCJFcnJvciIsIkNvb2tpZXMiLCJvcHRpb25zIiwiX2RvY3VtZW50IiwiX2NhY2hlS2V5UHJlZml4IiwiX21heEV4cGlyZURhdGUiLCJEYXRlIiwiZGVmYXVsdHMiLCJwYXRoIiwic2VjdXJlIiwiX2NhY2hlZERvY3VtZW50Q29va2llIiwiY29va2llIiwiX3JlbmV3Q2FjaGUiLCJfY2FjaGUiLCJfZ2V0RXh0ZW5kZWRPcHRpb25zIiwiZXhwaXJlcyIsIl9nZXRFeHBpcmVzRGF0ZSIsIl9nZW5lcmF0ZUNvb2tpZVN0cmluZyIsImV4cGlyZSIsImRvbWFpbiIsIl9pc1ZhbGlkRGF0ZSIsImRhdGUiLCJPYmplY3QiLCJ0b1N0cmluZyIsImlzTmFOIiwiZ2V0VGltZSIsIm5vdyIsIkluZmluaXR5IiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29va2llU3RyaW5nIiwidG9VVENTdHJpbmciLCJfZ2V0Q2FjaGVGcm9tU3RyaW5nIiwiZG9jdW1lbnRDb29raWUiLCJjb29raWVDYWNoZSIsImNvb2tpZXNBcnJheSIsInNwbGl0IiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdWJzdHIiLCJfYXJlRW5hYmxlZCIsImFyZUVuYWJsZWQiLCJjb29raWVzRXhwb3J0IiwiTElCVkVSU0lPTiIsIkVNUFRZIiwiVU5LTk9XTiIsIkZVTkNfVFlQRSIsIlVOREVGX1RZUEUiLCJPQkpfVFlQRSIsIlNUUl9UWVBFIiwiTUFKT1IiLCJNT0RFTCIsIk5BTUUiLCJUWVBFIiwiVkVORE9SIiwiVkVSU0lPTiIsIkFSQ0hJVEVDVFVSRSIsIkNPTlNPTEUiLCJNT0JJTEUiLCJUQUJMRVQiLCJTTUFSVFRWIiwiV0VBUkFCTEUiLCJFTUJFRERFRCIsInV0aWwiLCJleHRlbmQiLCJyZWdleGVzIiwiZXh0ZW5zaW9ucyIsImNvbmNhdCIsInN0cjEiLCJzdHIyIiwidG9Mb3dlckNhc2UiLCJsb3dlcml6ZSIsInN0ciIsIm1ham9yIiwibWFwcGVyIiwicmd4IiwiaiIsImsiLCJwIiwicSIsIm1hdGNoZXMiLCJtYXRjaCIsInJlZ2V4IiwicHJvcHMiLCJleGVjIiwiZ2V0VUEiLCJ0ZXN0IiwibWFwIiwibWFwcyIsImJyb3dzZXIiLCJvbGRzYWZhcmkiLCJkZXZpY2UiLCJhbWF6b24iLCJtb2RlbCIsInNwcmludCIsInZlbmRvciIsIm9zIiwid2luZG93cyIsImNwdSIsImVuZ2luZSIsIlVBUGFyc2VyIiwidWFzdHJpbmciLCJnZXRSZXN1bHQiLCJ1YSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsInJneG1hcCIsImdldEJyb3dzZXIiLCJnZXRDUFUiLCJnZXREZXZpY2UiLCJnZXRFbmdpbmUiLCJnZXRPUyIsInNldFVBIiwiQlJPV1NFUiIsIkNQVSIsIkRFVklDRSIsIkVOR0lORSIsIk9TIiwiJCIsImpRdWVyeSIsIlplcHRvIiwicGFyc2VyIiwicHJvcCIsImV4dHJhY3QiLCJtYXliZVVybCIsInRyaW0iLCJyZWR1Y2UiLCJwYXJhbSIsInBhcnRzIiwiaGFzT3duUHJvcGVydHkiLCJpc0FycmF5IiwicHVzaCIsIm9iaiIsImtleXMiLCJzb3J0IiwidmFsMiIsImpvaW4iLCJfZ2xvYmFsIiwiX3JuZyIsInJlcXVpcmUiLCJfcmIiLCJyYW5kb21CeXRlcyIsImNyeXB0byIsImdldFJhbmRvbVZhbHVlcyIsIl9ybmRzOCIsIlVpbnQ4QXJyYXkiLCJ3aGF0d2dSTkciLCJfcm5kcyIsInIiLCJNYXRoIiwicmFuZG9tIiwiQnVmZmVyQ2xhc3MiLCJCdWZmZXIiLCJfYnl0ZVRvSGV4IiwiX2hleFRvQnl0ZSIsInMiLCJidWYiLCJvZmZzZXQiLCJpaSIsIm9jdCIsInVucGFyc2UiLCJidGgiLCJfc2VlZEJ5dGVzIiwiX25vZGVJZCIsIl9jbG9ja3NlcSIsIl9sYXN0TVNlY3MiLCJfbGFzdE5TZWNzIiwidjEiLCJiIiwiY2xvY2tzZXEiLCJtc2VjcyIsIm5zZWNzIiwiZHQiLCJ0bCIsInRtaCIsIm5vZGUiLCJuIiwidjQiLCJybmRzIiwicm5nIiwidXVpZCIsIl9wcmV2aW91c1Jvb3QiLCJub0NvbmZsaWN0IiwiRXNweSIsIlJlY29yZCIsInFzIiwic2Vzc2lvbklkQ29va2llIiwidXNlcklkQ29va2llIiwidXNlcmFnZW50IiwiY29uc29sZSIsImxvZyIsInBhZ2VJZCIsImxhc3RQYWdlSWQiLCJwYWdlVmlld0lkIiwibGFzdFBhZ2VWaWV3SWQiLCJjb3VudCIsInF1ZXVlIiwiZmx1c2giLCJnZXRQYWdlSWQiLCJnZXRQYWdlVmlld0lkIiwiZ2V0UXVlcnlQYXJhbXMiLCJnZXRTZXNzaW9uSWQiLCJnZXRUaW1lc3RhbXAiLCJnZXRVc2VySWQiLCJyZWZyZXNoU2Vzc2lvbiIsInVwZGF0ZVBhZ2UiLCJ1c2VSZWNvcmQiLCJnZXRNaWxsaXNlY29uZHMiLCJmbiIsInJlY29yZCIsInJlZiIsImNhY2hlZFVzZXJJZCIsInVzZXJJZCIsImNvb2tpZXMiLCJjYWNoZWRTZXNzaW9uSWQiLCJzZXNzaW9uSWQiLCJjYWNoZWRQYWdlSWQiLCJjYWNoZWRQYWdlVmlld0lkIiwibG9jYXRpb24iLCJzZWFyY2giLCJuZXdQYWdlSWQiLCJwYXRobmFtZSIsImhhc2giLCJ1cmwiLCJocmVmIiwicmVmZXJyZXJVcmwiLCJyZWZlcnJlciIsInF1ZXJ5UGFyYW1zIiwiZGF0YSIsInVhU3RyaW5nIiwidGltZXN0YW1wIiwiZXZlbnQiLCJyZXRyeSIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsInNlbmQiLCJhZGRFc3B5TGlzdGVuZXIiLCJiZWZvcmVVbmxvYWQiLCJzZXRJbnRlcnZhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxDO0lBQUMsQ0FBQyxVQUFTQSxHQUFULEVBQWE7QUFBQSxNQUNkLElBQUlDLEtBQUEsR0FBUSxFQUFaLEVBQ0NDLEdBQUEsR0FBTUYsR0FBQSxDQUFJRyxRQURYLEVBRUNDLGdCQUFBLEdBQW1CLGNBRnBCLEVBR0NDLFNBQUEsR0FBWSxRQUhiLEVBSUNDLE9BSkQsQ0FEYztBQUFBLE1BT2RMLEtBQUEsQ0FBTU0sUUFBTixHQUFpQixLQUFqQixDQVBjO0FBQUEsTUFRZE4sS0FBQSxDQUFNTyxPQUFOLEdBQWdCLFFBQWhCLENBUmM7QUFBQSxNQVNkUCxLQUFBLENBQU1RLEdBQU4sR0FBWSxVQUFTQyxHQUFULEVBQWNDLEtBQWQsRUFBcUI7QUFBQSxPQUFqQyxDQVRjO0FBQUEsTUFVZFYsS0FBQSxDQUFNVyxHQUFOLEdBQVksVUFBU0YsR0FBVCxFQUFjRyxVQUFkLEVBQTBCO0FBQUEsT0FBdEMsQ0FWYztBQUFBLE1BV2RaLEtBQUEsQ0FBTWEsR0FBTixHQUFZLFVBQVNKLEdBQVQsRUFBYztBQUFBLFFBQUUsT0FBT1QsS0FBQSxDQUFNVyxHQUFOLENBQVVGLEdBQVYsTUFBbUJLLFNBQTVCO0FBQUEsT0FBMUIsQ0FYYztBQUFBLE1BWWRkLEtBQUEsQ0FBTWUsTUFBTixHQUFlLFVBQVNOLEdBQVQsRUFBYztBQUFBLE9BQTdCLENBWmM7QUFBQSxNQWFkVCxLQUFBLENBQU1nQixLQUFOLEdBQWMsWUFBVztBQUFBLE9BQXpCLENBYmM7QUFBQSxNQWNkaEIsS0FBQSxDQUFNaUIsUUFBTixHQUFpQixVQUFTUixHQUFULEVBQWNHLFVBQWQsRUFBMEJNLGFBQTFCLEVBQXlDO0FBQUEsUUFDekQsSUFBSUEsYUFBQSxJQUFpQixJQUFyQixFQUEyQjtBQUFB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