//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation
import Network
#if canImport(UIKit)
    import UIKit
#endif

extension AWSClickstreamPlugin {
    /// called when sdk init.
    func configure(using configuration: Any?) throws {
        guard let config = configuration as? JSONValue else {
            throw PluginError.pluginConfigurationError(
                "Unable to decode configuration",
                "Make sure the plugin configuration is JSONValue"
            )
        }
        let pluginConfiguration = try AWSClickstreamConfiguration(config)
        try configure(using: pluginConfiguration)
    }

    /// Configure AWSClickstreamPlugin programatically using AWSClickstreamConfiguration
    func configure(using amplifyConfigure: AWSClickstreamConfiguration) throws {
        try mergeConfiguration(amplifyConfigure: amplifyConfigure)

        clickstream = try ClickstreamContext(with: configuration)
        let sessionClient = SessionClient(clickstream: clickstream)
        clickstream.sessionClient = sessionClient
        let eventRecorder = try EventRecorder(clickstream: clickstream)
        analyticsClient = try AnalyticsClient(clickstream: clickstream,
                                              eventRecorder: eventRecorder,
                                              sessionClient: sessionClient)
        clickstream.analyticsClient = analyticsClient

        let networkMonitor = NWPathMonitor()
        clickstream.networkMonitor = networkMonitor
        sessionClient.startActivityTracking()
        var autoFlushEventsTimer: DispatchSourceTimer?
        if configuration.sendEventsInterval != 0 {
            let timeInterval = TimeInterval(Double(configuration.sendEventsInterval) / 1_000)
            autoFlushEventsTimer = RepeatingTimer.createRepeatingTimer(
                timeInterval: timeInterval,
                eventHandler: { [weak self] in
                    self?.flushEvents()
                }
            )
        }

        configure(
            autoFlushEventsTimer: autoFlushEventsTimer,
            networkMonitor: networkMonitor
        )
        initGlobalAttributes()
        log.debug("initialize Clickstream SDK successful")
        sessionClient.handleAppStart()
    }

    // MARK: Internal

    /// Internal configure method to set the properties of the plugin
    func configure(
        autoFlushEventsTimer: DispatchSourceTimer?,
        networkMonitor: NetworkMonitor
    ) {
        isEnabled = true
        self.autoFlushEventsTimer = autoFlushEventsTimer
        self.autoFlushEventsTimer?.resume()
        self.networkMonitor = networkMonitor
        self.networkMonitor.startMonitoring(
            using: DispatchQueue(
                label: "software.aws.solution.clickstream.AnalyticsPlugin.NetworkMonitor"
            )
        )
    }

    /// Internal method to merge the configurations
    func mergeConfiguration(amplifyConfigure: AWSClickstreamConfiguration) throws {
        let defaultConfiguration = ClickstreamConfiguration.getDefaultConfiguration()
        if (configuration.appId.isNilOrEmpty() && amplifyConfigure.appId.isEmpty) ||
            (configuration.endpoint.isNilOrEmpty() && amplifyConfigure.endpoint.isEmpty)
        {
            throw ConfigurationError.unableToDecode(
                "Configuration Error: `appId` and `endpoint` are required", """
                Ensure they are correctly set in `amplifyconfiguration.json`\
                or provided during SDK initialization with `initSDK()`
                """
            )
        }

        if configuration.appId.isNilOrEmpty() {
            defaultConfiguration.appId = amplifyConfigure.appId
        } else {
            defaultConfiguration.appId = configuration.appId
        }
        if configuration.endpoint.isNilOrEmpty() {
            defaultConfiguration.endpoint = amplifyConfigure.endpoint
        } else {
            defaultConfiguration.endpoint = configuration.endpoint
        }
        if configuration.sendEventsInterval > 0 {
            defaultConfiguration.sendEventsInterval = configuration.sendEventsInterval
        } else if amplifyConfigure.sendEventsInterval > 0 {
            defaultConfiguration.sendEventsInterval = amplifyConfigure.sendEventsInterval
        }
        if configuration.isTrackAppExceptionEvents != nil {
            defaultConfiguration.isTrackAppExceptionEvents = configuration.isTrackAppExceptionEvents
        } else if amplifyConfigure.isTrackAppExceptionEvents != nil {
            defaultConfiguration.isTrackAppExceptionEvents = amplifyConfigure.isTrackAppExceptionEvents
        }
        if configuration.isCompressEvents != nil {
            defaultConfiguration.isCompressEvents = configuration.isCompressEvents
        } else if amplifyConfigure.isCompressEvents != nil {
            defaultConfiguration.isCompressEvents = amplifyConfigure.isCompressEvents
        }

        mergeDefaultConfiguration(defaultConfiguration)
        configuration = defaultConfiguration
    }

    /// Internal method to merge the default configurations
    func mergeDefaultConfiguration(_ defaultConfiguration: ClickstreamConfiguration) {
        if let isTrackScreenViewEvents = configuration.isTrackScreenViewEvents {
            defaultConfiguration.isTrackScreenViewEvents = isTrackScreenViewEvents
        }
        if let isTrackUserEngagementEvents = configuration.isTrackUserEngagementEvents {
            defaultConfiguration.isTrackUserEngagementEvents = isTrackUserEngagementEvents
        }
        if let isLogEvents = configuration.isLogEvents {
            defaultConfiguration.isLogEvents = isLogEvents
        }
        if configuration.sessionTimeoutDuration > 0 {
            defaultConfiguration.sessionTimeoutDuration = configuration.sessionTimeoutDuration
        }
        if configuration.authCookie != nil {
            defaultConfiguration.authCookie = configuration.authCookie
        }
        if configuration.globalAttributes != nil {
            defaultConfiguration.globalAttributes = configuration.globalAttributes
        }
    }

    /// Internal method to add global attributes
    func initGlobalAttributes() {
        if let globalAttributes = configuration.globalAttributes {
            for (key, value) in globalAttributes {
                analyticsClient.addGlobalAttribute(value, forKey: key)
            }
        }
    }
}
