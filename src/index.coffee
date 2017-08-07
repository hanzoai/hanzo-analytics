import store from 'akasha'
import cookies from 'es-cookies'
import userAgent from 'es-ua-parser'
import uuidGen from 'js-uuid'

#client only
HanzoAnalytics = ()->

expirationTime = 1800 # 30 minutes
uuidExpirationTime = 60 * 60 * 24 * 365 * 2 # 2 years
userCookie = 'hzo'

# https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
qs = (qstr)->
  query = {}
  a = qstr.split('&')
  for i in [0...a.length]
    b = a[i].split '='
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '')
  return query

if window?
  if !window.console? || !window.console.log?
    window.console.log = ()->

  uuidCookie = '__cs-uid'
  sessionIdCookie = '__cs-sid'

  newRecord =
    pageId: ''
    lastPageId: ''
    pageViewId: ''
    lastPageViewId: ''
    count: 0
    queue: []

  do ->
    getUserIdFromJWT = (jwt)->
      if !jwt || typeof jwt != 'string'
        return null

      parts = jwt.split '.'

      if !parts[1]
        return null

      str = atob parts[1]

      try
        data = JSON.parsestr
      catch e
        return null

      return data['user-id']

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
    cachedUuid = ''
    getUuid = ()->
      if cachedUuid
        return cachedUuid

      uuid = cookies.get uuidCookie
      if !uuid
        uuid = uuidGen.v4()
        cookies.set uuidCookie, uuid,
          domain: getDomain()
          expires: uuidExpirationTime

      cachedUuid = uuid
      return uuid

    # cache the session id so we can resume if user leaves and returns to browser
    cachedSessionId = ''
    getSessionId = ()->
      if cachedSessionId
        return cachedSessionId

      sessionId = cookies.get sessionIdCookie
      if !sessionId
        sessionId = getUuid() + '_' + getTimestamp()
        cookies.set sessionIdCookie, sessionId,
          domain: getDomain()
          expires: expirationTime

        cachedSessionId = sessionId

        record = getRecord()
        record.count = 0
        saveRecord(record)

      cachedSessionId = sessionId

      return sessionId

    refreshSession = ()->
      #cookie needs to be refreshed always
      sessionId = cookies.get sessionIdCookie
      cookies.set sessionIdCookie, sessionId,
        domain: '.' + document.domain
        expires: expirationTime

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

        HanzoAnalytics 'PageView',
          lastPageId:       record.lastPageId
          lastPageViewId:   record.lastPageViewId
          url:              window.location.href
          referrerUrl:      document.referrer
          queryParams:      getQueryParams()

    HanzoAnalytics = (name, data)->
      record = getRecord()
      ua = window.navigator.userAgent

      r =
        uuid:       getUuid()
        userId:     getUserIdFromJWT()
        ga:         cookies.get '_ga'
        gid:        cookies.get '_gid'
        fr:         cookies.get 'fr'

        sessionId:  getSessionId()
        pageId:     record.pageId
        pageViewId: record.pageViewId

        uaString:   ua
        ua:         userAgent ua
        timestamp:  new Date()

        event:      name
        data:       data
        count:      record.count

      userId = cookies.get userCookie
      if userId
        r.userId = userId

      record.queue.push r

      record.count++
      saveRecord record

      refreshSession()

    # Flush Queue
    flush = ()->
      record = getRecord()
      if record.queue.length > 0
        HanzoAnalytics.onFlush record
        retry = 0
        data = JSON.stringify record.queue

        url = HanzoAnalytics.url + HanzoAnalytics.orgId

        xhr = new XMLHttpRequest
        xhr.onreadystatechange = ()->
          if xhr.readyState == 4
            if xhr.status != 204
              retry++
              if retry == 3
                console.log 'HanzoAnalytics: failed to send', JSON.parse data
              else
                xhr.open 'POST', url
                xhr.send data
                console.log 'HanzoAnalytics: retrying send x' + retry
        xhr.open 'POST', url
        xhr.setRequestHeader 'Content-Type', 'application/json'
        xhr.send data

        record.queue.length = 0
        saveRecord record

    # Bind Page Transitions
    window.addEventListener 'hashchange', updatePage
    window.addEventListener 'popstate', updatePage

    window.addEventListener 'beforeunload', ()->
      HanzoAnalytics 'PageChange'

    updatePage()

    next = ()->
      setTimeout ()->
        flush()
        next()
      , HanzoAnalytics.flushRate || 200

    # prevent blocking page load
    setTimeout ()->
      next()
    , 1

    window.HanzoAnalytics = HanzoAnalytics
    window.ha = HanzoAnalytics

HanzoAnalytics.url = 'https://a.hanzo.io/'
HanzoAnalytics.onFlush = ()->
HanzoAnalytics.flushRate = 1000
HanzoAnalytics.orgId = ''

export default HanzoAnalytics
