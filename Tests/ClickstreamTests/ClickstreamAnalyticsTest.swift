//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Amplify
import Clickstream
import XCTest

class ClickstreamAnalyticsTest: XCTestCase {
    override func setUp() async throws {
        await Amplify.reset()
    }

    override func tearDown() async throws {
        await Amplify.reset()
    }

    func testThrowMissingConfigureFileWhenInitSDK() throws {
        do {
            try ClickstreamAnalytics.initSDK()
            XCTFail("Should have thrown a invalidAmplifyConfigurationFile error, if no configuration file is specified")
        } catch {
            guard case ConfigurationError.unableToDecode = error else {
                XCTFail("Should have thrown a invalidAmplifyConfigurationFile error")
                return
            }
        }
    }

    func testInitSDKForObjc() throws {
        do {
            try ClickstreamObjc.initSDK()
            XCTFail("Should have thrown a invalidAmplifyConfigurationFile error, if no configuration file is specified")
        } catch {
            guard case ConfigurationError.unableToDecode = error else {
                XCTFail("Should have thrown a invalidAmplifyConfigurationFile error")
                return
            }
        }
    }

    func testInitSDKWithConfigurationForObjc() throws {
        let config = ClickstreamConfiguration()
            .withAppId("testAppId")
            .withEndpoint("http://example.com/collect")
        try ClickstreamObjc.initSDK(config)
    }
}
