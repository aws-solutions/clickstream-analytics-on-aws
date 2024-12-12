//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Foundation
#if canImport(UIKit)
    import UIKit
#endif
// swiftlint:disable force_cast
enum UserDefaultsUtil {
    static func getDeviceId(storage: ClickstreamContextStorage) -> String {
        if let deviceId = storage.userDefaults.string(forKey: Constants.deviceIdKey) {
            return deviceId
        }
        var newDeviceId = ""
        var idfv = ""
        #if canImport(UIKit)
            idfv = UIDevice.current.identifierForVendor?.uuidString ?? ""
        #endif
        if idfv != "" {
            newDeviceId = idfv
        } else {
            newDeviceId = UUID().uuidString
        }
        storage.userDefaults.save(key: Constants.deviceIdKey, value: newDeviceId)
        return newDeviceId
    }

    /// Set current userId
    /// - Returns: userId
    static func saveCurrentUserId(storage: ClickstreamContextStorage, userId: String?) {
        storage.userDefaults.save(key: Constants.userIdKey, value: userId)
    }

    /// Get current userId from userDefault
    /// - Returns: userId
    static func getCurrentUserId(storage: ClickstreamContextStorage) -> String? {
        if let userId = storage.userDefaults.string(forKey: Constants.userIdKey) {
            return userId
        }
        return nil
    }

    /// Get current user uniqueId from userDefault
    /// - Returns: userId
    static func getCurrentUserUniqueId(storage: ClickstreamContextStorage) -> String {
        if let userUniqueId = storage.userDefaults.string(forKey: Constants.userUniqueIdKey) {
            return userUniqueId
        }
        let newUserUniqueId = UUID().uuidString
        storage.userDefaults.save(key: Constants.userUniqueIdKey, value: newUserUniqueId)
        saveUserFirstTouchTimestamp(storage: storage)
        return newUserUniqueId
    }

    static func saveCurrentUserUniqueId(storage: ClickstreamContextStorage, userUniqueId: String) {
        storage.userDefaults.save(key: Constants.userUniqueIdKey, value: userUniqueId)
    }

    static func getUserFirstTouchTimestamp(storage: ClickstreamContextStorage) -> Int64 {
        Int64(storage.userDefaults.string(forKey: Constants.userFirstTouchTimestampKey) ?? "0")!
    }

    static func saveUserFirstTouchTimestamp(storage: ClickstreamContextStorage) {
        let firstTouchTimestamp = Date().millisecondsSince1970
        storage.userDefaults.save(key: Constants.userFirstTouchTimestampKey,
                                  value: String(describing: firstTouchTimestamp))
        var userAttribute = JsonObject()
        var attribute = JsonObject()
        attribute["value"] = firstTouchTimestamp
        attribute["set_timestamp"] = firstTouchTimestamp
        userAttribute[Event.ReservedAttribute.USER_FIRST_TOUCH_TIMESTAMP] = attribute
        updateUserAttributes(storage: storage, userAttributes: userAttribute)
    }

    /// Store the neweast user attribute
    /// - Parameters:
    ///   - storage: userDefault
    ///   - userAttributes: current userAttributes object
    static func updateUserAttributes(storage: ClickstreamContextStorage, userAttributes: [String: Any]) {
        storage.userDefaults.save(key: Constants.userAttributesKey, value: userAttributes)
    }

    /// Get the neweast user attribute
    /// - Parameter storage: userDefault
    /// - Returns: current userAttributes object
    static func getUserAttributes(storage: ClickstreamContextStorage) -> [String: Any] {
        var data = storage.userDefaults.object(forKey: Constants.userAttributesKey) as? [String: Any]
        if data == nil {
            data = JsonObject()
        }
        return data!
    }

    static func getNewUserInfo(storage: ClickstreamContextStorage, userId: String) -> [String: Any] {
        var userInfo = JsonObject()
        var allUserInfo = storage.userDefaults.object(forKey: Constants.userInfoKey) as? [String: Any] ?? JsonObject()
        if allUserInfo.isEmpty {
            // first new user login need to associate the userId and exist user uniqueId and save it to userDefault.
            userInfo["user_unique_id"] = getCurrentUserUniqueId(storage: storage)
            userInfo["user_first_touch_timestamp"] = getUserFirstTouchTimestamp(storage: storage)
            allUserInfo[userId] = userInfo
            storage.userDefaults.save(key: Constants.userInfoKey, value: allUserInfo)
        } else if allUserInfo.keys.contains(userId) {
            // switch to old user.
            userInfo = allUserInfo[userId] as! [String: Any]
            saveCurrentUserUniqueId(storage: storage, userUniqueId: userInfo["user_unique_id"] as! String)
        } else {
            // switch to new user.
            let userUniqueId = UUID().uuidString
            userInfo["user_unique_id"] = userUniqueId
            userInfo["user_first_touch_timestamp"] = Date().millisecondsSince1970
            saveCurrentUserUniqueId(storage: storage, userUniqueId: userUniqueId)
            allUserInfo[userId] = userInfo
            storage.userDefaults.save(key: Constants.userInfoKey, value: allUserInfo)
        }
        return userInfo
    }

