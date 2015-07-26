assert = require 'assert'
should = require('chai').should()

{getBrowser} = require './util'

describe "Espy (#{process.env.BROWSER})", ->
  @timeout 120000
  browser  = getBrowser()
  testPage = "http://localhost:#{process.env.PORT ? 3333}/test.html"

  describe 'Espy should queue events', ->
    it 'should capture page view', (done) ->
      browser
        .url testPage
        .waitForExist '#flush'
        .getText '#flush', (err, res) ->
          record = JSON.parse(res)

          queue = record.queue
          queue.length.should.equal 1
          event = queue[0]
          event.userId.should.exist
          event.sessionId.should.exist
          event.pageId.should.equal '/test.html'
          event.pageViewId.substring(0, 11).should.equal '/test.html_'
          event.uaString.should.exist
          event.ua.should.exist
          event.timestamp.should.exist
          event.event.should.equal 'PageView'
          event.data.should.exist
          event.data.queryParams.should.exist
          event.data.lastPageId.should.equal ''
          event.data.lastPageViewId.should.equal ''
          event.data.referrerUrl.should.equal ''
          event.data.url.should.equal 'http://localhost:3333/test.html'

        .call done

    it 'should capture query params', (done) ->
      browser
        .url testPage + '#test?q=1'
        .waitForExist '#flush'
        .getText '#flush', (err, res) ->
          record = JSON.parse(res)

          queue = record.queue
          queue.length.should.equal 1
          event = queue[0]
          event.event.should.equal 'PageView'
          event.data.url.should.equal 'http://localhost:3333/test.html#test?q=1'
          event.data.queryParams.q.should.equal '1'

        .call done

    it 'should capture generic events', (done)->
      browser
        .url testPage
        .waitForExist '#flush'
        .click '#1'
        .getText '#flush', (err, res) ->
          record = JSON.parse(res)

          queue = record.queue
          queue.length.should.equal 1
          event = queue[0]
          event.event.should.equal 'click_1'
        .call done

    #it 'should capture page leave', (done) ->
