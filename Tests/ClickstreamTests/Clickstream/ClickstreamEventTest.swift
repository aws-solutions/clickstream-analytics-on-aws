//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import Foundation
import XCTest

class ClickstreamEventTest: XCTestCase {
    let testAppId = "testAppId"
    let storage = ClickstreamContextStorage(userDefaults: UserDefaults.standard)
    var clickstreamEvent: ClickstreamEvent!
    override func setUp() {
        clickstreamEvent = ClickstreamEvent(eventType: "testEvent",
                                            appId: testAppId,
                                            uniqueId: UUID().uuidString,
                                            session: Session(uniqueId: UUID().uuidString, sessionIndex: 1),
                                            systemInfo: SystemInfo(storage: storage),
                                            netWorkType: NetWorkType.Wifi)
    }

    override func tearDown() {
        clickstreamEvent = nil
    }

    func testAddAttributeSuccess() {
        clickstreamEvent.addAttribute(133_232_123, forKey: "GoodsId")
        clickstreamEvent.addAttribute("iPhone 14", forKey: "GoodsName")
        clickstreamEvent.addAttribute(true, forKey: "isNewGoods")
        XCTAssertEqual(133_232_123, clickstreamEvent.attribute(forKey: "GoodsId") as! Int)
        XCTAssertEqual("iPhone 14", clickstreamEvent.attribute(forKey: "GoodsName") as! String)
        XCTAssertEqual(true, clickstreamEvent.attribute(forKey: "isNewGoods") as! Bool)
    }

