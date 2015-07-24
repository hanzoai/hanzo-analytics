#client only
Espy = ()->

if window?
  if !window.console? || !window.console.log?
    window.console.log = ()->

  store = require 'store'
  cookie = require 'cookie-js'
  useragent = require 'ua-parser-js'
  qs = require 'query-string'

  uuid = require 'node-uuid'

  userIdCookie = '__cs-uid'
  sessionIdCookie = '__cs-sid'

  class Record
    pageId: ''
    lastPageId: ''
    pageViewId: ''
    lastPageViewId: ''
    count: 0
    queue: []

  do ->
    getTimestamp = ()->
      return (new Date).getMilliseconds()

    # Local Storage Record Management
    useRecord = (fn)->
      record = store.get(getSessionId()) ? new Record
      fn record
      store.set getSessionId(), record

    # User/Session Id Management (on cookies)
    cachedUserId
    getUserId = ()->
      if cachedUserId?
        return cachedUserId

      userId = cookie.get userIdCookie
      if !userId?
        userId = uuid.v4()
        cookies.set userIdCookie, userId,
          domain: '.' + document.domain

      cachedUserId = userId
      return userId

    # cache the session id so we can resume if user leaves and returns to browser
    cachedSessionId
    getSessionId = ()->
      if cachedSessionId?
        return cachedSessionId

      sessionId = cookie.get sessionIdCookie
      if !sessionId?
        sessionId = getUserId() + '_' + getTimestamp()
        cookies.set sessionIdCookie, sessionId,
          domain: '.' + document.domain
          expires: 1800

      useRecord (record)->
        record.count = 0

      cachedSessionId = sessionId
      return sessionId

    refreshSession = ()->
      #cookie needs to be refreshed always
      sessionId = cookies.get
      cookies.set sessionIdCookie, sessionId,
        domain: '.' + document.domain
        expires: 1800

    # Page Transitions (in localstorage)
    cachedPageId
    cachedPageViewId
    getPageId = ()->
      return cachedPageId

    getPageViewId = ()->
      return cachedPageViewId

    getQueryParams = ()->
      return qs.parse window.location.search

    updatePage = ()->
      newPageId = window.location.pathname + window.location.hash
      if newPageId != cachedPageId
        cachedPageId = newPageId
        cachedPageViewId = cachedPageId + '_' + getTimestamp()

        useRecord (record)->
          record.lastPageId = record.pageId
          record.lastPageViewId = record.pageViewId
          record.pageId = cachedPageId
          record.pageViewId = cachedPageViewId

        Espy 'PageView',
          lastPageId:       record.lastPageId
          lastPageViewId:   record.lastPageViewId
          url:              window.location.href
          referrerUrl:      document.referrer
          queryParams:      getQueryParams()

    Espy = (name, data)->
      ua = window.navigator.userAgent

      useRecord (record)->
        record.queue.push
          userId:           getUserId()
          sessionId:        getSessionId()

          pageId:           record.pageId
          pageViewId:       record.pageViewId

          uaString:         ua
          ua:               userAgent ua
          timestamp:        new Date()

          event:            name
          data:             data
          count:            record.count

        record.count++

      refreshSession()

    # Flush Queue
    flush = ()->
      useRecord (record)->
        retry = 0
        data = record.queue.slice(0)

        xhr = new XMLHttpRequest
        xhr.onreadystatechange = ()->
          if xhr.readyState == 4
            if xhr.status != 200
              retry++
              if retry == 3
                console.log('Espy: failed to send', data)
              else
                console.log('Espy: retrying send x' + retry)
        xhr.open 'POST', Espy.url
        xhr.send(data)

        record.queue.length = 0

    # Bind Page Transitions
    window.addEspyListener 'hashchange', updatePage
    window.addEspyListener 'popstate', updatePage

    window.beforeUnload 'beforeunload', ()->
      Espy 'PageLeave'

    flush()
    updatePage()

    setInterval ()->
      flush()
    , 2000

Espy.url = 'https://analytics.crowdstart.com/'
module.exports = Espy
