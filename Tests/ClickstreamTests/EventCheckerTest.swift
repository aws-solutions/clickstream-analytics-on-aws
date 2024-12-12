//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class EventCheckerTest: XCTestCase {
    func testIsValidEventType() {
        let noError = Event.ErrorCode.NO_ERROR
        XCTAssertFalse(EventChecker.checkEventType(eventType: "").errorCode == noError)
        XCTAssertTrue(EventChecker.checkEventType(eventType: "abc").errorCode == noError)
        XCTAssertFalse(EventChecker.checkEventType(eventType:
            "abcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcde1").errorCode == noError)
        XCTAssertFalse(EventChecker.checkEventType(eventType: "123").errorCode == noError)
        XCTAssertTrue(EventChecker.checkEventType(eventType: "AAA").errorCode == noError)
        XCTAssertTrue(EventChecker.checkEventType(eventType: "a_ab").errorCode == noError)
        XCTAssertTrue(EventChecker.checkEventType(eventType: "a_ab_1A").errorCode == noError)
        XCTAssertTrue(EventChecker.checkEventType(eventType: "add_to_cart").errorCode == noError)
        XCTAssertTrue(EventChecker.checkEventType(eventType: "Screen_view").errorCode == noError)
        XCTAssertFalse(EventChecker.checkEventType(eventType: "0abc").errorCode == noError)
        XCTAssertFalse(EventChecker.checkEventType(eventType: "9Abc").errorCode == noError)
        XCTAssertTrue(EventChecker.checkEventType(eventType: "A9bc").errorCode == noError)
    }

    func testDoubleIsFinite() {
        XCTAssertTrue(EventChecker.checkFinite(123.31))
        XCTAssertTrue(EventChecker.checkFinite(355 / 113.0))
        XCTAssertTrue(EventChecker.checkFinite(0))
        XCTAssertTrue(EventChecker.checkFinite(Double.pi))
        XCTAssertTrue(EventChecker.checkFinite(Double.leastNormalMagnitude))
        XCTAssertTrue(EventChecker.checkFinite(Double.leastNonzeroMagnitude))
        XCTAssertTrue(EventChecker.checkFinite(Double.ulpOfOne))
        XCTAssertFalse(EventChecker.checkFinite(Double.nan))
        XCTAssertFalse(EventChecker.checkFinite(Double.infinity))
        XCTAssertFalse(EventChecker.checkFinite(-Double.infinity))
        XCTAssertFalse(EventChecker.checkFinite(Double.signalingNaN))
    }

    func testDecimalIsFinite() {
        XCTAssertTrue(EventChecker.checkFinite(Decimal.pi))
        XCTAssertTrue(EventChecker.checkFinite(Decimal.leastNormalMagnitude))
        XCTAssertTrue(EventChecker.checkFinite(Decimal.leastNonzeroMagnitude))
        XCTAssertTrue(EventChecker.checkFinite(Decimal.greatestFiniteMagnitude))
        XCTAssertTrue(EventChecker.checkFinite(Decimal.leastFiniteMagnitude))
        XCTAssertFalse(EventChecker.checkFinite(Decimal.nan))
        XCTAssertFalse(EventChecker.checkFinite(Decimal.quietNaN))
    }
}
