//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Amplify
@testable import Clickstream
import Foundation
import XCTest

class SDKInitialTest: XCTestCase {
    override func setUp() async throws {
        await Amplify.reset()
    }

    override func tearDown() async throws {
        await Amplify.reset()
    }

    func testInitSDKWithoutAnyConfiguration() throws {
        XCTAssertThrowsError(try ClickstreamAnalytics.initSDK()) { error in
            XCTAssertTrue(error is ConfigurationError)
        }
    }

    func testInitSDKWithOnlyAmplifyJSONFile() throws {
        let amplifyConfigure = try ClickstreamAnalytics.getAmplifyConfigurationSafely(Bundle.module)
        try Amplify.add(plugin: AWSClickstreamPlugin())
        try Amplify.configure(amplifyConfigure)
    }

    func testInitSDKWithAllConfiguration() throws {
        let configure = ClickstreamConfiguration()
            .withAppId("testAppId")
            .withEndpoint("https://example.com/collect")
            .withLogEvents(true)
            .withCompressEvents(false)
            .withSessionTimeoutDuration(100_000)
            .withSendEventInterval(15_000)
            .withTrackAppExceptionEvents(true)
            .withTrackScreenViewEvents(false)
            .withTrackUserEngagementEvents(false)
            .withAuthCookie("testAuthCookie")
            .withInitialGlobalAttributes([
                ClickstreamAnalytics.Attr.APP_INSTALL_CHANNEL: "AppStore",
                "level": 5.1,
                "class": 5,
                "isOpenNotification": true
            ])
        try ClickstreamAnalytics.initSDK(configure)
    }

    func testInitSDKWithGlobalAttributeForObjc() throws {
        let globalAttribute: NSDictionary = [
            ClickstreamAnalytics.Attr.APP_INSTALL_CHANNEL: "SMS",
            "Successful": true,
            "Score": 90.1,
            "level": 5
        ]
        let configure = ClickstreamConfiguration()
            .withAppId("testAppId")
            .withEndpoint("https://example.com/collect")
            .withInitialGlobalAttributesObjc(globalAttribute)
        try ClickstreamAnalytics.initSDK(configure)
    }

    func testInitSDKOverrideAllAmplifyConfiguration() throws {
        let configure = ClickstreamConfiguration()
            .withAppId("testAppId1")
            .withEndpoint("https://example.com/collect1")
            .withLogEvents(true)
            .withCompressEvents(false)
            .withSessionTimeoutDuration(100_000)
            .withSendEventInterval(15_000)
            .withTrackAppExceptionEvents(true)
            .withTrackScreenViewEvents(false)
            .withTrackUserEngagementEvents(false)
            .withAuthCookie("testAuthCookie")
        let amplifyConfigure = try ClickstreamAnalytics.getAmplifyConfigurationSafely(Bundle.module)
        try Amplify.add(plugin: AWSClickstreamPlugin(configure))
        try Amplify.configure(amplifyConfigure)
        let resultConfig = try ClickstreamAnalytics.getClickstreamConfiguration()
        XCTAssertEqual("testAppId1", resultConfig.appId)
        XCTAssertEqual("https://example.com/collect1", resultConfig.endpoint)
        XCTAssertEqual(true, resultConfig.isLogEvents)
        XCTAssertEqual(false, resultConfig.isCompressEvents)
        XCTAssertEqual(true, resultConfig.isTrackAppExceptionEvents)
    }

    func testInitSDKOverrideSomeAmplifyConfiguration() throws {
        let configure = ClickstreamConfiguration()
            .withLogEvents(true)
            .withCompressEvents(false)
            .withSessionTimeoutDuration(100_000)
            .withSendEventInterval(15_000)
            .withTrackScreenViewEvents(false)
            .withTrackUserEngagementEvents(false)
            .withAuthCookie("testAuthCookie")
        let amplifyConfigure = try ClickstreamAnalytics.getAmplifyConfigurationSafely(Bundle.module)
        try Amplify.add(plugin: AWSClickstreamPlugin(configure))
        try Amplify.configure(amplifyConfigure)
        let resultConfig = try ClickstreamAnalytics.getClickstreamConfiguration()
        XCTAssertEqual("testAppId", resultConfig.appId)
        XCTAssertEqual("http://example.com/collect", resultConfig.endpoint)
        XCTAssertEqual(true, resultConfig.isLogEvents)
        XCTAssertEqual(false, resultConfig.isCompressEvents)
        XCTAssertEqual(100_000, resultConfig.sessionTimeoutDuration)
        XCTAssertEqual(15_000, resultConfig.sendEventsInterval)
        XCTAssertEqual(false, resultConfig.isTrackScreenViewEvents)
        XCTAssertEqual(false, resultConfig.isTrackUserEngagementEvents)
        XCTAssertEqual("testAuthCookie", resultConfig.authCookie)
    }

    func testRecordEventWithGlobalAttribute() throws {
        let configure = ClickstreamConfiguration.getDefaultConfiguration()
            .withAppId("testAppId")
            .withEndpoint("https://example.com/collect")
            .withInitialGlobalAttributes([
                "channel": "AppStore",
                "Score": 90.1,
                "class": 5,
                "isOpenNotification": true
            ])
        try ClickstreamAnalytics.initSDK(configure)
        ClickstreamAnalytics.recordEvent("testEvent")
        Thread.sleep(forTimeInterval: 0.1)
        let plugin = try Amplify.Analytics.getPlugin(for: "awsClickstreamPlugin")
        let analyticsClient = (plugin as! AWSClickstreamPlugin).analyticsClient as! AnalyticsClient
        let eventRecorder = analyticsClient.eventRecorder as! EventRecorder
        let testEvent = try getEventForName("testEvent", eventRecorder: eventRecorder)
        let eventAttribute = testEvent["attributes"] as! [String: Any]
        XCTAssertEqual("AppStore", eventAttribute["channel"] as! String)
        XCTAssertEqual(90.1, eventAttribute["Score"] as! Double)
        XCTAssertEqual(5, eventAttribute["class"] as! Int)
        XCTAssertEqual(true, eventAttribute["isOpenNotification"] as! Bool)
    }

    private func getEventForName(_ name: String, eventRecorder: EventRecorder) throws -> [String: Any] {
        var testEvent: [String: Any] = JsonObject()
        let eventArray = try eventRecorder.getBatchEvent().eventsJson.jsonArray()
        for event in eventArray {
            if event["event_type"] as! String == name {
                testEvent = event
                break
            }
        }
        return testEvent
    }
}
