//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import UIKit
import XCTest

class AutoRecordEventClientTest: XCTestCase {
    private var clickstream: ClickstreamContext!
    private var eventRecorder: MockEventRecorder!
    private var autoRecordEventClient: AutoRecordEventClient!
    private var activityTracker: MockActivityTracker!
    private var sessionClient: SessionClient!
    let testAppId = "testAppId"
    let testEndpoint = "https://example.com/collect"

    override func setUp() async throws {
        UserDefaults.standard.removePersistentDomain(forName: Bundle.main.bundleIdentifier!)
        let mockNetworkMonitor = MockNetworkMonitor()
        activityTracker = MockActivityTracker()

        let contextConfiguration = ClickstreamConfiguration.getDefaultConfiguration()
            .withAppId(testAppId + UUID().uuidString)
            .withEndpoint(testEndpoint)
            .withSendEventInterval(10_000)
            .withTrackAppExceptionEvents(true)
            .withCompressEvents(false)
        clickstream = try ClickstreamContext(with: contextConfiguration)
        clickstream.networkMonitor = mockNetworkMonitor
        sessionClient = SessionClient(activityTracker: activityTracker, clickstream: clickstream)
        clickstream.sessionClient = sessionClient
        eventRecorder = MockEventRecorder()
        let analyticsClient = try AnalyticsClient(
            clickstream: clickstream,
            eventRecorder: eventRecorder,
            sessionClient: sessionClient
        )
        clickstream.analyticsClient = analyticsClient

        autoRecordEventClient = sessionClient.autoRecordClient
    }

    override func tearDown() {
        eventRecorder = nil
        activityTracker = nil
        sessionClient = nil
        activityTracker?.resetCounters()
    }

    func testAppVersionUpdate() {
        autoRecordEventClient.checkAppVersionUpdate(clickstream: clickstream)
        XCTAssertNotNil(UserDefaultsUtil.getAppVersion(storage: clickstream.storage))
        clickstream.systemInfo.appVersion = "100.0.0"
        autoRecordEventClient.checkAppVersionUpdate(clickstream: clickstream)

        XCTAssertEqual("100.0.0", UserDefaultsUtil.getAppVersion(storage: clickstream.storage))
        XCTAssertTrue(eventRecorder.lastSavedEvent?.eventType == Event.PresetEvent.APP_UPDATE)
        XCTAssertNotNil(eventRecorder.lastSavedEvent?.attributes[Event.ReservedAttribute.PREVIOUS_APP_VERSION])

        autoRecordEventClient.checkAppVersionUpdate(clickstream: clickstream)
        XCTAssertNotNil(eventRecorder.saveCount == 1)
    }

    func testOSVersionUpdate() {
        autoRecordEventClient.checkOSVersionUpdate(clickstream: clickstream)
        XCTAssertNotNil(UserDefaultsUtil.getOSVersion(storage: clickstream.storage))
        clickstream.systemInfo.osVersion = "100.0.0"
        autoRecordEventClient.checkOSVersionUpdate(clickstream: clickstream)

        XCTAssertEqual("100.0.0", UserDefaultsUtil.getOSVersion(storage: clickstream.storage))
        XCTAssertTrue(eventRecorder.lastSavedEvent?.eventType == Event.PresetEvent.OS_UPDATE)
        XCTAssertNotNil(eventRecorder.lastSavedEvent?.attributes[Event.ReservedAttribute.PREVIOUS_OS_VERSION])

        autoRecordEventClient.checkOSVersionUpdate(clickstream: clickstream)
        XCTAssertNotNil(eventRecorder.saveCount == 1)
    }

