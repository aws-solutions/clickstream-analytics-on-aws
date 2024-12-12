//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import Foundation
import Swifter
import XCTest

class EventRecorderTest: XCTestCase {
    let testAppId = "testAppId"
    let testUnKnowEndpoint = "https://example.com/collect"
    let testSuccessEndpoint = "http://localhost:8080/collect"
    let testFailEndpoint = "http://localhost:8080/collect/fail"
    let testSuccessWithDelayEndpoint = "http://localhost:8080/collect/success/delay"
    let testHashCodeEndpoint = "http://localhost:8080/collect/hashcode"
    let testUploadTimestampEndpoint = "http://localhost:8080/collect/timestamp"
    var dbUtil: ClickstreamDBProtocol!
    var clickstreamEvent: ClickstreamEvent!
    var eventRecorder: EventRecorder!
    var clickstream: ClickstreamContext!
    var server: HttpServer!
    var activityTracker: MockActivityTracker!
    var sessionClient: SessionClient!

    override func setUp() async throws {
        do {
            UserDefaults.standard.removePersistentDomain(forName: Bundle.main.bundleIdentifier!)
            server = HttpServer()
            server["/collect"] = { _ in
                HttpResponse.ok(.text("request success"))
            }
            server["/collect/fail"] = { _ in
                HttpResponse.badRequest(.text("request fail"))
            }
            server["/collect/success/delay"] = { _ in
                Thread.sleep(forTimeInterval: 0.1)
                return HttpResponse.ok(.text("request success"))
            }
            try! server.start()
            let appId = testAppId + UUID().uuidString

            let contextConfiguration = ClickstreamConfiguration.getDefaultConfiguration()
                .withAppId(appId)
                .withEndpoint(testSuccessEndpoint)
                .withSendEventInterval(10_000)
                .withTrackAppExceptionEvents(false)
                .withCompressEvents(false)
            contextConfiguration.isLogEvents = false
            clickstream = try ClickstreamContext(with: contextConfiguration)
            clickstreamEvent = ClickstreamEvent(eventType: "testEvent",
                                                appId: testAppId,
                                                uniqueId: clickstream.userUniqueId,
                                                session: Session(uniqueId: UUID().uuidString, sessionIndex: 1),
                                                systemInfo: SystemInfo(storage: clickstream.storage),
                                                netWorkType: NetWorkType.Wifi)
            eventRecorder = try! EventRecorder(clickstream: clickstream)
            dbUtil = eventRecorder.dbUtil

            activityTracker = MockActivityTracker()
            sessionClient = SessionClient(activityTracker: activityTracker, clickstream: clickstream)
            clickstream.sessionClient = sessionClient
            let analyticsClient = try AnalyticsClient(
                clickstream: clickstream,
                eventRecorder: eventRecorder,
                sessionClient: sessionClient
            )
            clickstream.analyticsClient = analyticsClient
            clickstream.networkMonitor = MockNetworkMonitor()
        } catch {
            XCTFail("Fail to setup EventRecorder error:\(error)")
        }
    }

    override func tearDown() async throws {
        try dbUtil.deleteAllEvents()
        server.stop()
        dbUtil = nil
    }

    func testSaveEventSuccess() throws {
        try eventRecorder.save(clickstreamEvent)
        let eventCount = try dbUtil.getEventCount()
        XCTAssertEqual(1, eventCount)
        XCTAssertTrue(eventRecorder.bundleSequenceId == 1)
    }

    func testRecordEventForReachedMaxDbSize() throws {
        let str = "abcdeabcde"
        var jsonString = ""
        for _ in 0 ..< 100 {
            jsonString.append(str)
        }
        for j in 0 ..< 200 {
            clickstreamEvent.addAttribute(jsonString, forKey: "test_json_\(j)")
        }
        for _ in 0 ..< 260 {
            try eventRecorder.save(clickstreamEvent)
        }
        XCTAssertTrue(try dbUtil.getTotalSize() < EventRecorder.Constants.maxDbSize)
        XCTAssertEqual(256, try dbUtil.getEventCount())
    }

