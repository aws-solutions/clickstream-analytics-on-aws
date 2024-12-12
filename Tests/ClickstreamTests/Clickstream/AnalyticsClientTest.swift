//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class AnalyticsClientTest: XCTestCase {
    private var analyticsClient: AnalyticsClient!
    private var eventRecorder: MockEventRecorder!
    private var clickstream: ClickstreamContext!
    private var session: Session!
    let testAppId = "testAppId"
    let testEndpoint = "https://example.com/collect"

    override func setUp() async throws {
        UserDefaults.standard.removePersistentDomain(forName: Bundle.main.bundleIdentifier!)
        let contextConfiguration = ClickstreamConfiguration.getDefaultConfiguration()
            .withAppId(testAppId + UUID().uuidString)
            .withEndpoint(testEndpoint)
            .withSendEventInterval(10_000)
            .withTrackAppExceptionEvents(false)
            .withCompressEvents(false)
        clickstream = try ClickstreamContext(with: contextConfiguration)
        let sessionClient = SessionClient(clickstream: clickstream)
        clickstream.sessionClient = sessionClient

        clickstream.networkMonitor = MockNetworkMonitor()
        eventRecorder = MockEventRecorder()
        session = sessionClient.getCurrentSession()
        analyticsClient = try AnalyticsClient(
            clickstream: clickstream,
            eventRecorder: eventRecorder,
            sessionClient: sessionClient
        )
    }

    override func tearDown() async throws {
        analyticsClient = nil
        session = nil
        eventRecorder = nil
    }

    // MARK: - testGlobalAttribute

    func testAddGlobalAttributeSuccess() {
        analyticsClient.addGlobalAttribute("appStore", forKey: "channel")
        let globalAttributeCount = analyticsClient.globalAttributes.count
        let attributeValue = analyticsClient.globalAttributes["channel"] as? String
        XCTAssertEqual(globalAttributeCount, 1)
        XCTAssertEqual(attributeValue, "appStore")
    }

    func testAddGlobalAttributeForExceedNameLength() {
        let exceedName = String(repeating: "a", count: 51)
        analyticsClient.addGlobalAttribute("value", forKey: exceedName)
        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_NAME_LENGTH_EXCEED, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
    }

    func testAddGlobalAttributeForInvalidName() {
        let invalidName = "1_goods_expose"
        analyticsClient.addGlobalAttribute("value", forKey: invalidName)
        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_NAME_INVALID, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)

        let errorValue = eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertTrue(errorValue.contains(invalidName))
    }

    func testAddGlobalAttributeForExceedValueLength() {
        let exceedValue = String(repeating: "a", count: 1_025)
        analyticsClient.addGlobalAttribute(exceedValue, forKey: "name01")
        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_VALUE_LENGTH_EXCEED, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
        let errorValue = eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertTrue(errorValue.contains("name01"))
    }

    func testRemoveGlobalAttribute() {
        analyticsClient.addGlobalAttribute("value1", forKey: "name01")
        analyticsClient.addGlobalAttribute("value2", forKey: "name02")
        analyticsClient.removeGlobalAttribute(forKey: "name01")
        let value1 = analyticsClient.globalAttributes["name01"]
        let value2 = analyticsClient.globalAttributes["name02"]
        XCTAssertNil(value1)
        XCTAssertNotNil(value2)
    }

    func testRemoveNonExistingGlobalAttribute() {
        for i in 0 ..< 500 {
            analyticsClient.addGlobalAttribute("value", forKey: "name\(i)")
        }
        analyticsClient.removeGlobalAttribute(forKey: "name1000")
        let globalAttributeCount = analyticsClient.globalAttributes.count
        XCTAssertEqual(500, globalAttributeCount)
    }

    func testAddGlobalAttributeForSizeExceed() {
        for i in 0 ..< 501 {
            analyticsClient.addGlobalAttribute("value", forKey: "name\(i)")
        }
        Thread.sleep(forTimeInterval: 0.2)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_SIZE_EXCEED, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
        let errorValue = eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String

        XCTAssertTrue(errorValue.contains("name500"))
    }

    func testAddGlobalAttributeSameNameMultiTimes() {
        for i in 0 ..< 500 {
            analyticsClient.addGlobalAttribute("value\(i)", forKey: "name")
        }
        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(0, eventRecorder.saveCount)
        let globalAttributeCount = analyticsClient.globalAttributes.count
        XCTAssertEqual(1, globalAttributeCount)
    }

    // MARK: - testUserAttribute

    func testAddUserAttributeSuccess() {
        analyticsClient.addUserAttribute("appStore", forKey: "userChannel")
        let userAttributeCount = analyticsClient.allUserAttributes.count
        let attributeValue = (analyticsClient.allUserAttributes["userChannel"] as! JsonObject)["value"] as? String
        XCTAssertEqual(userAttributeCount, 2)
        XCTAssertEqual(attributeValue, "appStore")
    }

    func testAddUserAttributeForExceedNameLength() {
        let exceedName = String(repeating: "a", count: 51)
        analyticsClient.addUserAttribute("value", forKey: exceedName)

        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.USER_ATTRIBUTE_NAME_LENGTH_EXCEED, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
        let errorValue = eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertTrue(errorValue.contains(exceedName))
    }

    func testAddUserAttributeForInvalidName() {
        let invalidName = "1_goods_expose"
        analyticsClient.addUserAttribute("value", forKey: invalidName)

        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.USER_ATTRIBUTE_NAME_INVALID, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
        let errorValue = eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertTrue(errorValue.contains(invalidName))
    }

    func testAddUserAttributeForExceedValueLength() {
        let exceedValue = String(repeating: "a", count: 257)
        analyticsClient.addUserAttribute(exceedValue, forKey: "name01")

        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.USER_ATTRIBUTE_VALUE_LENGTH_EXCEED, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
        let errorValue = eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertTrue(errorValue.contains("name01"))
    }

    func testRemoveUserAttribute() {
        analyticsClient.addUserAttribute("value1", forKey: "name01")
        analyticsClient.addUserAttribute("value2", forKey: "name02")
        analyticsClient.removeUserAttribute(forKey: "name01")
        let value1 = analyticsClient.allUserAttributes["name01"]
        let value2 = analyticsClient.allUserAttributes["name02"]
        XCTAssertNil(value1)
        XCTAssertNotNil(value2)
    }

    func testRemoveNonExistingUserAttribute() {
        for i in 0 ..< 100 {
            analyticsClient.addUserAttribute("value", forKey: "name\(i)")
        }
        analyticsClient.removeUserAttribute(forKey: "name1000")
        let userAttributeCount = analyticsClient.allUserAttributes.count
        XCTAssertEqual(100, userAttributeCount)
    }

    func testAddUserAttributeForSizeExceed() {
        for i in 0 ..< 101 {
            analyticsClient.addUserAttribute("value", forKey: "name\(i)")
        }
        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.USER_ATTRIBUTE_SIZE_EXCEED, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
        let errorValue = eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertTrue(errorValue.contains("attribute name"))
    }

    func testAddUserAttributeSameNameMultiTimes() {
        for i in 0 ..< 100 {
            analyticsClient.addUserAttribute("value\(i)", forKey: "name")
        }
        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertEqual(0, eventRecorder.saveCount)
        let userAttributeCount = analyticsClient.allUserAttributes.count
        XCTAssertEqual(2, userAttributeCount)
    }

    func testInitialvalueInAnalyticsClient() {
        let userId = analyticsClient.userId
        let userUniqueId = clickstream.userUniqueId
        XCTAssertNil(userId)
        XCTAssertNotNil(userUniqueId)
        let userAttribute = analyticsClient.allUserAttributes
        XCTAssertTrue(userAttribute.keys.contains(Event.ReservedAttribute.USER_FIRST_TOUCH_TIMESTAMP))
    }

    func testUpdateSameUserIdTwice() {
        let userIdForA = "aaa"
        let userUniqueId = clickstream.userUniqueId
        analyticsClient.updateUserId(userIdForA)
        analyticsClient.addUserAttribute(12, forKey: "user_age")
        analyticsClient.updateUserId(userIdForA)
        let userAttribute = analyticsClient.allUserAttributes
        XCTAssertTrue(userAttribute.keys.contains("user_age"))
        XCTAssertEqual(userUniqueId, clickstream.userUniqueId)
    }

    func testGetSimpleUserAttributeWithUserId() {
        analyticsClient.updateUserId("123")
        let simpleUserAttributes = analyticsClient.getSimpleUserAttributes()
        XCTAssertTrue(simpleUserAttributes.keys.contains(Event.ReservedAttribute.USER_FIRST_TOUCH_TIMESTAMP))
        XCTAssertTrue(simpleUserAttributes.keys.contains(Event.ReservedAttribute.USER_ID))
    }

    func testUpdateDifferentUserId() {
        let userIdForA = "aaa"
        let userIdForB = "bbb"
        let userUniqueId = clickstream.userUniqueId
        analyticsClient.updateUserId(userIdForA)
        analyticsClient.addUserAttribute(12, forKey: "user_age")
        analyticsClient.updateUserId(userIdForB)
        let userAttribute = analyticsClient.allUserAttributes
        XCTAssertFalse(userAttribute.keys.contains("user_age"))
        XCTAssertNotEqual(userUniqueId, clickstream.userUniqueId)
    }

    func testChangeToOriginUserId() {
        let userIdForA = "aaa"
        let userIdForB = "bbb"
        let userUniqueId = clickstream.userUniqueId
        analyticsClient.updateUserId(userIdForA)
        analyticsClient.updateUserId(userIdForB)
        let userUniqueIdB = clickstream.userUniqueId
        analyticsClient.updateUserId(userIdForA)
        XCTAssertEqual(userUniqueId, clickstream.userUniqueId)
        analyticsClient.updateUserId(userIdForB)
        XCTAssertEqual(userUniqueIdB, clickstream.userUniqueId)
    }

    // MARK: - testEvent

    func testCreateEvent() {
        let eventType = "testEvent"
        let event = analyticsClient.createEvent(withEventType: eventType)
        XCTAssertEqual(event.eventType, eventType)
    }

    func testRecordRecordEventWithGlobalAttribute() async {
        let event = analyticsClient.createEvent(withEventType: "testEvent")
        XCTAssertTrue(event.attributes.isEmpty)

        analyticsClient.addGlobalAttribute("test_0", forKey: "attribute_0")
        analyticsClient.addGlobalAttribute(0, forKey: "metric_0")
        analyticsClient.addGlobalAttribute(1, forKey: "metric_1")

        do {
            try analyticsClient.record(event)
            XCTAssertEqual(eventRecorder.saveCount, 1)
            guard let savedEvent = eventRecorder.lastSavedEvent else {
                XCTFail("Expected saved event")
                return
            }

            XCTAssertEqual(savedEvent.attributes.count, 3)
            XCTAssertEqual(savedEvent.attributes["attribute_0"] as? String, "test_0")
            XCTAssertEqual(savedEvent.attributes["metric_0"] as? Int, 0)
            XCTAssertEqual(savedEvent.attributes["metric_1"] as? Int, 1)

        } catch {
            XCTFail("Unexpected exception while attempting to record event")
        }
    }

    func testRecordRecordEventWithoutCustomUserAttribute() async {
        let event = analyticsClient.createEvent(withEventType: "testEvent")
        XCTAssertTrue(event.attributes.isEmpty)

        analyticsClient.addUserAttribute("test_0", forKey: "attribute_0")
        analyticsClient.addUserAttribute(0, forKey: "metric_0")
        analyticsClient.addUserAttribute(1, forKey: "metric_1")

        do {
            try analyticsClient.record(event)
            XCTAssertEqual(eventRecorder.saveCount, 1)
            guard let savedEvent = eventRecorder.lastSavedEvent else {
                XCTFail("Expected saved event")
                return
            }

            XCTAssertEqual(savedEvent.userAttributes.count, 1)
            XCTAssertFalse(savedEvent.userAttributes.keys.contains("test_0"))
            XCTAssertFalse(savedEvent.userAttributes.keys.contains("metric_0"))
            XCTAssertFalse(savedEvent.userAttributes.keys.contains("metric_1"))

        } catch {
            XCTFail("Unexpected exception while attempting to record event")
        }
    }

    func testSubmit() {
        analyticsClient.submitEvents()
        XCTAssertEqual(eventRecorder.submitCount, 1)
    }

    func testCheckEventNameWithNameInvalidError() {
        let isValidEvent = analyticsClient.checkEventName("01Event")
        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertFalse(isValidEvent)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.EVENT_NAME_INVALID, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
    }

    func testCheckEventNameWithNameLengthExceedError() {
        let exceedName = String(repeating: "a", count: 51)
        let isValidEvent = analyticsClient.checkEventName(exceedName)
        Thread.sleep(forTimeInterval: 0.02)
        XCTAssertFalse(isValidEvent)
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, eventRecorder.lastSavedEvent?.eventType)
        XCTAssertEqual(Event.ErrorCode.EVENT_NAME_LENGTH_EXCEED, eventRecorder.lastSavedEvent?.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int)
    }
}
