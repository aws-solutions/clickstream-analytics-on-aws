//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class ActivityTrackerTests: XCTestCase {
    private var tracker: ActivityTracker!
    private var stateMachine: MockStateMachine!
    private var timeout: TimeInterval = 1

    private static let applicationDidMoveToBackgroundNotification: Notification.Name = {
        #if canImport(UIKit)
            UIApplication.didEnterBackgroundNotification
        #else
            NSApplication.didResignActiveNotification
        #endif
    }()

    private static let applicationWillMoveToForegoundNotification: Notification.Name = {
        #if canImport(UIKit)
            UIApplication.willEnterForegroundNotification
        #else
            NSApplication.willBecomeActiveNotification
        #endif
    }()

    private static var applicationWillTerminateNotification: Notification.Name = {
        #if canImport(UIKit)
            UIApplication.willTerminateNotification
        #else
            NSApplication.willTerminateNotification
        #endif
    }()

    override func setUp() {
        stateMachine = MockStateMachine(initialState: .initializing) { _, _ in
            .initializing
        }

        tracker = ActivityTracker(
            stateMachine: stateMachine)
    }

    override func tearDown() {
        tracker = nil
        stateMachine = nil
    }

    func testBeginTracking() {
        let expectation = expectation(description: "Initial state")
        tracker.beginActivityTracking { newState in
            XCTAssertEqual(newState, .initializing)
            expectation.fulfill()
        }
        waitForExpectations(timeout: 1)
    }

    func testApplicationStateChangedShouldReportProperEvent() {
        stateMachine.processExpectation = expectation(description: "Application state changed")
        stateMachine.processExpectation?.expectedFulfillmentCount = 3

        NotificationCenter.default.post(Notification(name: Self.applicationDidMoveToBackgroundNotification))
        NotificationCenter.default.post(Notification(name: Self.applicationWillMoveToForegoundNotification))
        NotificationCenter.default.post(Notification(name: Self.applicationWillTerminateNotification))

        waitForExpectations(timeout: 1)
        XCTAssertTrue(stateMachine.processedEvents.contains(.applicationDidMoveToBackground))
        XCTAssertTrue(stateMachine.processedEvents.contains(.applicationWillMoveToForeground))
        XCTAssertTrue(stateMachine.processedEvents.contains(.applicationWillTerminate))
    }
}

extension [ActivityEvent] {
    func contains(_ element: Element) -> Bool {
        contains(where: { $0 == element })
    }
}

class MockStateMachine: StateMachine<ApplicationState, ActivityEvent> {
    var processedEvents: [ActivityEvent] = []
    var processExpectation: XCTestExpectation?

    override func process(_ event: ActivityEvent) {
        processedEvents.append(event)
        processExpectation?.fulfill()
    }
}
