//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import Foundation

class MockEventRecorder: AnalyticsEventRecording {
    var saveCount = 0
    var lastSavedEvent: ClickstreamEvent?
    var savedEvents: [ClickstreamEvent] = []
    let semaphore = DispatchSemaphore(value: 1)

    func save(_ event: ClickstreamEvent) throws {
        semaphore.wait()
        saveCount += 1
        lastSavedEvent = event
        savedEvents.append(event)
        semaphore.signal()
    }

    var submitCount = 0
    func submitEvents(isBackgroundMode: Bool = false) {
        submitCount += 1
    }
}
