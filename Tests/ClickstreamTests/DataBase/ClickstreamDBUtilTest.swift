//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class ClickstreamDBUtiltest: XCTestCase {
    let testAppId = "testAppId"
    var dbUtil: ClickstreamDBUtil!
    var dbAdapter: BaseDBAdapter!
    var clickstreamEvent: ClickstreamEvent!
    var storageEvent: StorageEvent!

    override func setUp() {
        do {
            let appId = testAppId + UUID().uuidString
            dbAdapter = try BaseDBAdapter(prefixPath: EventRecorder.Constants.dbPathPrefix,
                                          databaseName: appId)
            dbUtil = ClickstreamDBUtil(dbAdapter: dbAdapter)
            try dbUtil.createTable()
            let storage = ClickstreamContextStorage(userDefaults: UserDefaults.standard)
            clickstreamEvent = ClickstreamEvent(eventType: "testEvent",
                                                appId: appId,
                                                uniqueId: UUID().uuidString,
                                                session: Session(uniqueId: UUID().uuidString, sessionIndex: 1),
                                                systemInfo: SystemInfo(storage: storage),
                                                netWorkType: NetWorkType.Wifi)
            let eventJson = clickstreamEvent.toJsonObject().toJsonString()
            storageEvent = StorageEvent(eventJson: clickstreamEvent.toJsonObject().toJsonString(), eventSize: Int64(eventJson.count))
        } catch {
            XCTFail("Fail to setup dbUtil error:\(error)")
        }
    }

    override func tearDown() async throws {
        try dbUtil.deleteAllEvents()
        dbUtil = nil
        dbAdapter = nil
    }

    func testSaveEvent() {
        do {
            try dbUtil.saveEvent(storageEvent)
            let eventCount = try dbUtil.getEventCount()
            XCTAssertEqual(1, eventCount)
        } catch {
            XCTFail("fail to save event error:\(error)")
        }
    }

    func testSaveEventParamsCorrect() {
        do {
            try dbUtil.saveEvent(storageEvent)
            let event = try dbUtil.getEventsWith(limit: 1)[0]
            XCTAssertEqual(storageEvent.eventSize, event.eventSize)
            XCTAssertEqual(storageEvent.eventJson, event.eventJson)
        } catch {
            XCTFail("fail to save event error:\(error)")
        }
    }

    func testGetEventsWith() {
        do {
            for _ in 0 ..< 12 {
                try dbUtil.saveEvent(storageEvent)
            }

            let events = try dbUtil.getEventsWith(limit: 10)
            XCTAssertEqual(10, events.count)
            let eventCount = try dbUtil.getEventCount()
            XCTAssertEqual(12, eventCount)
        } catch {
            XCTFail("fail to save event error:\(error)")
        }
    }

    func testDeleteEvent() {
        do {
            for _ in 0 ..< 3 {
                try dbUtil.saveEvent(storageEvent)
            }

            let events = try dbUtil.getEventsWith(limit: 3)
            XCTAssertEqual(3, events.count)
            try dbUtil.deleteEvent(eventId: events[0].id!)

            let eventCount = try dbUtil.getEventCount()
            XCTAssertEqual(2, eventCount)
        } catch {
            XCTFail("fail to save event error:\(error)")
        }
    }

    func testDeleteBatchEvents() {
        do {
            for _ in 0 ..< 10 {
                try dbUtil.saveEvent(storageEvent)
            }

            let events = try dbUtil.getEventsWith(limit: 10)
            XCTAssertEqual(10, events.count)
            _ = try dbUtil.deleteBatchEvents(lastEventId: events[4].id!)

            let eventCount = try dbUtil.getEventCount()
            XCTAssertEqual(5, eventCount)
        } catch {
            XCTFail("fail to save event error:\(error)")
        }
    }

    func testDeleteAllEvents() {
        do {
            for _ in 0 ..< 10 {
                try dbUtil.saveEvent(storageEvent)
            }
            try dbUtil.deleteAllEvents()
            let eventCount = try dbUtil.getEventCount()
            XCTAssertEqual(0, eventCount)
        } catch {
            XCTFail("fail to save event error:\(error)")
        }
    }

    func testGetTotalSize() {
        do {
            let singleEventSize = storageEvent.eventSize
            for _ in 0 ..< 10 {
                try dbUtil.saveEvent(storageEvent)
            }
            let totalSize = try dbUtil.getTotalSize()
            XCTAssertEqual(singleEventSize * 10, totalSize)
        } catch {
            XCTFail("fail to save event error:\(error)")
        }
    }
}
