#client only
Espy = ()->

if window?
  if !window.console? || !window.console.log?
    window.console.log = ()->

  store = require 'store'
  cookies = require 'cookies-js'
  userAgent = require 'ua-parser-js'
  qs = require 'query-string'

  uuid = require 'node-uuid'

  userIdCookie = '__cs-uid'
  sessionIdCookie = '__cs-sid'

  newRecord =
    pageId: ''
    lastPageId: ''
    pageViewId: ''
    lastPageViewId: ''
    count: 0
    queue: []

  do ->
    getTimestamp = ()->
      return (new Date).getMilliseconds()

    cachedDomain = ''
    getDomain = ()->
      if !cachedDomain
        cachedDomain = if document.domain != 'localhost' then '.' + document.domain else ''
      return cachedDomain

    # Local Storage Record Management
    getRecord = ()->
      store.get(getSessionId()) ? newRecord

    saveRecord = (record)->
      store.set getSessionId(), record

    # User/Session Id Management (on cookies)
    cachedUserId = ''
    getUserId = ()->
      if cachedUserId
        return cachedUserId

      userId = cookies.get userIdCookie
      if !userId
        userId = uuid.v4()
        cookies.set userIdCookie, userId,
          domain: getDomain()

      cachedUserId = userId
      return userId

    # cache the session id so we can resume if user leaves and returns to browser
    cachedSessionId = ''
    getSessionId = ()->
      if cachedSessionId
        return cachedSessionId

      sessionId = cookies.get sessionIdCookie
      if !sessionId
        sessionId = getUserId() + '_' + getTimestamp()
        cookies.set sessionIdCookie, sessionId,
          domain: getDomain()
          expires: 1800

        cachedSessionId = sessionId

        record = getRecord()
        record.count = 0
        saveRecord(record)

      cachedSessionId = sessionId

      return sessionId

    refreshSession = ()->
      #cookie needs to be refreshed always
      sessionId = cookies.get
      cookies.set sessionIdCookie, sessionId,
        domain: '.' + document.domain
        expires: 1800

    # Page Transitions (in localstorage)
    cachedPageId = ''
    cachedPageViewId = ''
    getPageId = ()->
      return cachedPageId

    getPageViewId = ()->
      return cachedPageViewId

    getQueryParams = ()->
      return qs.parse(window.location.search || window.location.hash.split('?')[1])

    updatePage = ()->
      record = getRecord()

      newPageId = window.location.pathname + window.location.hash
      if newPageId != record.pageId
        cachedPageId = newPageId
        cachedPageViewId = cachedPageId + '_' + getTimestamp()

        record = getRecord()
        record.lastPageId = record.pageId
        record.lastPageViewId = record.pageViewId
        record.pageId = cachedPageId
        record.pageViewId = cachedPageViewId
        saveRecord record

        Espy 'PageView',
          lastPageId:       record.lastPageId
          lastPageViewId:   record.lastPageViewId
          url:              window.location.href
          referrerUrl:      document.referrer
          queryParams:      getQueryParams()

    Espy = (name, data)->
      ua = window.navigator.userAgent

      record = getRecord()
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
      saveRecord record

      refreshSession()

    # Flush Queue
    flush = ()->
      record = getRecord()
      if record.queue.length > 0
        Espy.onflush record
        retry = 0
        data = JSON.stringify record.queue

        xhr = new XMLHttpRequest
        xhr.onreadystatechange = ()->
          if xhr.readyState == 4
            if xhr.status != 204
              retry++
              if retry == 3
                console.log 'Espy: failed to send', JSON.parse data
              else
                xhr.open 'POST', Espy.url
                xhr.send data
                console.log 'Espy: retrying send x' + retry
        xhr.open 'POST', Espy.url
        xhr.setRequestHeader 'Content-Type', 'application/json'
        xhr.send data

        record.queue.length = 0
        saveRecord record

    # Bind Page Transitions
    window.addEventListener 'hashchange', updatePage
    window.addEventListener 'popstate', updatePage

    window.addEventListener 'beforeunload', ()->
      Espy 'PageChange'

    updatePage()

    next = ()->
      setTimeout ()->
        flush()
        next()
      Espy.flushRate || 200

    # prevent blocking page load
    setTimeout ()->
      next()
    , 1

    window.Espy = Espy

Espy.url = 'https://analytics.crowdstart.com/'
Espy.onflush = ()->
Espy.flushRate = 200

module.exports = Espy
