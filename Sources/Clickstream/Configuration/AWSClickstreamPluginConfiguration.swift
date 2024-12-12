//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify

struct AWSClickstreamConfiguration {
    static let appIdKey = "appId"
    static let endpointKey = "endpoint"
    static let sendEventsIntervalKey = "autoFlushEventsInterval"
    static let isTrackAppExceptionKey = "isTrackAppExceptionEvents"
    static let isCompressEventsKey = "isCompressEvents"

    let appId: String
    let endpoint: String
    let sendEventsInterval: Int
    let isTrackAppExceptionEvents: Bool!
    let isCompressEvents: Bool!

    init(_ configuration: JSONValue) throws {
        guard case let .object(configObject) = configuration else {
            throw PluginError.pluginConfigurationError(
                "Configuration was not a dictionary literal",
                "Make sure the value for the plugin is a dictionary literal with keys"
            )
        }

        let appId = try AWSClickstreamConfiguration.getAppId(configObject)
        let endpoint = try AWSClickstreamConfiguration.getEndpoint(configObject)
        let sendEventsInterval = try AWSClickstreamConfiguration.getSendEventsInterval(configObject)
        let isTrackAppExceptionEvents = try AWSClickstreamConfiguration.getIsTrackAppExceptionEvents(configObject)
        let isCompressEvents = try AWSClickstreamConfiguration.getIsCompressEvents(configObject)

        self.init(appId: appId,
                  endpoint: endpoint,
                  sendEventsInterval: sendEventsInterval,
                  isTrackAppExceptionEvents: isTrackAppExceptionEvents,
                  isCompressEvents: isCompressEvents)
    }

    init(appId: String,
         endpoint: String,
         sendEventsInterval: Int,
         isTrackAppExceptionEvents: Bool!,
         isCompressEvents: Bool!)
    {
        self.appId = appId
        self.endpoint = endpoint
        self.sendEventsInterval = sendEventsInterval
        self.isTrackAppExceptionEvents = isTrackAppExceptionEvents
        self.isCompressEvents = isCompressEvents
    }

    private static func getAppId(_ configuration: [String: JSONValue]) throws -> String {
        guard let appId = configuration[appIdKey] else {
            throw PluginError.pluginConfigurationError(
                "appId is missing",
                "Add appId to the configuration"
            )
        }

        guard case let .string(appIdValue) = appId else {
            throw PluginError.pluginConfigurationError(
                "appId is not a string",
                "Ensure appId is a string"
            )
        }

        return appIdValue
    }

    private static func getEndpoint(_ configuration: [String: JSONValue]) throws -> String {
        guard let endpoint = configuration[endpointKey] else {
            throw PluginError.pluginConfigurationError(
                "endpoint is missing",
                "Add endpoint to the configuration"
            )
        }

        guard case let .string(endpointValue) = endpoint else {
            throw PluginError.pluginConfigurationError(
                "endpoint is not a string",
                "Ensure endpoint is a string"
            )
        }

        return endpointValue
    }

    private static func getSendEventsInterval(_ configuration: [String: JSONValue]) throws -> Int {
        guard let sendEventsInterval = configuration[sendEventsIntervalKey] else {
            return 0
        }

        guard case let .number(sendEventsIntervalValue) = sendEventsInterval else {
            throw PluginError.pluginConfigurationError(
                "sendEventsInterval is not a number",
                "Ensure sendEventsInterval is a number"
            )
        }

        if sendEventsIntervalValue < 0 {
            throw PluginError.pluginConfigurationError(
                "sendEventsInterval is less than 0",
                "Ensure sendEventsInterval is zero or positive number"
            )
        }

        return Int(sendEventsIntervalValue)
    }

    private static func getIsTrackAppExceptionEvents(_ configuration: [String: JSONValue]) throws -> Bool! {
        guard let isTrackAppException = configuration[isTrackAppExceptionKey] else {
            return nil
        }

        guard case let .boolean(isTrackAppExceptionValue) = isTrackAppException else {
            throw PluginError.pluginConfigurationError(
                "isTrackAppException is not a boolean value",
                "Ensure isTrackAppException is a boolean value"
            )
        }

        return isTrackAppExceptionValue
    }

    private static func getIsCompressEvents(_ configuration: [String: JSONValue]) throws -> Bool! {
        guard let isCompressEvents = configuration[isCompressEventsKey] else {
            return nil
        }

        guard case let .boolean(isCompressEventsValue) = isCompressEvents else {
            throw PluginError.pluginConfigurationError(
                "isCompressEvents is not a boolean value",
                "Ensure isCompressEvents is a boolean value"
            )
        }

        return isCompressEventsValue
    }
}

extension AWSClickstreamConfiguration: ClickstreamLogger {}