    func testOneScreenView() {
        sessionClient.startActivityTracking()
        activityTracker.callback?(.runningInForeground)
        autoRecordEventClient.setIsEntrances()
        let viewController = MockViewControllerA()
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = viewController
        window.makeKeyAndVisible()
        XCTAssertTrue(viewController.viewDidAppearCalled)

        XCTAssertTrue(eventRecorder.saveCount == 4)
        XCTAssertEqual(eventRecorder.lastSavedEvent?.eventType, Event.PresetEvent.SCREEN_VIEW)
        XCTAssertNotNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.SCREEN_ID])
        XCTAssertNotNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.SCREEN_NAME])
        XCTAssertNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.ENGAGEMENT_TIMESTAMP])
        XCTAssertNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_ID])
        XCTAssertNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_NAME])
        XCTAssertNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_UNIQUEID])
        XCTAssertNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.PREVIOUS_TIMESTAMP])
        XCTAssertTrue(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.ENTRANCES] as! Int == 1)

        let screenUniqueId = eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.SCREEN_UNIQUEID] as! String
        XCTAssertNotNil(screenUniqueId)
        XCTAssertEqual(screenUniqueId, String(describing: viewController.hashValue))
    }

    func testTwoScreenViewWithoutUserEngagement() {
        autoRecordEventClient.setIsEntrances()
        let viewControllerA = MockViewControllerA()
        let viewControllerB = MockViewControllerB()
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = viewControllerA
        window.makeKeyAndVisible()
        Thread.sleep(forTimeInterval: 0.01)
        window.rootViewController = viewControllerB
        window.makeKeyAndVisible()
        XCTAssertTrue(viewControllerA.viewDidAppearCalled)
        XCTAssertTrue(viewControllerB.viewDidAppearCalled)
        XCTAssertEqual(2, eventRecorder.saveCount)
        XCTAssertTrue(eventRecorder.lastSavedEvent!.eventType == Event.PresetEvent.SCREEN_VIEW)
        XCTAssertTrue(eventRecorder.savedEvents[0].eventType == Event.PresetEvent.SCREEN_VIEW)
        XCTAssertNotNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.SCREEN_ID])
        XCTAssertNotNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.SCREEN_NAME])
        XCTAssertNil(eventRecorder.savedEvents[0].attributes[Event.ReservedAttribute.ENGAGEMENT_TIMESTAMP])
        XCTAssertNotNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.ENGAGEMENT_TIMESTAMP])
        XCTAssertTrue(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.ENGAGEMENT_TIMESTAMP]
            as! Int64 > 0)

        XCTAssertNotNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_ID])
        XCTAssertNotNil(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_NAME])

        XCTAssertEqual(eventRecorder.savedEvents[0].attributes[Event.ReservedAttribute.SCREEN_NAME] as! String,
                       eventRecorder.savedEvents[1].attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_NAME] as! String)

        XCTAssertEqual(eventRecorder.savedEvents[0].attributes[Event.ReservedAttribute.SCREEN_ID] as! String,
                       eventRecorder.savedEvents[1].attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_ID] as! String)

        XCTAssertEqual(eventRecorder.savedEvents[0].timestamp,
                       eventRecorder.savedEvents[1].attributes[Event.ReservedAttribute.PREVIOUS_TIMESTAMP] as! Int64)

        XCTAssertTrue(eventRecorder.lastSavedEvent!.attributes[Event.ReservedAttribute.ENTRANCES] as! Int == 0)
    }

    func testTwoScreenViewWithUserEngagement() {
        autoRecordEventClient.setIsEntrances()
        let viewControllerA = MockViewControllerA()
        let viewControllerB = MockViewControllerB()
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = viewControllerA
        window.makeKeyAndVisible()

        autoRecordEventClient.updateLastScreenStartTimestamp(Date().millisecondsSince1970 - 1_100)
        Thread.sleep(forTimeInterval: 0.02)
        window.rootViewController = viewControllerB
        window.makeKeyAndVisible()
        XCTAssertTrue(viewControllerA.viewDidAppearCalled)
        XCTAssertTrue(viewControllerB.viewDidAppearCalled)
        let event0 = eventRecorder.savedEvents[0]
        let engagementEvent = eventRecorder.savedEvents[1]
        XCTAssertEqual(Event.PresetEvent.SCREEN_VIEW, event0.eventType)

        XCTAssertEqual(event0.attributes[Event.ReservedAttribute.SCREEN_NAME] as! String, engagementEvent.attributes[Event.ReservedAttribute.SCREEN_NAME] as! String)
        XCTAssertEqual(event0.attributes[Event.ReservedAttribute.SCREEN_UNIQUEID] as! String, engagementEvent.attributes[Event.ReservedAttribute.SCREEN_UNIQUEID] as! String)
        XCTAssertNotNil(engagementEvent.attributes[Event.ReservedAttribute.ENGAGEMENT_TIMESTAMP])
    }

    func testTwoSameScreenView() {
        let screenId = "testScreenId"
        let screenName = "testScreenName"
        let screenHashValue = "testScreenHashValue"
        autoRecordEventClient.onViewDidAppear(screenName: screenName, screenPath: screenId, screenHashValue: screenHashValue)
        autoRecordEventClient.onViewDidAppear(screenName: screenName, screenPath: screenId, screenHashValue: screenHashValue)
        XCTAssertEqual(1, eventRecorder.savedEvents.count)
    }

    func testCloseRecordScreenView() {
        clickstream.configuration.isTrackScreenViewEvents = false
        autoRecordEventClient.setIsEntrances()
        let viewController = MockViewControllerA()
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = viewController
        window.makeKeyAndVisible()
        XCTAssertTrue(viewController.viewDidAppearCalled)
        XCTAssertTrue(eventRecorder.saveCount == 0)
    }

    func testCloseRecordUserEngagement() {
        clickstream.configuration.isTrackUserEngagementEvents = false
        let viewControllerA = MockViewControllerA()
        let viewControllerB = MockViewControllerB()
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = viewControllerA
        window.makeKeyAndVisible()
        autoRecordEventClient.updateLastScreenStartTimestamp(Date().millisecondsSince1970 - 1_100)
        window.rootViewController = viewControllerB
        window.makeKeyAndVisible()
        XCTAssertNotEqual(Event.PresetEvent.USER_ENGAGEMENT, eventRecorder.savedEvents[1].eventType)
    }

    func testRecordScreenViewManuallyWithoutScreenName() {
        let event = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        autoRecordEventClient.recordViewScreenManually(event)
        let savedEvent = eventRecorder.savedEvents[0]
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, savedEvent.eventType)
        XCTAssertEqual(Event.ErrorCode.SCREEN_VIEW_MISSING_SCREEN_NAME, savedEvent.attributes[Event.ReservedAttribute.ERROR_CODE] as! Int)
    }

    func testRecordScreenViewManuallyWithInvalidScreenName() {
        let event = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        event.addAttribute(123, forKey: ClickstreamAnalytics.Attr.SCREEN_NAME)
        autoRecordEventClient.recordViewScreenManually(event)
        let savedEvent = eventRecorder.savedEvents[0]
        XCTAssertEqual(Event.PresetEvent.CLICKSTREAM_ERROR, savedEvent.eventType)
        XCTAssertEqual(Event.ErrorCode.SCREEN_VIEW_MISSING_SCREEN_NAME, savedEvent.attributes[Event.ReservedAttribute.ERROR_CODE] as! Int)
    }

    func testRecordScreenViewManuallyWithScreenName() {
        let event = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        event.addAttribute("HomeView", forKey: ClickstreamAnalytics.Attr.SCREEN_NAME)
        autoRecordEventClient.recordViewScreenManually(event)
        let savedEvent = eventRecorder.savedEvents[0]
        XCTAssertEqual(Event.PresetEvent.SCREEN_VIEW, savedEvent.eventType)
    }

    func testRecordSameScreenViewTwiceManually() {
        let event = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        event.addAttribute("HomeView", forKey: ClickstreamAnalytics.Attr.SCREEN_NAME)
        autoRecordEventClient.recordViewScreenManually(event)
        autoRecordEventClient.recordViewScreenManually(event)
        let savedEvent = eventRecorder.savedEvents[0]
        XCTAssertEqual(Event.PresetEvent.SCREEN_VIEW, savedEvent.eventType)
        XCTAssertEqual(1, eventRecorder.savedEvents.count)
    }

    func testRecordTwoDifferentScreenViewManually() {
        let event = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        event.addAttribute("HomeView", forKey: ClickstreamAnalytics.Attr.SCREEN_NAME)
        autoRecordEventClient.recordViewScreenManually(event)
        let event2 = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        event2.addAttribute("HomeView2", forKey: ClickstreamAnalytics.Attr.SCREEN_NAME)
        autoRecordEventClient.recordViewScreenManually(event2)
        XCTAssertEqual(2, eventRecorder.savedEvents.count)
    }

    func testRecordCustomScreenViewBetweenTwoScreenView() {
        autoRecordEventClient.setIsEntrances()
        // auto record screen view for viewControllerA
        let viewControllerA = MockViewControllerA()
        let viewControllerB = MockViewControllerB()
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = viewControllerA
        window.makeKeyAndVisible()

        // recored custom screen view with user engagement
        autoRecordEventClient.updateLastScreenStartTimestamp(Date().millisecondsSince1970 - 1_100)
        Thread.sleep(forTimeInterval: 0.02)
        let event = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        event.addAttribute("SomeInnerView", forKey: ClickstreamAnalytics.Attr.SCREEN_NAME)
        event.addAttribute("abc123ef", forKey: ClickstreamAnalytics.Attr.SCREEN_UNIQUE_ID)
        autoRecordEventClient.recordViewScreenManually(event)

        // auto record screen view for viewControllerA with user engagement
        autoRecordEventClient.updateLastScreenStartTimestamp(Date().millisecondsSince1970 - 1_100)
        Thread.sleep(forTimeInterval: 0.02)
        window.rootViewController = viewControllerB
        window.makeKeyAndVisible()

        XCTAssertTrue(viewControllerA.viewDidAppearCalled)
        XCTAssertTrue(viewControllerB.viewDidAppearCalled)

        let screenViewEventA = eventRecorder.savedEvents[0]
        let engagementEvent1 = eventRecorder.savedEvents[1]
        let customScreenViewEvent = eventRecorder.savedEvents[2]
        let engagementEvent2 = eventRecorder.savedEvents[3]
        let screenViewEventB = eventRecorder.savedEvents[4]

        XCTAssertEqual(Event.PresetEvent.SCREEN_VIEW, screenViewEventA.eventType)
        XCTAssertEqual(Event.PresetEvent.USER_ENGAGEMENT, engagementEvent1.eventType)
        XCTAssertEqual(Event.PresetEvent.SCREEN_VIEW, customScreenViewEvent.eventType)
        XCTAssertEqual(Event.PresetEvent.USER_ENGAGEMENT, engagementEvent2.eventType)
        XCTAssertEqual(Event.PresetEvent.SCREEN_VIEW, screenViewEventB.eventType)

        XCTAssertEqual("SomeInnerView", screenViewEventB.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_NAME] as! String)
        XCTAssertEqual("abc123ef", screenViewEventB.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_UNIQUEID] as! String)

        XCTAssertNotNil(engagementEvent1.attributes[Event.ReservedAttribute.ENGAGEMENT_TIMESTAMP])
        XCTAssertNotNil(engagementEvent2.attributes[Event.ReservedAttribute.ENGAGEMENT_TIMESTAMP])
        XCTAssertEqual("SomeInnerView", engagementEvent2.attributes[Event.ReservedAttribute.SCREEN_NAME] as! String)
    }

    func testDisableSDKWillNotRecordScreenViewEvents() {
        clickstream.isEnable = false
        activityTracker.callback?(.runningInForeground)
        autoRecordEventClient.setIsEntrances()
        let viewController = MockViewControllerA()
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = viewController
        window.makeKeyAndVisible()
        XCTAssertTrue(eventRecorder.saveCount == 0)
    }

    func testRecordTwoScreenViewWhenAutoTrackIsDisabled() {
        clickstream.isEnable = false
        autoRecordEventClient.setIsEntrances()
        let event = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        event.addAttribute("HomeView1", forKey: ClickstreamAnalytics.Attr.SCREEN_NAME)
        event.addAttribute("HomeView1_UniqueId", forKey: ClickstreamAnalytics.Attr.SCREEN_UNIQUE_ID)
        autoRecordEventClient.recordViewScreenManually(event)

        autoRecordEventClient.updateLastScreenStartTimestamp(Date().millisecondsSince1970 - 1_100)
        let event2 = clickstream.analyticsClient.createEvent(withEventType: Event.PresetEvent.SCREEN_VIEW)
        event2.addAttribute("HomeView2", forKey: ClickstreamAnalytics.Attr.SCREEN_NAME)
        event2.addAttribute("HomeView2_UniqueId", forKey: ClickstreamAnalytics.Attr.SCREEN_UNIQUE_ID)
        autoRecordEventClient.recordViewScreenManually(event2)

        XCTAssertEqual(3, eventRecorder.savedEvents.count)
        let screenView1 = eventRecorder.savedEvents[0]
        let engagementEvent = eventRecorder.savedEvents[1]
        let screenView2 = eventRecorder.savedEvents[2]
        XCTAssertEqual(Event.PresetEvent.SCREEN_VIEW, screenView1.eventType)
        XCTAssertEqual(Event.PresetEvent.USER_ENGAGEMENT, engagementEvent.eventType)
        XCTAssertEqual(Event.PresetEvent.SCREEN_VIEW, screenView2.eventType)

        XCTAssertEqual("HomeView1", engagementEvent.attributes[Event.ReservedAttribute.SCREEN_NAME] as! String)
        XCTAssertEqual("HomeView1_UniqueId", engagementEvent.attributes[Event.ReservedAttribute.SCREEN_UNIQUEID] as! String)

        XCTAssertEqual("HomeView2", screenView2.attributes[Event.ReservedAttribute.SCREEN_NAME] as! String)
        XCTAssertEqual("HomeView2_UniqueId", screenView2.attributes[Event.ReservedAttribute.SCREEN_UNIQUEID] as! String)
        XCTAssertEqual("HomeView1", screenView2.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_NAME] as! String)
        XCTAssertEqual("HomeView1_UniqueId", screenView2.attributes[Event.ReservedAttribute.PREVIOUS_SCREEN_UNIQUEID] as! String)
    }
}
