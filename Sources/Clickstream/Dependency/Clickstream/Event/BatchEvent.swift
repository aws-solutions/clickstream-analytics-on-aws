//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

class BatchEvent {
    let eventsJson: String
    let eventCount: Int
    let lastEventId: Int64
    init(eventsJson: String, eventCount: Int, lastEventId: Int64) {
        self.eventsJson = eventsJson
        self.eventCount = eventCount
        self.lastEventId = lastEventId
    }
}
