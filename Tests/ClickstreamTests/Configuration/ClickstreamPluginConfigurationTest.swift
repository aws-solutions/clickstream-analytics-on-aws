//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
@testable import Clickstream
import XCTest

class ClickstreamPluginConfigurationTest: XCTestCase {
    let appId: JSONValue = "myAppId"
    let testAppId = "myAppId"
    let endpoint: JSONValue = "https://example.com/collect"
    let testEndpoint = "https://example.com/collect"
    let sendEventsInterval: JSONValue = 15_000
    let testSendEventsInterval = 15_000

    func testConfigureSuccessWithDefaultValue() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint)
        )

        do {
            let config = try AWSClickstreamConfiguration(configJson)
            XCTAssertNotNil(config)
            XCTAssertEqual(config.appId, testAppId)
            XCTAssertEqual(config.endpoint, testEndpoint)
            XCTAssertEqual(config.sendEventsInterval, 0)
            XCTAssertNil(config.isTrackAppExceptionEvents)
            XCTAssertNil(config.isCompressEvents)
        } catch {
            XCTFail("Failed to instantiate clicstream plugin configuration")
        }
    }

    func testConfigFailWithInvalidConfigJson() {
        let configJson: JSONValue = ""
        let errString = "Configuration was not a dictionary literal"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func testConfigureWithNoAppId() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.endpointKey, endpoint)
        )
        let errString = "appId is missing"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func testConfigureWithInvalidAppId() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, true),
            (AWSClickstreamConfiguration.endpointKey, endpoint)
        )
        let errString = "appId is not a string"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func testConfigureWithNoEndpoint() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId)
        )
        let errString = "endpoint is missing"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func testConfigureWithInvalidEndpoint() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, 123)
        )
        let errString = "endpoint is not a string"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func testConfigureSuccessWithCustomSendEventsInterval() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint),
            (AWSClickstreamConfiguration.sendEventsIntervalKey, sendEventsInterval)
        )
        do {
            let config = try AWSClickstreamConfiguration(configJson)
            XCTAssertNotNil(config)
            XCTAssertEqual(config.appId, testAppId)
            XCTAssertEqual(config.endpoint, testEndpoint)
            XCTAssertEqual(config.sendEventsInterval, testSendEventsInterval)
            XCTAssertNil(config.isTrackAppExceptionEvents)
            XCTAssertNil(config.isCompressEvents)
        } catch {
            XCTFail("Failed to instantiate clicstream plugin configuration")
        }
    }

    func testConfigureErrorWithNegativeSendEventsInterval() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint),
            (AWSClickstreamConfiguration.sendEventsIntervalKey, -100)
        )
        let errString = "sendEventsInterval is less than 0"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func testConfigureErrorWithInvalidSendEventsInterval() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint),
            (AWSClickstreamConfiguration.sendEventsIntervalKey, "100")
        )
        let errString = "sendEventsInterval is not a number"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func testConfigureSuccessWithNotTrackAppException() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint),
            (AWSClickstreamConfiguration.isTrackAppExceptionKey, false)
        )
        do {
            let config = try AWSClickstreamConfiguration(configJson)
            XCTAssertNotNil(config)
            XCTAssertEqual(config.appId, testAppId)
            XCTAssertEqual(config.endpoint, testEndpoint)
            XCTAssertEqual(config.sendEventsInterval, 0)
            XCTAssertEqual(config.isTrackAppExceptionEvents, false)
            XCTAssertNil(config.isCompressEvents)
        } catch {
            XCTFail("Failed to instantiate clicstream plugin configuration")
        }
    }

    func testConfigureErrorWithInvalidTrackAppExceptionValue() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint),
            (AWSClickstreamConfiguration.isTrackAppExceptionKey, 10)
        )
        let errString = "isTrackAppException is not a boolean value"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func testConfigureSuccessWithNotCompressEvents() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint),
            (AWSClickstreamConfiguration.isCompressEventsKey, false)
        )
        do {
            let config = try AWSClickstreamConfiguration(configJson)
            XCTAssertNotNil(config)
            XCTAssertEqual(config.appId, testAppId)
            XCTAssertEqual(config.endpoint, testEndpoint)
            XCTAssertEqual(config.sendEventsInterval, 0)
            XCTAssertEqual(config.isCompressEvents, false)
        } catch {
            XCTFail("Failed to instantiate clicstream plugin configuration")
        }
    }

    func testConfigureErrorWithInvalidCompressEventsValue() {
        let configJson = JSONValue(
            dictionaryLiteral:
            (AWSClickstreamConfiguration.appIdKey, appId),
            (AWSClickstreamConfiguration.endpointKey, endpoint),
            (AWSClickstreamConfiguration.isCompressEventsKey, "10")
        )
        let errString = "isCompressEvents is not a boolean value"
        assertInitPluginError(errString: errString, configJson: configJson)
    }

    func assertInitPluginError(errString: String, configJson: JSONValue) {
        XCTAssertThrowsError(try AWSClickstreamConfiguration(configJson)) { error in
            guard case let PluginError.pluginConfigurationError(errorDescription, _, _) = error else {
                XCTFail("Expected PluginError pluginConfigurationError, got: \(error)")
                return
            }
            XCTAssertEqual(errorDescription, errString)
        }
    }
}