    func testGetEventWithAllAttribute() throws {
        try eventRecorder.save(clickstreamEvent)
        let event = try eventRecorder.getBatchEvent().eventsJson.jsonArray()[0]
        XCTAssertNil(event["hashCode"])
        XCTAssertEqual(clickstream.userUniqueId, event["unique_id"] as! String)
        XCTAssertEqual("testEvent", event["event_type"] as! String)
        XCTAssertNotNil(event["event_id"])
        XCTAssertEqual(testAppId, event["app_id"] as! String)
        XCTAssertNotNil(event["timestamp"])
        XCTAssertNotNil(event["device_id"])
        XCTAssertNotNil(event["device_unique_id"])
        XCTAssertEqual("iOS", event["platform"] as! String)
        XCTAssertNotNil(event["os_version"])
        XCTAssertEqual("apple", event["make"] as! String)
        XCTAssertEqual("apple", event["brand"] as! String)
        XCTAssertNotNil(event["model"])
        XCTAssertNotNil(event["locale"])
        XCTAssertNotNil(event["carrier"])
        XCTAssertNotNil(event["network_type"])
        XCTAssertNotNil(event["screen_height"])
        XCTAssertNotNil(event["screen_width"])
        XCTAssertNotNil(event["zone_offset"])
        XCTAssertNotNil(event["system_language"])
        XCTAssertNotNil(event["country_code"])
        XCTAssertEqual(PackageInfo.version, event["sdk_version"] as! String)
        XCTAssertEqual("aws-solution-clickstream-sdk", event["sdk_name"] as! String)
        XCTAssertNotNil(event["app_version"])
        XCTAssertNotNil(event["app_package_name"])
        XCTAssertNotNil(event["app_title"])
        XCTAssertNil(event["user"])
        XCTAssertNotNil(event["attributes"])
        XCTAssertNil(event["noneExistAttribute"])
    }

    func testGetEventWithGlobalAttribute() throws {
        clickstreamEvent.addGlobalAttribute("AppStore", forKey: "Channel")
        clickstreamEvent.addGlobalAttribute(5.1, forKey: "level")
        clickstreamEvent.addGlobalAttribute(true, forKey: "isOpenNotification")
        clickstreamEvent.addGlobalAttribute(6, forKey: "class")
        try eventRecorder.save(clickstreamEvent)
        let event = try eventRecorder.getBatchEvent().eventsJson.jsonArray()[0]
        let attribute = event["attributes"] as! [String: Any]
        XCTAssertEqual("AppStore", attribute["Channel"] as! String)
        XCTAssertEqual(5.1, attribute["level"] as! Double)
        XCTAssertEqual(6, attribute["class"] as! Int)
        XCTAssertEqual(true, attribute["isOpenNotification"] as! Bool)
    }

    func testGetEventWithUserAttribute() throws {
        var userInfo = JsonObject()
        let currentTimeStamp = Date().millisecondsSince1970
        var userAgeInfo = JsonObject()
        userAgeInfo["value"] = 21
        userAgeInfo["set_timestamp"] = currentTimeStamp
        userInfo["_user_age"] = userAgeInfo

        var isFirstOpenInfo = JsonObject()
        isFirstOpenInfo["value"] = true
        isFirstOpenInfo["set_timestamp"] = currentTimeStamp
        userInfo["isFirstOpen"] = isFirstOpenInfo

        var scoreInfo = JsonObject()
        scoreInfo["value"] = 85.5
        scoreInfo["set_timestamp"] = currentTimeStamp
        userInfo["score"] = scoreInfo

        var userNameInfo = JsonObject()
        userNameInfo["value"] = "carl"
        userNameInfo["set_timestamp"] = currentTimeStamp
        userInfo["_user_name"] = userNameInfo
        clickstreamEvent.setUserAttribute(userInfo)
        try eventRecorder.save(clickstreamEvent)
        let event = try eventRecorder.getBatchEvent().eventsJson.jsonArray()[0]
        let userAttributes = event["user"] as! [String: Any]
        XCTAssertEqual(21, (userAttributes["_user_age"] as! JsonObject)["value"] as! Int)
        XCTAssertEqual(true, (userAttributes["isFirstOpen"] as! JsonObject)["value"] as! Bool)
        XCTAssertEqual(85.5, (userAttributes["score"] as! JsonObject)["value"] as! Double)
        XCTAssertEqual("carl", (userAttributes["_user_name"] as! JsonObject)["value"] as! String)
    }

