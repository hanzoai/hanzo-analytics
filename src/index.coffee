store = require 'store'
cookie = require 'cookie-js'
useragent = require 'useragent'
qs = require 'query-string'

uuid = require 'node-uuid'

userIdCookie = '__cs-uid'
sessionIdCookie = '__cs-sid'

class Record
  pageId: ''
  lastPageId: ''
  pageViewId: ''
  lastPageViewId: ''
  queue: []

class Event

do ->
  # Local Storage Record Management
  getRecord = ()->
    return store.get(getSessionId()) ? new Record

  setRecord = (record)->
    return store.set getSessionId(), record ? new Record

  getTimestamp = ()->
    return (new Date).getMilliseconds()

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

      #fireEventHere!

      record = getRecord()
      record.lastPageId = record.pageId
      record.lastPageViewId = record.pageViewId
      record.pageId = cachedPageId
      record.pageViewId = cachedPageViewId

      refreshSession()

  window.addEventListener 'hashchange', updatePage
  window.addEventListener 'popstate', updatePage
  updatePage()

