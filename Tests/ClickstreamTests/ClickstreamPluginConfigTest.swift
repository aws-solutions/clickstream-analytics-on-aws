//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
@testable import Clickstream
import XCTest

class ClickstreamPluginConfigTest: ClickstreamPluginTestBase {
    func testPluginKey() {
        let pluginKey = analyticsPlugin.key
        XCTAssertEqual(pluginKey, "awsClickstreamPlugin")
    }

    func testConfigSuccess() {
        let appId = JSONValue(stringLiteral: testAppId)
        let endpoint = JSONValue(stringLiteral: testEndpoint)
        let sendEventsInterval: JSONValue = 15_000
        let isTrackAppExceptionEvents: JSONValue = false
        let isCompressEvents: JSONValue = false
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint),
            (AWSClickstreamConfiguration.sendEventsIntervalKey, sendEventsInterval),
            (AWSClickstreamConfiguration.isTrackAppExceptionKey, isTrackAppExceptionEvents),
            (AWSClickstreamConfiguration.isCompressEventsKey, isCompressEvents)
        )
        do {
            let analyticsPlugin = AWSClickstreamPlugin()
            try analyticsPlugin.configure(using: configJson)

            XCTAssertNotNil(analyticsPlugin.clickstream)
            XCTAssertNotNil(analyticsPlugin.autoFlushEventsTimer)
            XCTAssertNotNil(analyticsPlugin.networkMonitor)
            XCTAssertTrue(analyticsPlugin.isEnabled)
        } catch {
            XCTFail("Fail to config analytics plugin")
        }
    }

    func testConfigFailForNilConfiguration() {
        do {
            let analyticsPlugin = AWSClickstreamPlugin()
            try analyticsPlugin.configure(using: nil)
            XCTFail("Config analytics plugin for nil should not succeed")
        } catch {
            guard let pluginError = error as? PluginError,
                  case .pluginConfigurationError = pluginError
            else {
                XCTFail("Should throw invalidConfiguration exception. But received \(error) ")
                return
            }
        }
    }
}