    func testModifyGlobalUserAttributesWillNotAffectTheEventUserAttributes() throws {
        var userInfo = JsonObject()
        let currentTimeStamp = Date().millisecondsSince1970
        var userNameInfo = JsonObject()
        userNameInfo["value"] = "carl"
        userNameInfo["set_timestamp"] = currentTimeStamp
        userInfo["_user_name"] = userNameInfo
        clickstreamEvent.setUserAttribute(userInfo)
        userInfo = JsonObject()
        userNameInfo["value"] = "mike"
        userInfo["_user_name"] = userNameInfo
        XCTAssertEqual((clickstreamEvent.userAttributes["_user_name"] as! JsonObject)["value"] as! String, "carl")
    }

    func testRecordEventWithInvalidAttribute() throws {
        clickstreamEvent.addGlobalAttribute(Decimal.nan, forKey: "invalidDecimal")
        try eventRecorder.save(clickstreamEvent)
        XCTAssertEqual(0, try dbUtil.getEventCount())
    }

    func testSaveMultiEvent() throws {
        for _ in 0 ..< 5 {
            try eventRecorder.save(clickstreamEvent)
        }
        let eventCount = try dbUtil.getEventCount()
        XCTAssertEqual(5, eventCount)
    }

    func testGetBatchEventForNoEvent() throws {
        let totalEvent = try dbUtil.getEventCount()
        XCTAssertEqual(0, totalEvent)
        let batchEvent = try eventRecorder.getBatchEvent()
        XCTAssertEqual("[]", batchEvent.eventsJson)
        XCTAssertEqual(0, batchEvent.eventCount)
        XCTAssertEqual(-1, batchEvent.lastEventId)
    }

    func testGetBatchEventForOneEvent() throws {
        try eventRecorder.save(clickstreamEvent)
        let totalEvent = try dbUtil.getEventCount()
        XCTAssertEqual(1, totalEvent)
        let batchEvent = try eventRecorder.getBatchEvent()
        let eventCount = batchEvent.eventCount
        let eventsJson = batchEvent.eventsJson
        let lastEventId = batchEvent.lastEventId
        XCTAssertEqual(1, eventCount)
        XCTAssertEqual(1, lastEventId)
        XCTAssertTrue(eventsJson.hasPrefix("[{"))
        XCTAssertTrue(eventsJson.hasSuffix("}]"))
        let event = eventsJson.jsonArray()[0]
        XCTAssertEqual("testEvent", event["event_type"] as! String)
        XCTAssertEqual(testAppId, event["app_id"] as! String)
    }

    func testGetBatchEventForMulitEvent() throws {
        for _ in 0 ..< 5 {
            try eventRecorder.save(clickstreamEvent)
        }
        let totalEvent = try dbUtil.getEventCount()
        XCTAssertEqual(5, totalEvent)
        let batchEvent = try eventRecorder.getBatchEvent()
        let eventCount = batchEvent.eventCount
        let eventsJson = batchEvent.eventsJson
        let lastEventId = batchEvent.lastEventId
        XCTAssertEqual(5, eventCount)
        XCTAssertEqual(5, lastEventId)
        XCTAssertTrue(eventsJson.hasPrefix("[{"))
        XCTAssertTrue(eventsJson.hasSuffix("}]"))
        let eventArray = eventsJson.jsonArray()
        XCTAssertEqual(5, eventArray.count)
        let event = eventsJson.jsonArray()[0]
        XCTAssertEqual("testEvent", event["event_type"] as! String)
        XCTAssertEqual(testAppId, event["app_id"] as! String)
    }

    func testGetBatchEventReachedMaxSubmissionSize() throws {
        let longAttributeValue = String(repeating: "a", count: 1_024)
        for i in 0 ..< 40 {
            clickstreamEvent.addAttribute(longAttributeValue, forKey: "testAttribute\(i)")
        }
        clickstreamEvent.addAttribute("testAttribute", forKey: "testAttribute")
        for _ in 0 ..< 15 {
            try eventRecorder.save(clickstreamEvent)
        }
        let batchEvent = try eventRecorder.getBatchEvent()
        let eventCount = batchEvent.eventCount
        let eventsJson = batchEvent.eventsJson
        let lastEventId = batchEvent.lastEventId
        XCTAssertTrue(eventsJson.hasPrefix("[{"))
        XCTAssertTrue(eventsJson.hasSuffix("}]"))

        XCTAssertTrue(eventCount < 15)
        XCTAssertEqual(12, lastEventId)
    }

