//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation

final class AWSClickstreamPlugin: AnalyticsCategoryPlugin {
    var clickstream: ClickstreamContext!

    /// Automatically flushes the events that have been recorded on an interval
    var autoFlushEventsTimer: DispatchSourceTimer?

    /// An observer to monitor connectivity changes
    var networkMonitor: NetworkMonitor!

    /// Specifies whether the plugin is enabled
    var isEnabled: Bool!

    /// ClickstreamClient for evnet handle
    var analyticsClient: AnalyticsClientBehaviour!

    /// The configuration file plugin key of clickstream plugin
    var key: PluginKey {
        "awsClickstreamPlugin"
    }

    var configuration: ClickstreamConfiguration

    /// Instantiates an instance of the AWSClickstreamPlugin
    init(_ configuration: ClickstreamConfiguration? = nil) {
        self.configuration = configuration ?? ClickstreamConfiguration()
    }
}
