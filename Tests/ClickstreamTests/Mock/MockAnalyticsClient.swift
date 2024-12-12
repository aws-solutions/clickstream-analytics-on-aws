//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class MockAnalyticsClient: AnalyticsClientBehaviour {
    // MARK: - AddUserAttribute

    private var addUserAttributeExpectation: XCTestExpectation?
    func setAddUserAttributeExpectation(_ expectation: XCTestExpectation, count: Int = 1) {
        addUserAttributeExpectation = expectation
        addUserAttributeExpectation?.expectedFulfillmentCount = count
    }

    var addUserAttributeCount = 0
    func addUserAttribute(_ attribute: AttributeValue, forKey key: String) {
        addUserAttributeCount += 1
        addUserAttributeExpectation?.fulfill()
    }

    // MARK: - RemoveUserAttribute

    private var removeUserAttributeExpectation: XCTestExpectation?
    func setRemoveUserAttributeExpectation(_ expectation: XCTestExpectation, count: Int = 1) {
        removeUserAttributeExpectation = expectation
        removeUserAttributeExpectation?.expectedFulfillmentCount = count
    }

    var removeUserAttributeCount = 0
    func removeUserAttribute(forKey key: String) {
        removeUserAttributeCount += 1
        removeUserAttributeExpectation?.fulfill()
    }

    // MARK: - AddGlobalAttribute

    private var addGlobalAttributeExpectation: XCTestExpectation?
    func setAddGlobalAttributeExpectation(_ expectation: XCTestExpectation, count: Int = 1) {
        addGlobalAttributeExpectation = expectation
        addGlobalAttributeExpectation?.expectedFulfillmentCount = count
    }

    var addGlobalAttributeCalls = [(String, AttributeValue)]()
    func addGlobalAttribute(_ attribute: AttributeValue, forKey key: String) {
        addGlobalAttributeCalls.append((key, attribute))
        addGlobalAttributeExpectation?.fulfill()
    }

    // MARK: - RemoveGlobalAttribute

    private var removeGlobalAttributeExpectation: XCTestExpectation?
    func setRemoveGlobalAttributeExpectation(_ expectation: XCTestExpectation, count: Int = 1) {
        removeGlobalAttributeExpectation = expectation
        removeGlobalAttributeExpectation?.expectedFulfillmentCount = count
    }

    var removeGlobalAttributeCalls = [(String, String?)]()
    func removeGlobalAttribute(forKey key: String) {
        removeGlobalAttributeCalls.append((key, nil))
        removeGlobalAttributeExpectation?.fulfill()
    }

    // MARK: - UpdateUserId

    private var updateUserIdExpectation: XCTestExpectation?
    func setUpdateUserIdExpectation(_ expectation: XCTestExpectation, count: Int = 1) {
        updateUserIdExpectation = expectation
        updateUserIdExpectation?.expectedFulfillmentCount = count
    }

    var updateUserIdCount = 0
    func updateUserId(_ id: String?) {
        updateUserIdCount += 1
        updateUserIdExpectation?.fulfill()
    }

    // MARK: - UpdateUserAttributes

    private var updateUserAttributesExpectation: XCTestExpectation?
    func setUpdateUserAttributesExpectation(_ expectation: XCTestExpectation, count: Int = 1) {
        updateUserAttributesExpectation = expectation
        updateUserAttributesExpectation?.expectedFulfillmentCount = count
    }

    var updateUserAttributeCount = 0
    func updateUserAttributes() {
        updateUserAttributeCount += 1
        updateUserAttributesExpectation?.fulfill()
    }

    // MARK: - CheckEventName

    var checkEventNameCount = 0
    func checkEventName(_ eventName: String) -> Bool {
        checkEventNameCount += 1
        return true
    }

    // MARK: - CreateEvent

    var createEventCount = 0
    private func increaseCreateEventCount() {
        createEventCount += 1
    }

    func createEvent(withEventType eventType: String) -> ClickstreamEvent {
        increaseCreateEventCount()
        let storage = ClickstreamContextStorage(userDefaults: UserDefaults.standard)
        return ClickstreamEvent(eventType: eventType, appId: "", uniqueId: "", session: Session(uniqueId: "", sessionIndex: 1),
                                systemInfo: SystemInfo(storage: storage), netWorkType: "WIFI")
    }

    // MARK: - RecordEvent

    private var recordExpectation: XCTestExpectation?
    func setRecordExpectation(_ expectation: XCTestExpectation, count: Int = 1) {
        recordExpectation = expectation
        recordExpectation?.expectedFulfillmentCount = count
    }

    var recordCount = 0
    var lastRecordedEvent: ClickstreamEvent?
    var recordedEvents: [ClickstreamEvent] = []

    func record(_ event: ClickstreamEvent) throws {
        recordCount += 1
        lastRecordedEvent = event
        recordedEvents.append(event)
        recordExpectation?.fulfill()
    }

    // MARK: - SubmitEvent

    private var submitEventsExpectation: XCTestExpectation?
    func setSubmitEventsExpectation(_ expectation: XCTestExpectation, count: Int = 1) {
        submitEventsExpectation = expectation
        submitEventsExpectation?.expectedFulfillmentCount = count
    }

    var submitEventsCount = 0
    func submitEvents(isBackgroundMode: Bool = false) {
        submitEventsCount += 1
        submitEventsExpectation?.fulfill()
    }

    func resetCounters() {
        recordCount = 0
        submitEventsCount = 0
        createEventCount = 0
        addUserAttributeCount = 0
        removeUserAttributeCount = 0
        updateUserIdCount = 0
        recordedEvents = []
        lastRecordedEvent = nil
        removeGlobalAttributeCalls = []
        addGlobalAttributeCalls = []
    }
}
