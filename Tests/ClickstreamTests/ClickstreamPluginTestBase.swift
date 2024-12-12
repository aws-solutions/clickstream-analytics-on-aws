//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Amplify
@testable import Clickstream
import XCTest

class ClickstreamPluginTestBase: XCTestCase {
    var analyticsPlugin: AWSClickstreamPlugin!
    var mockNetworkMonitor: MockNetworkMonitor!
    var clickstream: ClickstreamContext!
    let testAppId = "testAppId"
    let testEndpoint = "https://example.com/collect"

    override func setUp() async throws {
        mockNetworkMonitor = MockNetworkMonitor()
        analyticsPlugin = AWSClickstreamPlugin()

        let contextConfiguration = ClickstreamConfiguration.getDefaultConfiguration()
            .withAppId(testAppId + UUID().uuidString)
            .withEndpoint(testEndpoint)
            .withSendEventInterval(10_000)
            .withTrackAppExceptionEvents(false)
            .withCompressEvents(false)
        clickstream = try ClickstreamContext(with: contextConfiguration)

        let sessionClient = SessionClient(clickstream: clickstream)
        clickstream.sessionClient = sessionClient

        let eventRecorder = try EventRecorder(clickstream: clickstream)
        let analyticsClient = try AnalyticsClient(clickstream: clickstream,
                                                  eventRecorder: eventRecorder,
                                                  sessionClient: sessionClient)
        analyticsPlugin.analyticsClient = analyticsClient
        clickstream.analyticsClient = analyticsClient
        clickstream.networkMonitor = mockNetworkMonitor

        analyticsPlugin.configure(autoFlushEventsTimer: nil,
                                  networkMonitor: mockNetworkMonitor)

        await Amplify.reset()
        let config = AmplifyConfiguration()
        do {
            try Amplify.configure(config)
        } catch {
            XCTFail("Error setting up Amplify: \(error)")
        }
    }

    override func tearDown() async throws {
        await Amplify.reset()
        analyticsPlugin.reset()
    }
}