    func testAddAttributeErrorForInvalidKey() {
        clickstreamEvent.addAttribute(133_232_123, forKey: "1GoodsId")
        XCTAssertNil(clickstreamEvent.attribute(forKey: "isNewGoods"))
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_NAME_INVALID, errorCode)
        XCTAssertTrue(errorValueString.contains("1GoodsId"))
    }

    func testAddAttributeErrorForExceedMaxLenthOfKey() {
        let longAttributeKey = String(repeating: "a", count: 51)
        clickstreamEvent.addAttribute("testValue", forKey: longAttributeKey)
        XCTAssertNil(clickstreamEvent.attribute(forKey: "longAttributeKey"))
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_NAME_LENGTH_EXCEED, errorCode)
        XCTAssertTrue(errorValueString.contains(longAttributeKey))
    }

    func testAddAttributeErrorForExceedMaxLenthOfValue() {
        let longAttributeValue = String(repeating: "a", count: 1_025)
        clickstreamEvent.addAttribute(longAttributeValue, forKey: "testKey")
        XCTAssertNil(clickstreamEvent.attribute(forKey: "testKey"))
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_VALUE_LENGTH_EXCEED, errorCode)
        XCTAssertTrue(errorValueString.contains("testKey"))
    }

    func testAddAttributeErrorForDoubleValueisNotFinite() {
        clickstreamEvent.addAttribute(Double.infinity, forKey: "testKey")
        XCTAssertNil(clickstreamEvent.attribute(forKey: "testKey"))
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_VALUE_INFINITE, errorCode)
        XCTAssertTrue(errorValueString.contains("testKey"))
    }

    func testAddAttributeErrorForDecimalValueisNotFinite() {
        clickstreamEvent.addAttribute(Decimal.nan, forKey: "testKey")
        XCTAssertNil(clickstreamEvent.attribute(forKey: "testKey"))
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ATTRIBUTE_VALUE_INFINITE, errorCode)
        XCTAssertTrue(errorValueString.contains("testKey"))
    }

    func testAddItemWithCustomAttributeScuccess() {
        let item: ClickstreamAttribute = [
            ClickstreamAnalytics.Item.ITEM_ID: 123,
            ClickstreamAnalytics.Item.ITEM_NAME: "testName",
            ClickstreamAnalytics.Item.PRICE: 99.9,
            "custom_attr": "customValue",
            "custom_attr1": 456,
            "custom_attr2": true,
            "custom_attr3": 12.34
        ]
        clickstreamEvent.addItem(item)
        XCTAssertFalse(clickstreamEvent.attributes.keys.contains(Event.ReservedAttribute.ERROR_CODE))
        XCTAssertEqual(1, clickstreamEvent.items.count)
        let eventItem = clickstreamEvent.items[0] as JsonObject
        XCTAssertEqual(123, eventItem["id"] as! Int)
        XCTAssertEqual("testName", eventItem["name"] as! String)
        XCTAssertEqual(99.9, eventItem["price"] as! Decimal)
        XCTAssertEqual("customValue", eventItem["custom_attr"] as! String)
        XCTAssertEqual(12.34, eventItem["custom_attr3"] as! Decimal)
        XCTAssertTrue(eventItem["custom_attr2"] as! Bool)
    }

    func testAddItemErrorForExceedMaxNumberOfItem() {
        for i in 0 ..< 101 {
            clickstreamEvent.addItem([
                ClickstreamAnalytics.Item.ITEM_ID: i,
                ClickstreamAnalytics.Item.ITEM_NAME: "item_name_\(i)"
            ])
        }
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ITEM_SIZE_EXCEED, errorCode)
        XCTAssertTrue(errorValueString.contains("item_name_100"))
        XCTAssertEqual(100, clickstreamEvent.items.count)
    }

    func testAddItemErrorForExceedMaxNumberOfCustomAttribute() {
        var item: ClickstreamAttribute = [
            ClickstreamAnalytics.Item.ITEM_ID: 123,
            ClickstreamAnalytics.Item.ITEM_NAME: "item_name_123"
        ]
        for i in 0 ..< 11 {
            item["custom_attr_\(i)"] = "value_\(i)"
        }
        clickstreamEvent.addItem(item)
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        XCTAssertEqual(Event.ErrorCode.ITEM_CUSTOM_ATTRIBUTE_SIZE_EXCEED, errorCode)
        XCTAssertEqual(0, clickstreamEvent.items.count)
    }

    func testAddItemPrestAndCustomAttributeNotExceedTheLimit() {
        var item: ClickstreamAttribute = [
            ClickstreamAnalytics.Item.ITEM_ID: 123,
            ClickstreamAnalytics.Item.ITEM_NAME: "testName1",
            ClickstreamAnalytics.Item.ITEM_BRAND: "Google",
            ClickstreamAnalytics.Item.CURRENCY: "CNY",
            ClickstreamAnalytics.Item.LOCATION_ID: "1"
        ]
        for i in 0 ..< 10 {
            item["custom_attr_\(i)"] = "value_\(i)"
        }
        clickstreamEvent.addItem(item)
        XCTAssertTrue(clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) == nil)
        XCTAssertEqual(1, clickstreamEvent.items.count)
    }

    func testAddItemErrorForExceedMaxLengthOfAttributeName() {
        let longAttributeKey = String(repeating: "a", count: 51)
        let item: ClickstreamAttribute = [
            ClickstreamAnalytics.Item.ITEM_ID: 123,
            longAttributeKey: "item_name_123"
        ]
        clickstreamEvent.addItem(item)
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ITEM_CUSTOM_ATTRIBUTE_KEY_LENGTH_EXCEED, errorCode)
        XCTAssertTrue(errorValueString.contains(longAttributeKey))
        XCTAssertEqual(0, clickstreamEvent.items.count)
    }

    func testAddItemErrorForInvalidAttributeName() {
        let item: ClickstreamAttribute = [
            ClickstreamAnalytics.Item.ITEM_ID: 123,
            "01Key": "item_name_123"
        ]
        clickstreamEvent.addItem(item)
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ITEM_CUSTOM_ATTRIBUTE_KEY_INVALID, errorCode)
        XCTAssertTrue(errorValueString.contains("01Key"))
        XCTAssertEqual(0, clickstreamEvent.items.count)
    }

    func testAddItemErrorForExceedMaxAttributeValueLength() {
        let longAttributeValue = String(repeating: "a", count: 1_025)
        let item: ClickstreamAttribute = [
            ClickstreamAnalytics.Item.ITEM_ID: 123,
            ClickstreamAnalytics.Item.ITEM_NAME: longAttributeValue
        ]
        clickstreamEvent.addItem(item)
        let errorCode = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_CODE) as! Int
        let errorValueString = clickstreamEvent.attribute(forKey: Event.ReservedAttribute.ERROR_MESSAGE) as! String
        XCTAssertEqual(Event.ErrorCode.ITEM_ATTRIBUTE_VALUE_LENGTH_EXCEED, errorCode)
        XCTAssertTrue(errorValueString.contains(ClickstreamAnalytics.Item.ITEM_NAME))
        XCTAssertEqual(0, clickstreamEvent.items.count)
    }
}
