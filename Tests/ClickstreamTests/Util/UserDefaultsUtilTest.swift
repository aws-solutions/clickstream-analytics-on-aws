//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class UserDefaultsUtilTest: XCTestCase {
    private var storage: ClickstreamContextStorage!
    override func setUp() async throws {
        UserDefaults.standard.removePersistentDomain(forName: Bundle.main.bundleIdentifier!)
        storage = ClickstreamContextStorage(userDefaults: UserDefaults.standard)
    }

    override func tearDown() async throws {
        storage = nil
    }

    func testGetDeviceId() {
        let deviceId = UserDefaultsUtil.getDeviceId(storage: storage)
        XCTAssertNotNil(deviceId)
        XCTAssertTrue(!deviceId.isEmpty)
        let deviceId2 = UserDefaultsUtil.getDeviceId(storage: storage)
        XCTAssertEqual(deviceId, deviceId2)
    }

    func testSaveAndGetCurrentUserId() {
        let userId = UserDefaultsUtil.getCurrentUserId(storage: storage)
        XCTAssertNil(userId)
        UserDefaultsUtil.saveCurrentUserId(storage: storage, userId: "12321")
        let userId1 = UserDefaultsUtil.getCurrentUserId(storage: storage)
        XCTAssertNotNil(userId1)
        XCTAssertEqual("12321", userId1)
    }

    func testGetCurrentUserUniqueId() {
        let firstTouchTimestamp = UserDefaultsUtil.getUserFirstTouchTimestamp(storage: storage)
        XCTAssertEqual(0, firstTouchTimestamp)
        let userUniqueId = UserDefaultsUtil.getCurrentUserUniqueId(storage: storage)
        XCTAssertNotNil(userUniqueId)
        let firstTouchTimestamp1 = UserDefaultsUtil.getUserFirstTouchTimestamp(storage: storage)
        XCTAssertTrue(firstTouchTimestamp1 > 0)
        let userUniqueId2 = UserDefaultsUtil.getCurrentUserUniqueId(storage: storage)
        XCTAssertEqual(userUniqueId, userUniqueId2)
        let firstTouchTimestamp2 = UserDefaultsUtil.getUserFirstTouchTimestamp(storage: storage)
        XCTAssertTrue(firstTouchTimestamp1 == firstTouchTimestamp2)

        let userAttributes = UserDefaultsUtil.getUserAttributes(storage: storage)
        let firstTouchTimestampInUserAttributes = (userAttributes[Event.ReservedAttribute.USER_FIRST_TOUCH_TIMESTAMP] as! JsonObject)["value"] as! Int64
        XCTAssertEqual(firstTouchTimestamp1, firstTouchTimestampInUserAttributes)
    }

    func testGetNewUserInfo() {
        let userUniqueIdUnlogin = UserDefaultsUtil.getCurrentUserUniqueId(storage: storage)
        let firstTouchTimeStamp = UserDefaultsUtil.getUserFirstTouchTimestamp(storage: storage)

        let userId1 = "111"
        let userInfo1 = UserDefaultsUtil.getNewUserInfo(storage: storage, userId: userId1)
        let userUniqueId1 = userInfo1["user_unique_id"] as! String
        let firstTouchTimestampUserId1 = userInfo1["user_first_touch_timestamp"] as! Int64
        XCTAssertEqual(userUniqueIdUnlogin, userUniqueId1)
        XCTAssertEqual(firstTouchTimeStamp, firstTouchTimestampUserId1)

        let userId2 = "222"
        let userInfo2 = UserDefaultsUtil.getNewUserInfo(storage: storage, userId: userId2)
        let userUniqueId2 = userInfo2["user_unique_id"] as! String
        let firstTouchTimestampUserId2 = userInfo2["user_first_touch_timestamp"] as! Int64
        XCTAssertTrue(!userUniqueId2.isEmpty)
        XCTAssertNotEqual(userUniqueIdUnlogin, userUniqueId2)
        XCTAssertNotEqual(userUniqueId1, userUniqueId2)
        XCTAssertNotEqual(firstTouchTimestampUserId1, firstTouchTimestampUserId2)

        let userInfo3 = UserDefaultsUtil.getNewUserInfo(storage: storage, userId: userId1)
        let userUniqueId3 = userInfo3["user_unique_id"] as! String
        let firstTouchTimestampUserId3 = userInfo3["user_first_touch_timestamp"] as! Int64
        XCTAssertTrue(!userUniqueId3.isEmpty)
        XCTAssertEqual(userUniqueId3, userUniqueId1)
        XCTAssertEqual(firstTouchTimestampUserId1, firstTouchTimestampUserId3)
    }
}