    static func getAppVersion(storage: ClickstreamContextStorage) -> String? {
        storage.userDefaults.string(forKey: Constants.appVersionKey)
    }

    static func saveAppVersion(storage: ClickstreamContextStorage, appVersion: String) {
        storage.userDefaults.save(key: Constants.appVersionKey, value: appVersion)
    }

    static func getOSVersion(storage: ClickstreamContextStorage) -> String? {
        storage.userDefaults.string(forKey: Constants.osVersionKey)
    }

    static func saveOSVersion(storage: ClickstreamContextStorage, osVersion: String) {
        storage.userDefaults.save(key: Constants.osVersionKey, value: osVersion)
    }

    static func saveSession(storage: ClickstreamContextStorage, session: Session) {
        var sessionObject = JsonObject()
        sessionObject["sessionId"] = session.sessionId
        sessionObject["startTime"] = session.startTime
        sessionObject["pauseTime"] = session.pauseTime
        sessionObject["sessionIndex"] = session.sessionIndex
        storage.userDefaults.save(key: Constants.sessionKey, value: sessionObject)
    }

    static func getSession(storage: ClickstreamContextStorage) -> Session? {
        let sessionObject = storage.userDefaults.object(forKey: Constants.sessionKey) as! JsonObject?
        if sessionObject == nil {
            return nil
        }
        let session = Session(
            sessionId: sessionObject!["sessionId"] as! String,
            startTime: sessionObject!["startTime"] as! Int64,
            pauseTime: sessionObject!["pauseTime"] as! Int64,
            sessionIndex: sessionObject!["sessionIndex"] as! Int)
        return session
    }

    static func getIsFirstOpen(storage: ClickstreamContextStorage) -> Bool {
        storage.userDefaults.string(forKey: Constants.isFirstOpenKey) == nil
    }

    static func saveIsFirstOpen(storage: ClickstreamContextStorage, isFirstOpen: String) {
        storage.userDefaults.save(key: Constants.isFirstOpenKey, value: isFirstOpen)
    }

    static func getBundleSequenceId(storage: ClickstreamContextStorage) -> Int {
        Int(storage.userDefaults.string(forKey: Constants.bundleSequenceIdKey) ?? "1")!
    }

    static func saveBundleSequenceId(storage: ClickstreamContextStorage, bundleSequenceId: Int) {
        storage.userDefaults.save(key: Constants.isFirstOpenKey, value: String(describing: bundleSequenceId))
    }

    static func getPreviousScreenViewTimestamp(storage: ClickstreamContextStorage) -> Int64 {
        Int64(storage.userDefaults.string(forKey: Constants.previousScreenViewTimestampKey) ?? "0")!
    }

    static func savePreviousScreenViewTimestamp(storage: ClickstreamContextStorage, timestamp: Int64) {
        storage.userDefaults.save(key: Constants.previousScreenViewTimestampKey, value: String(describing: timestamp))
    }
}

// swiftlint:enable force_cast

extension UserDefaultsUtil {
    enum Constants {
        static let prefix = "software.aws.solution.clickstream."
        static let deviceIdKey = prefix + "deviceIdKey"
        static let userIdKey = prefix + "userIdKey"
        static let userUniqueIdKey = prefix + "userUniqueIdKey"
        static let userAttributesKey = prefix + "userAttributesKey"
        static let userInfoKey = prefix + "userInfoKey"
        static let userFirstTouchTimestampKey = prefix + "userFirstTouchTimestampKey"
        static let appVersionKey = prefix + "appVersionKey"
        static let osVersionKey = prefix + "osVersionKey"
        static let sessionKey = prefix + "sessionKey"
        static let isFirstOpenKey = prefix + "isFirstOpenKey"
        static let bundleSequenceIdKey = prefix + "bundleSequenceIdKey"
        static let previousScreenViewTimestampKey = prefix + "previousScreenViewTimestampKey"
    }
}

extension UserDefaultsUtil: ClickstreamLogger {}
