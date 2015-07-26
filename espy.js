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
    var Espy, cookies, newRecord, qs, sessionIdCookie, store, userAgent, userIdCookie, uuid;
    Espy = function () {
    };
    if (typeof window !== 'undefined' && window !== null) {
      if (window.console == null || window.console.log == null) {
        window.console.log = function () {
        }
      }
      store = require('store/store');
      cookies = require('cookies-js/dist/cookies');
      userAgent = require('ua-parser-js/src/ua-parser');
      qs = require('query-string');
      uuid = require('node-uuid/uuid');
      userIdCookie = '__cs-uid';
      sessionIdCookie = '__cs-sid';
      newRecord = {
        pageId: '',
        lastPageId: '',
        pageViewId: '',
        lastPageViewId: '',
        count: 0,
        queue: []
      };
      (function () {
        var cachedDomain, cachedPageId, cachedPageViewId, cachedSessionId, cachedUserId, flush, getDomain, getPageId, getPageViewId, getQueryParams, getRecord, getSessionId, getTimestamp, getUserId, next, refreshSession, saveRecord, updatePage;
        getTimestamp = function () {
          return new Date().getMilliseconds()
        };
        cachedDomain = '';
        getDomain = function () {
          if (!cachedDomain) {
            cachedDomain = document.domain !== 'localhost' ? '.' + document.domain : ''
          }
          return cachedDomain
        };
        getRecord = function () {
          var ref;
          return (ref = store.get(getSessionId())) != null ? ref : newRecord
        };
        saveRecord = function (record) {
          return store.set(getSessionId(), record)
        };
        cachedUserId = '';
        getUserId = function () {
          var userId;
          if (cachedUserId) {
            return cachedUserId
          }
          userId = cookies.get(userIdCookie);
          if (!userId) {
            userId = uuid.v4();
            cookies.set(userIdCookie, userId, { domain: getDomain() })
          }
          cachedUserId = userId;
          return userId
        };
        cachedSessionId = '';
        getSessionId = function () {
          var record, sessionId;
          if (cachedSessionId) {
            return cachedSessionId
          }
          sessionId = cookies.get(sessionIdCookie);
          if (!sessionId) {
            sessionId = getUserId() + '_' + getTimestamp();
            cookies.set(sessionIdCookie, sessionId, {
              domain: getDomain(),
              expires: 1800
            });
            cachedSessionId = sessionId;
            record = getRecord();
            record.count = 0;
            saveRecord(record)
          }
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
        cachedPageId = '';
        cachedPageViewId = '';
        getPageId = function () {
          return cachedPageId
        };
        getPageViewId = function () {
          return cachedPageViewId
        };
        getQueryParams = function () {
          return qs.parse(window.location.search || window.location.hash.split('?')[1])
        };
        updatePage = function () {
          var newPageId, record;
          record = getRecord();
          newPageId = window.location.pathname + window.location.hash;
          if (newPageId !== record.pageId) {
            cachedPageId = newPageId;
            cachedPageViewId = cachedPageId + '_' + getTimestamp();
            record = getRecord();
            record.lastPageId = record.pageId;
            record.lastPageViewId = record.pageViewId;
            record.pageId = cachedPageId;
            record.pageViewId = cachedPageViewId;
            saveRecord(record);
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
          var record, ua;
          ua = window.navigator.userAgent;
          record = getRecord();
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
          record.count++;
          saveRecord(record);
          return refreshSession()
        };
        flush = function () {
          var data, record, retry, xhr;
          record = getRecord();
          if (record.queue.length > 0) {
            Espy.onflush(record);
            retry = 0;
            data = JSON.stringify(record.queue);
            xhr = new XMLHttpRequest;
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status !== 204) {
                  retry++;
                  if (retry === 3) {
                    return console.log('Espy: failed to send', JSON.parse(data))
                  } else {
                    xhr.open('POST', Espy.url);
                    xhr.send(data);
                    return console.log('Espy: retrying send x' + retry)
                  }
                }
              }
            };
            xhr.open('POST', Espy.url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(data);
            record.queue.length = 0;
            return saveRecord(record)
          }
        };
        window.addEventListener('hashchange', updatePage);
        window.addEventListener('popstate', updatePage);
        window.addEventListener('beforeunload', function () {
          return Espy('PageChange')
        });
        updatePage();
        next = function () {
          return setTimeout(function () {
            flush();
            return next()
          }, Espy.flushRate || 200)
        };
        setTimeout(function () {
          return next()
        }, 1);
        return window.Espy = Espy
      }())
    }
    Espy.url = 'https://analytics.crowdstart.com/';
    Espy.onflush = function () {
    };
    Espy.flushRate = 200;
    module.exports = Espy
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9zdG9yZS9zdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb29raWVzLWpzL2Rpc3QvY29va2llcy5qcyIsIm5vZGVfbW9kdWxlcy91YS1wYXJzZXItanMvc3JjL3VhLXBhcnNlci5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbm9kZS11dWlkL3V1aWQuanMiLCJpbmRleC5jb2ZmZWUiXSwibmFtZXMiOlsid2luIiwic3RvcmUiLCJkb2MiLCJkb2N1bWVudCIsImxvY2FsU3RvcmFnZU5hbWUiLCJzY3JpcHRUYWciLCJzdG9yYWdlIiwiZGlzYWJsZWQiLCJ2ZXJzaW9uIiwic2V0Iiwia2V5IiwidmFsdWUiLCJnZXQiLCJkZWZhdWx0VmFsIiwiaGFzIiwidW5kZWZpbmVkIiwicmVtb3ZlIiwiY2xlYXIiLCJ0cmFuc2FjdCIsInRyYW5zYWN0aW9uRm4iLCJ2YWwiLCJnZXRBbGwiLCJmb3JFYWNoIiwic2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRlc2VyaWFsaXplIiwicGFyc2UiLCJlIiwiaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkIiwiZXJyIiwic2V0SXRlbSIsImdldEl0ZW0iLCJyZW1vdmVJdGVtIiwicmV0IiwiY2FsbGJhY2siLCJpIiwibGVuZ3RoIiwiZG9jdW1lbnRFbGVtZW50IiwiYWRkQmVoYXZpb3IiLCJzdG9yYWdlT3duZXIiLCJzdG9yYWdlQ29udGFpbmVyIiwiQWN0aXZlWE9iamVjdCIsIm9wZW4iLCJ3cml0ZSIsImNsb3NlIiwidyIsImZyYW1lcyIsImNyZWF0ZUVsZW1lbnQiLCJib2R5Iiwid2l0aElFU3RvcmFnZSIsInN0b3JlRnVuY3Rpb24iLCJhcmdzIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJhcmd1bWVudHMiLCJ1bnNoaWZ0IiwiYXBwZW5kQ2hpbGQiLCJsb2FkIiwicmVzdWx0IiwiYXBwbHkiLCJyZW1vdmVDaGlsZCIsImZvcmJpZGRlbkNoYXJzUmVnZXgiLCJSZWdFeHAiLCJpZUtleUZpeCIsInJlcGxhY2UiLCJzZXRBdHRyaWJ1dGUiLCJzYXZlIiwiZ2V0QXR0cmlidXRlIiwicmVtb3ZlQXR0cmlidXRlIiwiYXR0cmlidXRlcyIsIlhNTERvY3VtZW50IiwiYXR0ciIsIm5hbWUiLCJ0ZXN0S2V5IiwiZW5hYmxlZCIsIm1vZHVsZSIsImV4cG9ydHMiLCJkZWZpbmUiLCJhbWQiLCJGdW5jdGlvbiIsImdsb2JhbCIsImZhY3RvcnkiLCJ3aW5kb3ciLCJFcnJvciIsIkNvb2tpZXMiLCJvcHRpb25zIiwiX2RvY3VtZW50IiwiX2NhY2hlS2V5UHJlZml4IiwiX21heEV4cGlyZURhdGUiLCJEYXRlIiwiZGVmYXVsdHMiLCJwYXRoIiwic2VjdXJlIiwiX2NhY2hlZERvY3VtZW50Q29va2llIiwiY29va2llIiwiX3JlbmV3Q2FjaGUiLCJfY2FjaGUiLCJfZ2V0RXh0ZW5kZWRPcHRpb25zIiwiZXhwaXJlcyIsIl9nZXRFeHBpcmVzRGF0ZSIsIl9nZW5lcmF0ZUNvb2tpZVN0cmluZyIsImV4cGlyZSIsImRvbWFpbiIsIl9pc1ZhbGlkRGF0ZSIsImRhdGUiLCJPYmplY3QiLCJ0b1N0cmluZyIsImlzTmFOIiwiZ2V0VGltZSIsIm5vdyIsIkluZmluaXR5IiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiY29va2llU3RyaW5nIiwidG9VVENTdHJpbmciLCJfZ2V0Q2FjaGVGcm9tU3RyaW5nIiwiZG9jdW1lbnRDb29raWUiLCJjb29raWVDYWNoZSIsImNvb2tpZXNBcnJheSIsInNwbGl0IiwiY29va2llS3ZwIiwiX2dldEtleVZhbHVlUGFpckZyb21Db29raWVTdHJpbmciLCJzZXBhcmF0b3JJbmRleCIsImluZGV4T2YiLCJkZWNvZGVVUklDb21wb25lbnQiLCJzdWJzdHIiLCJfYXJlRW5hYmxlZCIsImFyZUVuYWJsZWQiLCJjb29raWVzRXhwb3J0IiwiTElCVkVSU0lPTiIsIkVNUFRZIiwiVU5LTk9XTiIsIkZVTkNfVFlQRSIsIlVOREVGX1RZUEUiLCJPQkpfVFlQRSIsIlNUUl9UWVBFIiwiTUFKT1IiLCJNT0RFTCIsIk5BTUUiLCJUWVBFIiwiVkVORE9SIiwiVkVSU0lPTiIsIkFSQ0hJVEVDVFVSRSIsIkNPTlNPTEUiLCJNT0JJTEUiLCJUQUJMRVQiLCJTTUFSVFRWIiwiV0VBUkFCTEUiLCJFTUJFRERFRCIsInV0aWwiLCJleHRlbmQiLCJyZWdleGVzIiwiZXh0ZW5zaW9ucyIsImNvbmNhdCIsInN0cjEiLCJzdHIyIiwidG9Mb3dlckNhc2UiLCJsb3dlcml6ZSIsInN0ciIsIm1ham9yIiwibWFwcGVyIiwicmd4IiwiaiIsImsiLCJwIiwicSIsIm1hdGNoZXMiLCJtYXRjaCIsInJlZ2V4IiwicHJvcHMiLCJleGVjIiwiZ2V0VUEiLCJ0ZXN0IiwibWFwIiwibWFwcyIsImJyb3dzZXIiLCJvbGRzYWZhcmkiLCJkZXZpY2UiLCJhbWF6b24iLCJtb2RlbCIsInNwcmludCIsInZlbmRvciIsIm9zIiwid2luZG93cyIsImNwdSIsImVuZ2luZSIsIlVBUGFyc2VyIiwidWFzdHJpbmciLCJnZXRSZXN1bHQiLCJ1YSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsInJneG1hcCIsImdldEJyb3dzZXIiLCJnZXRDUFUiLCJnZXREZXZpY2UiLCJnZXRFbmdpbmUiLCJnZXRPUyIsInNldFVBIiwiQlJPV1NFUiIsIkNQVSIsIkRFVklDRSIsIkVOR0lORSIsIk9TIiwiJCIsImpRdWVyeSIsIlplcHRvIiwicGFyc2VyIiwicHJvcCIsImV4dHJhY3QiLCJtYXliZVVybCIsInRyaW0iLCJyZWR1Y2UiLCJwYXJhbSIsInBhcnRzIiwiaGFzT3duUHJvcGVydHkiLCJpc0FycmF5IiwicHVzaCIsIm9iaiIsImtleXMiLCJzb3J0IiwidmFsMiIsImpvaW4iLCJfZ2xvYmFsIiwiX3JuZyIsInJlcXVpcmUiLCJfcmIiLCJyYW5kb21CeXRlcyIsImNyeXB0byIsImdldFJhbmRvbVZhbHVlcyIsIl9ybmRzOCIsIlVpbnQ4QXJyYXkiLCJ3aGF0d2dSTkciLCJfcm5kcyIsInIiLCJNYXRoIiwicmFuZG9tIiwiQnVmZmVyQ2xhc3MiLCJCdWZmZXIiLCJfYnl0ZVRvSGV4IiwiX2hleFRvQnl0ZSIsInMiLCJidWYiLCJvZmZzZXQiLCJpaSIsIm9jdCIsInVucGFyc2UiLCJidGgiLCJfc2VlZEJ5dGVzIiwiX25vZGVJZCIsIl9jbG9ja3NlcSIsIl9sYXN0TVNlY3MiLCJfbGFzdE5TZWNzIiwidjEiLCJiIiwiY2xvY2tzZXEiLCJtc2VjcyIsIm5zZWNzIiwiZHQiLCJ0bCIsInRtaCIsIm5vZGUiLCJuIiwidjQiLCJybmRzIiwicm5nIiwidXVpZCIsIl9wcmV2aW91c1Jvb3QiLCJub0NvbmZsaWN0IiwiRXNweSIsImNvb2tpZXMiLCJuZXdSZWNvcmQiLCJxcyIsInNlc3Npb25JZENvb2tpZSIsInVzZXJJZENvb2tpZSIsImNvbnNvbGUiLCJsb2ciLCJwYWdlSWQiLCJsYXN0UGFnZUlkIiwicGFnZVZpZXdJZCIsImxhc3RQYWdlVmlld0lkIiwiY291bnQiLCJxdWV1ZSIsImNhY2hlZERvbWFpbiIsImNhY2hlZFBhZ2VJZCIsImNhY2hlZFBhZ2VWaWV3SWQiLCJjYWNoZWRTZXNzaW9uSWQiLCJjYWNoZWRVc2VySWQiLCJmbHVzaCIsImdldERvbWFpbiIsImdldFBhZ2VJZCIsImdldFBhZ2VWaWV3SWQiLCJnZXRRdWVyeVBhcmFtcyIsImdldFJlY29yZCIsImdldFNlc3Npb25JZCIsImdldFRpbWVzdGFtcCIsImdldFVzZXJJZCIsIm5leHQiLCJyZWZyZXNoU2Vzc2lvbiIsInNhdmVSZWNvcmQiLCJ1cGRhdGVQYWdlIiwiZ2V0TWlsbGlzZWNvbmRzIiwicmVmIiwicmVjb3JkIiwidXNlcklkIiwic2Vzc2lvbklkIiwibG9jYXRpb24iLCJzZWFyY2giLCJoYXNoIiwibmV3UGFnZUlkIiwicGF0aG5hbWUiLCJ1cmwiLCJocmVmIiwicmVmZXJyZXJVcmwiLCJyZWZlcnJlciIsInF1ZXJ5UGFyYW1zIiwiZGF0YSIsInVhU3RyaW5nIiwidGltZXN0YW1wIiwiZXZlbnQiLCJyZXRyeSIsInhociIsIm9uZmx1c2giLCJYTUxIdHRwUmVxdWVzdCIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJzZW5kIiwic2V0UmVxdWVzdEhlYWRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJzZXRUaW1lb3V0IiwiZmx1c2hSYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLEM7SUFBQyxDQUFDLFVBQVNBLEdBQVQsRUFBYTtBQUFBLE1BQ2QsSUFBSUMsS0FBQSxHQUFRLEVBQVosRUFDQ0MsR0FBQSxHQUFNRixHQUFBLENBQUlHLFFBRFgsRUFFQ0MsZ0JBQUEsR0FBbUIsY0FGcEIsRUFHQ0MsU0FBQSxHQUFZLFFBSGIsRUFJQ0MsT0FKRCxDQURjO0FBQUEsTUFPZEwsS0FBQSxDQUFNTSxRQUFOLEdBQWlCLEtBQWpCLENBUGM7QUFBQSxNQVFkTixLQUFBLENBQU1PLE9BQU4sR0FBZ0IsUUFBaEIsQ0FSYztBQUFBLE1BU2RQLEtBQUEsQ0FBTVEsR0FBTixHQUFZLFVBQVNDLEdBQVQsRUFBY0MsS0FBZCxFQUFxQjtBQUFBLE9BQWpDLENBVGM7QUFBQSxNQVVkVixLQUFBLENBQU1XLEdBQU4sR0FBWSxVQUFTRixHQUFULEVBQWNHLFVBQWQsRUFBMEI7QUFBQSxPQUF0QyxDQVZjO0FBQUEsTUFXZFosS0FBQSxDQUFNYSxHQUFOLEdBQVksVUFBU0osR0FBVCxFQUFjO0FBQUEsUUFBRSxPQUFPVCxLQUFBLENBQU1XLEdBQU4sQ0FBVUYsR0FBVixNQUFtQkssU0FBNUI7QUFBQSxPQUExQixDQVhjO0FBQUEsTUFZZGQsS0FBQSxDQUFNZSxNQUFOLEdBQWUsVUFBU04sR0FBVCxFQUFjO0FBQUEsT0FBN0IsQ0FaYztBQUFBLE1BYWRULEtBQUEsQ0FBTWdCLEtBQU4sR0FBYyxZQUFXO0FBQUEsT0FBekIsQ0FiYztBQUFBLE1BY2RoQixLQUFBLENBQU1pQixRQUFOLEdBQWlCLFVBQVNSLEdBQVQsRUFBY0csVUFBZCxFQUEw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