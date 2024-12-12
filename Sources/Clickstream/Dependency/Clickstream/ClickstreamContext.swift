//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import AWSPluginsCore
import Foundation
import Network

// MARK: - UserDefaultsBehaviour

protocol UserDefaultsBehaviour {
    func save(key: String, value: UserDefaultsBehaviourValue?)
    func removeObject(forKey key: String)
    func string(forKey key: String) -> String?
    func data(forKey key: String) -> Data?
    func object(forKey: String) -> Any?
}

protocol UserDefaultsBehaviourValue {}
extension String: UserDefaultsBehaviourValue {}
extension Data: UserDefaultsBehaviourValue {}
extension Dictionary: UserDefaultsBehaviourValue {}

extension UserDefaults: UserDefaultsBehaviour {
    func save(key: String, value: UserDefaultsBehaviourValue?) {
        set(value, forKey: key)
    }
}

// MARK: - ClickstreamContext

/// The configuration object for clickstream, modify the params after sdk initialize
@objcMembers public class ClickstreamConfiguration: NSObject {
    /// The clickstream appId
    var appId: String!
    /// The clickstream endpoint
    var endpoint: String!
    /// Time interval after which the events are automatically submitted to server
    var sendEventsInterval: Int = 0
    /// Whether to track app exception events automatically
    var isTrackAppExceptionEvents: Bool!
    /// Whether to track app scren view events automatically
    var isTrackScreenViewEvents: Bool!
    /// Whether to track app user engagement events automatically
    var isTrackUserEngagementEvents: Bool!
    /// Whether to compress events when send to server
    var isCompressEvents: Bool!
    /// Whether to log events json in console when debug
    var isLogEvents: Bool!
    /// The auth cookie for request
    var authCookie: String?
    /// The session timeout calculated the duration from last app in background, defalut is 1800000ms
    var sessionTimeoutDuration: Int64 = 0
    /// The global attributes when initialize the SDK
    var globalAttributes: ClickstreamAttribute?

    static func getDefaultConfiguration() -> ClickstreamConfiguration {
        let configuration = ClickstreamConfiguration()
        configuration.sendEventsInterval = 10_000
        configuration.isTrackAppExceptionEvents = false
        configuration.isTrackScreenViewEvents = true
        configuration.isTrackUserEngagementEvents = true
        configuration.isCompressEvents = true
        configuration.isLogEvents = false
        configuration.sessionTimeoutDuration = 1_800_000
        return configuration
    }

    public func withAppId(_ appId: String) -> ClickstreamConfiguration {
        self.appId = appId
        return self
    }

    public func withEndpoint(_ endpoint: String) -> ClickstreamConfiguration {
        self.endpoint = endpoint
        return self
    }

    public func withSendEventInterval(_ sendEventsInterval: Int) -> ClickstreamConfiguration {
        self.sendEventsInterval = sendEventsInterval
        return self
    }

    public func withTrackAppExceptionEvents(_ isTrackAppExceptionEvents: Bool) -> ClickstreamConfiguration {
        self.isTrackAppExceptionEvents = isTrackAppExceptionEvents
        return self
    }

    public func withTrackScreenViewEvents(_ isTrackScreenViewEvents: Bool) -> ClickstreamConfiguration {
        self.isTrackScreenViewEvents = isTrackScreenViewEvents
        return self
    }

    public func withTrackUserEngagementEvents(_ isTrackUserEngagementEvents: Bool) -> ClickstreamConfiguration {
        self.isTrackUserEngagementEvents = isTrackUserEngagementEvents
        return self
    }

    public func withCompressEvents(_ isCompressEvents: Bool) -> ClickstreamConfiguration {
        self.isCompressEvents = isCompressEvents
        return self
    }

    public func withLogEvents(_ isLogEvents: Bool) -> ClickstreamConfiguration {
        self.isLogEvents = isLogEvents
        return self
    }

    public func withAuthCookie(_ authCookie: String) -> ClickstreamConfiguration {
        self.authCookie = authCookie
        return self
    }

    public func withSessionTimeoutDuration(_ sessionTimeoutDuration: Int64) -> ClickstreamConfiguration {
        self.sessionTimeoutDuration = sessionTimeoutDuration
        return self
    }

    public func withInitialGlobalAttributes(_ globalAttributes: ClickstreamAttribute) -> ClickstreamConfiguration {
        self.globalAttributes = globalAttributes
        return self
    }

    public func withInitialGlobalAttributesObjc(_ globalAttributes: NSDictionary) -> ClickstreamConfiguration {
        self.globalAttributes = ClickstreamObjc.getAttributes(globalAttributes)
        return self
    }
}

struct ClickstreamContextStorage {
    let userDefaults: UserDefaultsBehaviour
}

class ClickstreamContext {
    var sessionClient: SessionClientBehaviour!
    var analyticsClient: AnalyticsClientBehaviour!
    var networkMonitor: NetworkMonitor!
    let systemInfo: SystemInfo
    var configuration: ClickstreamConfiguration
    var userUniqueId: String
    let storage: ClickstreamContextStorage
    var isEnable: Bool

    init(with configuration: ClickstreamConfiguration,
         userDefaults: UserDefaultsBehaviour = UserDefaults.standard) throws
    {
        self.storage = ClickstreamContextStorage(userDefaults: userDefaults)
        self.userUniqueId = UserDefaultsUtil.getCurrentUserUniqueId(storage: storage)
        self.systemInfo = SystemInfo(storage: storage)
        self.configuration = configuration
        self.isEnable = true
    }
}
