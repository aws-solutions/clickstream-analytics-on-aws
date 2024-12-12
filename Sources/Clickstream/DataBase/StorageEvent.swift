//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import SQLite

class StorageEvent {
    let id: Int64?
    let eventJson: String
    let eventSize: Int64
    init(id: Int64? = nil, eventJson: String, eventSize: Int64) {
        self.id = id
        self.eventJson = eventJson
        self.eventSize = eventSize
    }

    var bingings: [Binding] {
        [eventJson, eventSize]
    }
}
