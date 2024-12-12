//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation

/// ClickstreamAnalytics api for swift
public enum ClickstreamAnalytics {
    /// Init ClickstreamAnalytics
    public static func initSDK(_ configuration: ClickstreamConfiguration? = nil) throws {
        try Amplify.add(plugin: AWSClickstreamPlugin(configuration))
        try Amplify.configure(getAmplifyConfigurationSafely())
    }

    /// Use this method to record event
    /// - Parameter eventName: the event name
    public static func recordEvent(_ eventName: String) {
        Amplify.Analytics.record(eventWithName: eventName)
    }

    /// The method to record event with ClickstreamAttribute
    /// - Parameters:
    ///   - eventName: the event name
    ///   - attributes: the event attributes
    public static func recordEvent(_ eventName: String,
                                   _ attributes: ClickstreamAttribute,
                                   _ items: [ClickstreamAttribute] = [])
    {
        let event = BaseClickstreamEvent(name: eventName, attribute: attributes, items: items)
        Amplify.Analytics.record(event: event)
    }

    /// Use this method to send events immediately
    public static func flushEvents() {
        Amplify.Analytics.flushEvents()
    }

    /// Add global attributes
    /// - Parameter attributes: the global attributes to add
    public static func addGlobalAttributes(_ attributes: ClickstreamAttribute) {
        Amplify.Analytics.registerGlobalProperties(attributes)
    }

    /// Delete global attributes
    /// - Parameter attributes: the global attributes names to delete
    public static func deleteGlobalAttributes(_ attributes: String...) {
        Amplify.Analytics.unregisterGlobalProperties(attributes)
    }

    /// Add user attributes
    /// - Parameter attributes: the user attributes to add
    public static func addUserAttributes(_ attributes: ClickstreamAttribute) {
        let userProfile = AnalyticsUserProfile(location: nil, properties: attributes)
        Amplify.Analytics.identifyUser(userId: Event.User.USER_ID_EMPTY,
                                       userProfile: userProfile)
    }

    /// Set user id for login and logout
    /// - Parameter userId: current userId, nil for logout
    public static func setUserId(_ userId: String?) {
        if userId == nil {
            Amplify.Analytics.identifyUser(userId: Event.User.USER_ID_NIL)
        } else {
            Amplify.Analytics.identifyUser(userId: userId!)
        }
    }

    /// Get Clickstream configuration, please config it after initialize sdk
    /// - Returns: ClickstreamContextConfiguration to modify the configuration of clickstream sdk
    public static func getClickstreamConfiguration() throws -> ClickstreamConfiguration {
        let plugin = try Amplify.Analytics.getPlugin(for: "awsClickstreamPlugin")
        // swiftlint:disable force_cast
        return (plugin as! AWSClickstreamPlugin).getEscapeHatch().configuration
        // swiftlint:enable force_cast
    }

    /// Disable the SDK
    /// - Parameter userId: current userId, nil for logout
    public static func disable() {
        Amplify.Analytics.disable()
    }

    /// Enable the SDK
    /// - Parameter userId: current userId, nil for logout
    public static func enable() {
        Amplify.Analytics.enable()
    }

    static func getAmplifyConfigurationSafely(_ bundle: Bundle = Bundle.main) throws -> AmplifyConfiguration {
        guard let path = bundle.path(forResource: "amplifyconfiguration", ofType: "json") else {
            log.debug("Could not load default `amplifyconfiguration.json` file")
            let plugins: [String: JSONValue] = [
                "awsClickstreamPlugin": [
                    "appId": JSONValue.string(""),
                    "endpoint": JSONValue.string("")
                ]
            ]
            let analyticsConfiguration = AnalyticsCategoryConfiguration(plugins: plugins)
            return AmplifyConfiguration(analytics: analyticsConfiguration)
        }
        let url = URL(fileURLWithPath: path)
        return try AmplifyConfiguration(configurationFile: url)
    }

    /// ClickstreamAnalytics preset events
    public enum EventName {
        public static let SCREEN_VIEW = "_screen_view"
    }

    /// ClickstreamANalytics preset attributes
    public enum Attr {
        /// Preset attribute screen name
        public static let SCREEN_NAME = "_screen_name"
        /// Preset attribute screen unique id
        public static let SCREEN_UNIQUE_ID = "_screen_unique_id"
        /// Preset attribute traffic  source  source
        public static let TRAFFIC_SOURCE_SOURCE = "_traffic_source_source"
        /// Preset attribute traffic  source  medium
        public static let TRAFFIC_SOURCE_MEDIUM = "_traffic_source_medium"
        /// Preset attribute traffic  source  campaign
        public static let TRAFFIC_SOURCE_CAMPAIGN = "_traffic_source_campaign"
        /// Preset attribute traffic  source  campaign id
        public static let TRAFFIC_SOURCE_CAMPAIGN_ID = "_traffic_source_campaign_id"
        /// Preset attribute traffic  source  term
        public static let TRAFFIC_SOURCE_TERM = "_traffic_source_term"
        /// Preset attribute traffic  source  content
        public static let TRAFFIC_SOURCE_CONTENT = "_traffic_source_content"
        /// Preset attribute traffic  source  clid
        public static let TRAFFIC_SOURCE_CLID = "_traffic_source_clid"
        /// Preset attribute traffic  source  clid platform
        public static let TRAFFIC_SOURCE_CLID_PLATFORM = "_traffic_source_clid_platform"
        /// Preset attribute app install channel
        public static let APP_INSTALL_CHANNEL = "_app_install_channel"
        /// Preset attribute event value
        public static let VALUE = "_value"
        /// Preset attribute event currency
        public static let CURRENCY = "_currency"
    }

    /// ClickstreamAnalytics preset item attributes
    /// In addition to the item attributes defined below, you can add up to 10 custom attributes to an item.
    public enum Item {
        /// The id of the item
        public static let ITEM_ID = "id"
        /// The name of the item
        public static let ITEM_NAME = "name"
        /// The location id of the item
        public static let LOCATION_ID = "location_id"
        /// The brand of the item
        public static let ITEM_BRAND = "brand"
        /// The currency of the item
        public static let CURRENCY = "currency"
        /// The price of the item
        public static let PRICE = "price"
        /// The quantity of the item
        public static let QUANTITY = "quantity"
        /// The creative name of the item
        public static let CREATIVE_NAME = "creative_name"
        /// The creative slot of the item
        public static let CREATIVE_SLOT = "creative_slot"
        /// The category of the item
        public static let ITEM_CATEGORY = "item_category"
        /// The category2 of the item
        public static let ITEM_CATEGORY2 = "item_category2"
        /// The category3 of the item
        public static let ITEM_CATEGORY3 = "item_category3"
        /// The category4 of the item
        public static let ITEM_CATEGORY4 = "item_category4"
        /// The category5 of the item
        public static let ITEM_CATEGORY5 = "item_category5"
    }
}

extension ClickstreamAnalytics: ClickstreamLogger {}
