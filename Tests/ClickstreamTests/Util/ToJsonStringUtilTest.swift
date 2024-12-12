//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class ToJsonStringUtilTest: XCTestCase {
    func testNullObjectToJsonString() {
        let attr: JsonObject = [
            "user": {}
        ]
        XCTAssertTrue(attr.toJsonString() == "")
    }

    func testNSObjectToJsonString() {
        let attr: JsonObject = [
            "user": NSObject()
        ]
        XCTAssertTrue(attr.toJsonString() == "")
    }

    func testNanObjectToJsonString() {
        let attr: JsonObject = [
            "doubleKey": Double.nan
        ]
        XCTAssertTrue(attr.toJsonString() == "")
    }

    func testInfiniteObjectToJsonString() {
        let attr: JsonObject = [
            "doubleKey": Double.infinity
        ]
        XCTAssertTrue(attr.toJsonString() == "")
    }

    func testDateObjectToJsonString() {
        let attr: JsonObject = [
            "dateKey": Date()
        ]
        XCTAssertTrue(attr.toJsonString() == "")
    }
}