    func testReachedMaxEventNumberOfBatch() throws {
        for _ in 0 ..< 101 {
            try eventRecorder.save(clickstreamEvent)
        }
        let eventTotalCount = try dbUtil.getEventCount()
        XCTAssertEqual(101, eventTotalCount)
        let batchEvent = try eventRecorder.getBatchEvent()
        let eventCount = batchEvent.eventCount
        let lastEventId = batchEvent.lastEventId
        XCTAssertEqual(100, eventCount)
        XCTAssertEqual(100, lastEventId)
    }

    func testProcessEventFailWithUnkownTestEndpoint() throws {
        clickstream.configuration.endpoint = testUnKnowEndpoint
        for _ in 0 ..< 5 {
            try eventRecorder.save(clickstreamEvent)
        }
        Thread.sleep(forTimeInterval: 0.1)
        let processedCount = eventRecorder.processEvent()
        XCTAssertEqual(0, processedCount)
    }

    func testProcessEventWithSuccessEndpoint() throws {
        clickstream.configuration.endpoint = testSuccessEndpoint
        for _ in 0 ..< 5 {
            try eventRecorder.save(clickstreamEvent)
        }
        Thread.sleep(forTimeInterval: 0.1)
        let processedCount = eventRecorder.processEvent()
        XCTAssertEqual(5, processedCount)
    }

    func testProcessEventWithFailEndpoint() throws {
        clickstream.configuration.endpoint = testFailEndpoint
        for _ in 0 ..< 5 {
            try eventRecorder.save(clickstreamEvent)
        }
        Thread.sleep(forTimeInterval: 0.1)
        let processedCount = eventRecorder.processEvent()
        XCTAssertEqual(0, processedCount)
    }

    func testProcessEventSuccessWithDelay() throws {
        clickstream.configuration.endpoint = testSuccessWithDelayEndpoint
        for _ in 0 ..< 5 {
            try eventRecorder.save(clickstreamEvent)
        }
        Thread.sleep(forTimeInterval: 0.1)
        let processedCount = eventRecorder.processEvent()
        XCTAssertEqual(5, processedCount)
    }

    func testProcessEventForTwiceSubmission() throws {
        let longAttributeValue = String(repeating: "a", count: 1_024)
        for i in 0 ..< 40 {
            clickstreamEvent.addAttribute(longAttributeValue, forKey: "testAttribute\(i)")
        }
        clickstreamEvent.addAttribute("testAttribute", forKey: "testAttribute")
        for _ in 0 ..< 15 {
            try eventRecorder.save(clickstreamEvent)
        }
        Thread.sleep(forTimeInterval: 0.1)
        let totalEventSent = eventRecorder.processEvent()
        XCTAssertEqual(15, totalEventSent)
    }

    func testProcessEventForSubmitPartOfEvent() throws {
        let longAttributeValue = String(repeating: "a", count: 1_024)
        for i in 0 ..< 40 {
            clickstreamEvent.addAttribute(longAttributeValue, forKey: "testAttribute\(i)")
        }
        clickstreamEvent.addAttribute("testAttribute", forKey: "testAttribute")
        for _ in 0 ..< 40 {
            try eventRecorder.save(clickstreamEvent)
        }
        Thread.sleep(forTimeInterval: 0.1)
        let firstEventSentCount = eventRecorder.processEvent()
        XCTAssertTrue(firstEventSentCount < 40)
        let secondEventSentCount = eventRecorder.processEvent()
        XCTAssertEqual(40, firstEventSentCount + secondEventSentCount)
    }

    func testSubmitOneEventSuccess() throws {
        try eventRecorder.save(clickstreamEvent)
        eventRecorder.submitEvents()
        XCTAssertEqual(1, eventRecorder.queue.operationCount)
        Thread.sleep(forTimeInterval: 0.3)
        let totalEvent = try dbUtil.getEventCount()
        XCTAssertEqual(0, totalEvent)
        XCTAssertTrue(eventRecorder.bundleSequenceId == 2)
    }

    func testSubmitMultiSubmissionForOneProcessSuccess() throws {
        let longAttributeValue = String(repeating: "a", count: 1_024)
        for i in 0 ..< 40 {
            clickstreamEvent.addAttribute(longAttributeValue, forKey: "testAttribute\(i)")
        }
        clickstreamEvent.addAttribute("testAttribute", forKey: "testAttribute")
        for _ in 0 ..< 15 {
            try eventRecorder.save(clickstreamEvent)
        }

        eventRecorder.submitEvents()
        XCTAssertEqual(1, eventRecorder.queue.operationCount)
        Thread.sleep(forTimeInterval: 0.8)
        let totalEvent = try dbUtil.getEventCount()
        XCTAssertEqual(0, totalEvent)
        XCTAssertTrue(eventRecorder.bundleSequenceId == 3)
    }

