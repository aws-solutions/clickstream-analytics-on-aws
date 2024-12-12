//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
@testable import Clickstream
import XCTest

class ClickstreamPluginBehaviorTest: ClickstreamPluginTestBase {
    var analyticsClient: MockAnalyticsClient!
    let testAttribute: ClickstreamAttribute = [
        "isSuccess": true,
        "userName": "carl",
        "userAge": 12,
        "score": 85.5,
    ]

    override func setUp() async throws {
        try await super.setUp()
        analyticsClient = MockAnalyticsClient()
        analyticsPlugin.analyticsClient = analyticsClient
        analyticsPlugin.clickstream = clickstream
    }

    func testIdentifyUser() {
        let userProfile = AnalyticsUserProfile(location: nil, properties: [
            "user_age": 22,
            "user_name": "carl",
        ])
        let expectation = expectation(description: "Identify user")
        analyticsClient.setAddUserAttributeExpectation(expectation, count: 2)
        analyticsPlugin.identifyUser(userId: Event.User.USER_ID_EMPTY, userProfile: userProfile)
        waitForExpectations(timeout: 1)
        let addCount = analyticsClient.addUserAttributeCount
        XCTAssertEqual(2, addCount)
    }

    func testUpdateUserAttributes() {
        let userProfile = AnalyticsUserProfile(location: nil, properties: [
            "user_age": 22,
            "user_name": "carl",
        ])
        let expectation = expectation(description: "Identify user")
        analyticsClient.setUpdateUserAttributesExpectation(expectation, count: 1)
        analyticsPlugin.identifyUser(userId: Event.User.USER_ID_EMPTY, userProfile: userProfile)
        waitForExpectations(timeout: 1)
        let updateCount = analyticsClient.updateUserAttributeCount
        XCTAssertEqual(1, updateCount)
    }

    func testIdentifyUserForSetUserId() {
        let expectation = expectation(description: "Identify user set user id not nil")
        analyticsClient.setUpdateUserIdExpectation(expectation, count: 1)
        analyticsPlugin.identifyUser(userId: "13231", userProfile: nil)
        waitForExpectations(timeout: 1)
        let updateCount = analyticsClient.updateUserIdCount
        XCTAssertEqual(1, updateCount)
    }

    func testIdentifyUserForNilUserId() {
        let expectation = expectation(description: "Identify user set user id not nil")
        analyticsClient.setUpdateUserIdExpectation(expectation, count: 1)
        analyticsPlugin.identifyUser(userId: Event.User.USER_ID_NIL, userProfile: nil)
        waitForExpectations(timeout: 1)
        let updateCount = analyticsClient.updateUserIdCount
        XCTAssertEqual(1, updateCount)
    }

    func testUpdateUserAttributesForUserIdUpdate() {
        let expectation = expectation(description: "Identify user")
        analyticsClient.setUpdateUserAttributesExpectation(expectation, count: 1)
        analyticsPlugin.identifyUser(userId: "13231", userProfile: nil)
        waitForExpectations(timeout: 1)
        let updateCount = analyticsClient.updateUserAttributeCount
        XCTAssertEqual(1, updateCount)
    }

    func testCheckEventName() {
        let result = analyticsClient.checkEventName("testEvent")
        XCTAssertTrue(result)
        XCTAssertEqual(1, analyticsClient.checkEventNameCount)
    }

    func testRecordEvent() {
        let expectation = expectation(description: "record event")
        analyticsClient.setRecordExpectation(expectation)
        let event = BaseClickstreamEvent(name: "testEvent", attribute: testAttribute)
        analyticsPlugin.record(event: event)
        waitForExpectations(timeout: 1)
        let recordCount = analyticsClient.recordCount
        XCTAssertEqual(1, recordCount)
    }

    func testRecordEventWhenIsEnableFalse() {
        analyticsPlugin.isEnabled = false
        let event = BaseClickstreamEvent(name: "testName", attribute: testAttribute)
        analyticsPlugin.record(event: event)
        let recordCount = analyticsClient.recordCount
        XCTAssertEqual(0, recordCount)
    }

    func testRecordEventWithName() {
        let expectation = expectation(description: "record event")
        analyticsClient.setRecordExpectation(expectation)
        analyticsPlugin.record(eventWithName: "testEvent")
        waitForExpectations(timeout: 1)
        let recordCount = analyticsClient.recordCount
        XCTAssertEqual(1, recordCount)
    }

    func testRecordEventWithNameWhenIsEnableFalse() {
        analyticsPlugin.isEnabled = false
        analyticsPlugin.record(eventWithName: "testEvent")
        let recordCount = analyticsClient.recordCount
        XCTAssertEqual(0, recordCount)
    }

    func testRegisterGlobalAttribute() {
        let expectation = expectation(description: "add global attribute")
        analyticsClient.setAddGlobalAttributeExpectation(expectation, count: 4)
        analyticsPlugin.registerGlobalProperties(testAttribute)
        waitForExpectations(timeout: 1)
        let addGlobalAttributeCallCount = analyticsClient.addGlobalAttributeCalls.count
        XCTAssertEqual(addGlobalAttributeCallCount, testAttribute.count)
    }

    func testUnregisterGlobalAttribute() {
        let expectation = expectation(description: "add global attribute")
        analyticsClient.setRemoveGlobalAttributeExpectation(expectation, count: 4)
        analyticsPlugin.unregisterGlobalProperties(Set<String>(testAttribute.keys))
        waitForExpectations(timeout: 1)
        let removeGlobalAttributeCallCount = analyticsClient.removeGlobalAttributeCalls.count
        XCTAssertEqual(removeGlobalAttributeCallCount, testAttribute.count)
    }

    func testFlushEvent() {
        let expectation = expectation(description: "flush event")
        analyticsClient.setSubmitEventsExpectation(expectation, count: 1)
        analyticsPlugin.flushEvents()
        waitForExpectations(timeout: 1)
        let submitEventsCount = analyticsClient.submitEventsCount
        XCTAssertEqual(1, submitEventsCount)
    }

    func testFlushEventWhenIsEnableFalse() {
        analyticsPlugin.isEnabled = false
        analyticsPlugin.flushEvents()
        let submitEventsCount = analyticsClient.submitEventsCount
        XCTAssertEqual(0, submitEventsCount)
    }

    func testFlushEventWhenNetworkIsOffline() {
        mockNetworkMonitor.isOnline = false
        analyticsPlugin.flushEvents()
        let submitEventsCount = analyticsClient.submitEventsCount
        XCTAssertEqual(0, submitEventsCount)
    }

    func testEnable() {
        analyticsPlugin.enable()
        XCTAssertTrue(analyticsPlugin.isEnabled)
    }

    func testDisable() {
        analyticsPlugin.disable()
        XCTAssertFalse(analyticsPlugin.isEnabled)
    }
}
