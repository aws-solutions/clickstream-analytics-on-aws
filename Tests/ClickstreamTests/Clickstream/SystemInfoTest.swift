//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class SystemInfoTest: XCTestCase {
    func testGetIdentifierNotNil() {
        XCTAssertNotNil(SystemInfo.identifier)
    }

    func testGetModelForSimulator() {
        XCTAssertTrue(SystemInfo.getModel(identifier: "arm64").starts(with: "iPhone"))
    }

    func testGetModelFor_iPhone() {
        XCTAssertEqual("iPhone 7", SystemInfo.getModel(identifier: "iPhone9,1"))
        XCTAssertEqual("iPhone 7", SystemInfo.getModel(identifier: "iPhone9,3"))
        XCTAssertEqual("iPhone 7 Plus", SystemInfo.getModel(identifier: "iPhone9,2"))
        XCTAssertEqual("iPhone 7 Plus", SystemInfo.getModel(identifier: "iPhone9,4"))
        XCTAssertEqual("iPhone SE", SystemInfo.getModel(identifier: "iPhone8,4"))
        XCTAssertEqual("iPhone 8", SystemInfo.getModel(identifier: "iPhone10,1"))
        XCTAssertEqual("iPhone 8", SystemInfo.getModel(identifier: "iPhone10,4"))
        XCTAssertEqual("iPhone X", SystemInfo.getModel(identifier: "iPhone10,3"))
        XCTAssertEqual("iPhone X", SystemInfo.getModel(identifier: "iPhone10,6"))
        XCTAssertEqual("iPhone Xs", SystemInfo.getModel(identifier: "iPhone11,2"))
        XCTAssertEqual("iPhone Xs Max", SystemInfo.getModel(identifier: "iPhone11,4"))
        XCTAssertEqual("iPhone Xs Max", SystemInfo.getModel(identifier: "iPhone11,6"))
        XCTAssertEqual("iPhone XR", SystemInfo.getModel(identifier: "iPhone11,8"))
        XCTAssertEqual("iPhone 11", SystemInfo.getModel(identifier: "iPhone12,1"))
        XCTAssertEqual("iPhone 11 Pro", SystemInfo.getModel(identifier: "iPhone12,3"))
        XCTAssertEqual("iPhone 11 Pro Max", SystemInfo.getModel(identifier: "iPhone12,5"))
        XCTAssertEqual("iPhone SE (2nd generation)", SystemInfo.getModel(identifier: "iPhone12,8"))
        XCTAssertEqual("iPhone 12", SystemInfo.getModel(identifier: "iPhone13,2"))
        XCTAssertEqual("iPhone 12 mini", SystemInfo.getModel(identifier: "iPhone13,1"))
        XCTAssertEqual("iPhone 12 Pro", SystemInfo.getModel(identifier: "iPhone13,3"))
        XCTAssertEqual("iPhone 12 Pro Max", SystemInfo.getModel(identifier: "iPhone13,4"))
        XCTAssertEqual("iPhone 13", SystemInfo.getModel(identifier: "iPhone14,5"))
        XCTAssertEqual("iPhone 13 mini", SystemInfo.getModel(identifier: "iPhone14,4"))
        XCTAssertEqual("iPhone 13 Pro", SystemInfo.getModel(identifier: "iPhone14,2"))
        XCTAssertEqual("iPhone 13 Pro Max", SystemInfo.getModel(identifier: "iPhone14,3"))
        XCTAssertEqual("iPhone SE (3rd generation)", SystemInfo.getModel(identifier: "iPhone14,6"))
        XCTAssertEqual("iPhone 14", SystemInfo.getModel(identifier: "iPhone14,7"))
        XCTAssertEqual("iPhone 14 Plus", SystemInfo.getModel(identifier: "iPhone14,8"))
        XCTAssertEqual("iPhone 14 Pro", SystemInfo.getModel(identifier: "iPhone15,2"))
        XCTAssertEqual("iPhone 14 Pro Max", SystemInfo.getModel(identifier: "iPhone15,3"))
        XCTAssertEqual("iPhone 15", SystemInfo.getModel(identifier: "iPhone15,4"))
        XCTAssertEqual("iPhone 15 Plus", SystemInfo.getModel(identifier: "iPhone15,5"))
        XCTAssertEqual("iPhone 15 Pro", SystemInfo.getModel(identifier: "iPhone16,1"))
        XCTAssertEqual("iPhone 15 Pro Max", SystemInfo.getModel(identifier: "iPhone16,2"))
    }

    func testGetModelFor_iPad() {
        XCTAssertEqual("iPad Air 2", SystemInfo.getModel(identifier: "iPad5,3"))
        XCTAssertEqual("iPad Air 2", SystemInfo.getModel(identifier: "iPad5,4"))
        XCTAssertEqual("iPad (5th generation)", SystemInfo.getModel(identifier: "iPad6,11"))
        XCTAssertEqual("iPad (5th generation)", SystemInfo.getModel(identifier: "iPad6,12"))
        XCTAssertEqual("iPad (6th generation)", SystemInfo.getModel(identifier: "iPad7,5"))
        XCTAssertEqual("iPad (6th generation)", SystemInfo.getModel(identifier: "iPad7,6"))
        XCTAssertEqual("iPad Air (3rd generation)", SystemInfo.getModel(identifier: "iPad11,3"))
        XCTAssertEqual("iPad Air (3rd generation)", SystemInfo.getModel(identifier: "iPad11,4"))
        XCTAssertEqual("iPad (7th generation)", SystemInfo.getModel(identifier: "iPad7,11"))
        XCTAssertEqual("iPad (7th generation)", SystemInfo.getModel(identifier: "iPad7,12"))
        XCTAssertEqual("iPad (8th generation)", SystemInfo.getModel(identifier: "iPad11,6"))
        XCTAssertEqual("iPad (8th generation)", SystemInfo.getModel(identifier: "iPad11,7"))
        XCTAssertEqual("iPad (9th generation)", SystemInfo.getModel(identifier: "iPad12,1"))
        XCTAssertEqual("iPad (9th generation)", SystemInfo.getModel(identifier: "iPad12,2"))
        XCTAssertEqual("iPad (10th generation)", SystemInfo.getModel(identifier: "iPad13,18"))
        XCTAssertEqual("iPad (10th generation)", SystemInfo.getModel(identifier: "iPad13,19"))
        XCTAssertEqual("iPad Air (4th generation)", SystemInfo.getModel(identifier: "iPad13,1"))
        XCTAssertEqual("iPad Air (4th generation)", SystemInfo.getModel(identifier: "iPad13,2"))
        XCTAssertEqual("iPad Air (5th generation)", SystemInfo.getModel(identifier: "iPad13,16"))
        XCTAssertEqual("iPad Air (5th generation)", SystemInfo.getModel(identifier: "iPad13,17"))
        XCTAssertEqual("iPad Mini 3", SystemInfo.getModel(identifier: "iPad4,7"))
        XCTAssertEqual("iPad Mini 3", SystemInfo.getModel(identifier: "iPad4,8"))
        XCTAssertEqual("iPad Mini 3", SystemInfo.getModel(identifier: "iPad4,9"))
        XCTAssertEqual("iPad Mini (5th generation)", SystemInfo.getModel(identifier: "iPad11,1"))
        XCTAssertEqual("iPad Mini (5th generation)", SystemInfo.getModel(identifier: "iPad11,2"))
        XCTAssertEqual("iPad Mini (6th generation)", SystemInfo.getModel(identifier: "iPad14,1"))
        XCTAssertEqual("iPad Mini (6th generation)", SystemInfo.getModel(identifier: "iPad14,2"))
        XCTAssertEqual("iPad Pro (9.7-inch)", SystemInfo.getModel(identifier: "iPad6,3"))
        XCTAssertEqual("iPad Pro (9.7-inch)", SystemInfo.getModel(identifier: "iPad6,4"))
        XCTAssertEqual("iPad Pro (12.9-inch)", SystemInfo.getModel(identifier: "iPad6,7"))
        XCTAssertEqual("iPad Pro (12.9-inch)", SystemInfo.getModel(identifier: "iPad6,8"))
        XCTAssertEqual("iPad Pro (12.9-inch) (2nd generation)", SystemInfo.getModel(identifier: "iPad7,1"))
        XCTAssertEqual("iPad Pro (12.9-inch) (2nd generation)", SystemInfo.getModel(identifier: "iPad7,2"))
        XCTAssertEqual("iPad Pro (10.5-inch)", SystemInfo.getModel(identifier: "iPad7,3"))
        XCTAssertEqual("iPad Pro (10.5-inch)", SystemInfo.getModel(identifier: "iPad7,4"))
        XCTAssertEqual("iPad Pro (11-inch)", SystemInfo.getModel(identifier: "iPad8,1"))
        XCTAssertEqual("iPad Pro (11-inch)", SystemInfo.getModel(identifier: "iPad8,2"))
        XCTAssertEqual("iPad Pro (11-inch)", SystemInfo.getModel(identifier: "iPad8,3"))
        XCTAssertEqual("iPad Pro (11-inch)", SystemInfo.getModel(identifier: "iPad8,4"))
        XCTAssertEqual("iPad Pro (12.9-inch) (3rd generation)", SystemInfo.getModel(identifier: "iPad8,5"))
        XCTAssertEqual("iPad Pro (12.9-inch) (3rd generation)", SystemInfo.getModel(identifier: "iPad8,6"))
        XCTAssertEqual("iPad Pro (12.9-inch) (3rd generation)", SystemInfo.getModel(identifier: "iPad8,7"))
        XCTAssertEqual("iPad Pro (12.9-inch) (3rd generation)", SystemInfo.getModel(identifier: "iPad8,8"))
        XCTAssertEqual("iPad Pro (11-inch) (2nd generation)", SystemInfo.getModel(identifier: "iPad8,9"))
        XCTAssertEqual("iPad Pro (11-inch) (2nd generation)", SystemInfo.getModel(identifier: "iPad8,10"))
        XCTAssertEqual("iPad Pro (12.9-inch) (4th generation)", SystemInfo.getModel(identifier: "iPad8,11"))
        XCTAssertEqual("iPad Pro (12.9-inch) (4th generation)", SystemInfo.getModel(identifier: "iPad8,12"))
        XCTAssertEqual("iPad Pro (11-inch) (3rd generation)", SystemInfo.getModel(identifier: "iPad13,4"))
        XCTAssertEqual("iPad Pro (11-inch) (3rd generation)", SystemInfo.getModel(identifier: "iPad13,5"))
        XCTAssertEqual("iPad Pro (11-inch) (3rd generation)", SystemInfo.getModel(identifier: "iPad13,6"))
        XCTAssertEqual("iPad Pro (11-inch) (3rd generation)", SystemInfo.getModel(identifier: "iPad13,7"))
        XCTAssertEqual("iPad Pro (12.9-inch) (5th generation)", SystemInfo.getModel(identifier: "iPad13,8"))
        XCTAssertEqual("iPad Pro (12.9-inch) (5th generation)", SystemInfo.getModel(identifier: "iPad13,9"))
        XCTAssertEqual("iPad Pro (12.9-inch) (5th generation)", SystemInfo.getModel(identifier: "iPad13,10"))
        XCTAssertEqual("iPad Pro (12.9-inch) (5th generation)", SystemInfo.getModel(identifier: "iPad13,11"))
        XCTAssertEqual("iPad Pro (11-inch) (4th generation)", SystemInfo.getModel(identifier: "iPad14,3"))
        XCTAssertEqual("iPad Pro (11-inch) (4th generation)", SystemInfo.getModel(identifier: "iPad14,4"))
        XCTAssertEqual("iPad Pro (12.9-inch) (6th generation)", SystemInfo.getModel(identifier: "iPad14,5"))
        XCTAssertEqual("iPad Pro (12.9-inch) (6th generation)", SystemInfo.getModel(identifier: "iPad14,6"))
    }

    func testGetModelFor_iPod() {
        XCTAssertEqual("iPod touch (7th generation)", SystemInfo.getModel(identifier: "iPod9,1"))
    }

    func testGetModelFor_UnKnow() {
        XCTAssertEqual("iPhone100,1", SystemInfo.getModel(identifier: "iPhone100,1"))
    }
}
