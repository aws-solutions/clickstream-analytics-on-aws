//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation

private typealias Limit = Event.Limit
typealias JsonObject = [String: Any]

class ClickstreamEvent: AnalyticsPropertiesModel {
    let eventId: String
    let appId: String
    let uniqueId: String
    let eventType: String
    let timestamp: Date.Timestamp
    let session: Session?
    private(set) lazy var attributes: [String: AttributeValue] = [:]
    private(set) lazy var items: [ClickstreamAttribute] = []
    private(set) lazy var userAttributes: [String: Any] = [:]
    let attributeLock = NSLock()
    let systemInfo: SystemInfo
    let netWorkType: String

    init(eventId: String = UUID().uuidString,
         eventType: String,
         appId: String,
         uniqueId: String,
         timestamp: Date.Timestamp = Date().millisecondsSince1970,
         session: Session?,
         systemInfo: SystemInfo,
         netWorkType: String)
    {
        self.eventId = eventId
        self.appId = appId
        self.uniqueId = uniqueId
        self.eventType = eventType
        self.timestamp = timestamp
        self.session = session
        self.systemInfo = systemInfo
        self.netWorkType = netWorkType
    }

    func addAttribute(_ attribute: AttributeValue, forKey key: String) {
        let eventError = EventChecker.checkAttribute(currentNumber: attributes.count, key: key, value: attribute)
        if eventError.errorCode > 0, key != Event.ReservedAttribute.EXCEPTION_STACK {
            attributes[Event.ReservedAttribute.ERROR_CODE] = eventError.errorCode
            attributes[Event.ReservedAttribute.ERROR_MESSAGE] = eventError.errorMessage
        } else {
            attributes[key] = attribute
        }
    }

    func addItem(_ item: ClickstreamAttribute) {
        let checkResult = EventChecker.checkItem(currentNumber: items.count, item: item)
        let eventError = checkResult.eventError
        let resultItem = checkResult.resultItem
        if eventError.errorCode > 0 {
            attributes[Event.ReservedAttribute.ERROR_CODE] = eventError.errorCode
            attributes[Event.ReservedAttribute.ERROR_MESSAGE] = eventError.errorMessage
        } else {
            if !resultItem.isEmpty {
                items.append(resultItem)
            }
        }
    }

    func addGlobalAttribute(_ attribute: AttributeValue, forKey key: String) {
        attributes[key] = attribute
    }

    func setUserAttribute(_ attributes: [String: Any]) {
        attributeLock.lock()
        for attr in attributes {
            userAttributes[attr.key] = attr.value
        }
        attributeLock.unlock()
    }

    func attribute(forKey key: String) -> AttributeValue? {
        attributes[key]
    }

    func toJsonObject() -> JsonObject {
        var event = JsonObject()
        event["unique_id"] = uniqueId
        event["event_type"] = eventType
        event["event_id"] = eventId
        event["app_id"] = appId
        event["timestamp"] = timestamp
        event["device_id"] = systemInfo.deviceId
        event["device_unique_id"] = systemInfo.idfa
        event["platform"] = systemInfo.platform
        event["os_version"] = systemInfo.osVersion
        event["make"] = systemInfo.make
        event["brand"] = systemInfo.brand
        event["model"] = systemInfo.model
        event["locale"] = String(describing: Locale.current)
        event["carrier"] = systemInfo.carrier
        event["network_type"] = netWorkType
        event["screen_height"] = systemInfo.screenHeight
        event["screen_width"] = systemInfo.screenWidth
        event["zone_offset"] = TimeZone.current.secondsFromGMT() * 1_000
        event["system_language"] = Locale.current.languageCode ?? "UNKNOWN"
        event["country_code"] = Locale.current.regionCode ?? "UNKNOWN"
        event["sdk_version"] = PackageInfo.version
        event["sdk_name"] = "aws-solution-clickstream-sdk"
        event["app_version"] = systemInfo.appVersion
        event["app_package_name"] = systemInfo.appPackgeName
        event["app_title"] = systemInfo.appTitle
        if !items.isEmpty {
            event["items"] = items
        }
        attributeLock.lock()
        if !userAttributes.isEmpty {
            event["user"] = userAttributes
        }
        attributeLock.unlock()
        event["attributes"] = getAttributeObject(from: attributes)
        return event
    }

    private func getAttributeObject(from dictionary: AnalyticsProperties) -> JsonObject {
        var attribute = JsonObject()
        if session != nil {
            attribute["_session_id"] = session!.sessionId
            attribute["_session_start_timestamp"] = session!.startTime
            attribute["_session_duration"] = session!.duration
            attribute["_session_number"] = session!.sessionIndex
        }
        if dictionary.isEmpty {
            return attribute
        }
        for (key, value) in dictionary.sorted(by: { $0.key < $1.key }) {
            if let value = value as? Double {
                attribute[key] = Decimal(string: String(value))
            } else {
                attribute[key] = value
            }
        }
        return attribute
    }
}

// MARK: - ClickstreamLogger

extension ClickstreamEvent: ClickstreamLogger {}