    func testOneSubmitForNotProcessAllEvent() throws {
        let longAttributeValue = String(repeating: "a", count: 1_024)
        for i in 0 ..< 40 {
            clickstreamEvent.addAttribute(longAttributeValue, forKey: "testAttribute\(i)")
        }
        clickstreamEvent.addAttribute("testAttribute", forKey: "testAttribute")
        for _ in 0 ..< 40 {
            try eventRecorder.save(clickstreamEvent)
        }
        eventRecorder.submitEvents()
        XCTAssertEqual(1, eventRecorder.queue.operationCount)
        Thread.sleep(forTimeInterval: 0.3)
        let totalEvent = try dbUtil.getEventCount()
        XCTAssertTrue(totalEvent > 0)
    }

    func testMultiSubmitSuccess() throws {
        let longAttributeValue = String(repeating: "a", count: 1_024)
        for i in 0 ..< 40 {
            clickstreamEvent.addAttribute(longAttributeValue, forKey: "testAttribute\(i)")
        }
        clickstreamEvent.addAttribute("testAttribute", forKey: "testAttribute")
        for _ in 0 ..< 40 {
            try eventRecorder.save(clickstreamEvent)
        }
        eventRecorder.submitEvents()
        eventRecorder.submitEvents()
        XCTAssertEqual(2, eventRecorder.queue.operationCount)
    }

    func testProcessEventQueueReachedMaxOperationCount() throws {
        for _ in 0 ..< 100 {
            try eventRecorder.save(clickstreamEvent)
        }
        for _ in 0 ..< 1_100 {
            eventRecorder.submitEvents()
        }
        XCTAssertTrue(eventRecorder.queue.operationCount <= 1_000)
    }

    func testBackgroundModeAutoSendRequest() throws {
        sessionClient.startActivityTracking()
        activityTracker.callback?(.runningInForeground)
        try eventRecorder.save(clickstreamEvent)
        activityTracker.callback?(.runningInBackground)
        XCTAssertTrue(eventRecorder.queue.operationCount > 0)
    }

    func testVerifyHashCodeInRequestParameter() {
        clickstream.configuration.endpoint = testHashCodeEndpoint
        let eventJson = "[" + clickstreamEvent.toJsonObject().toJsonString() + "]"
        let eventJsonHashCode = eventJson.hashCode()
        server["/collect/hashcode"] = { request in
            let queryParams = request.queryParams
            // swift lambda for get the hashCode value in queryParams dictionary
            let hashCodeValue = queryParams.first(where: { $0.0 == "hashCode" })?.1
            if hashCodeValue == eventJsonHashCode {
                return .ok(.text("Success"))
            }
            return .badRequest(.text("Fail"))
        }
        let result = NetRequest.uploadEventWithURLSession(eventsJson: eventJson, configuration: clickstream.configuration, bundleSequenceId: 1)
        XCTAssertTrue(result)
    }

    func testVerifyUploadTimestampInRequestParameter() {
        clickstream.configuration.endpoint = testUploadTimestampEndpoint
        server["/collect/timestamp"] = { request in
            let queryParams = request.queryParams
            // swift lambda for get the upload_timestamp value in queryParams dictionary
            let uploadTimestamp = queryParams.first(where: { $0.0 == "upload_timestamp" })?.1
            let requestUploadTimestamp = Int64(uploadTimestamp!)!
            if Date().millisecondsSince1970 - requestUploadTimestamp < 10_000 {
                return .ok(.text("Success"))
            }
            return .badRequest(.text("Fail"))
        }
        let result = NetRequest.uploadEventWithURLSession(eventsJson: "[]", configuration: clickstream.configuration, bundleSequenceId: 1)
        XCTAssertTrue(result)
    }
}

extension String {
    /// convert jsonString to json array object
    /// - Returns: json array object
    func jsonArray() -> [[String: Any]] {
        do {
            guard let data = data(using: .utf8) else {
                return []
            }
            let jsonArray = try JSONSerialization.jsonObject(with: data, options: []) as! [[String: Any]]
            return jsonArray
        } catch {
            print("Error parsing JSON: \(error)")
        }
        return []
    }
}
