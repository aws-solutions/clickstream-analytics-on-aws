//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import SQLite

extension Statement {
    func asStorageEvents() -> [StorageEvent] {
        var result = [StorageEvent]()
        for element in self {
            guard let id = element[EventAttributeIndex.id] as? Int64,
                  let eventJson = element[EventAttributeIndex.eventJson] as? String,
                  let eventSize = element[EventAttributeIndex.eventSize] as? Int64
            else {
                continue
            }
            let event = StorageEvent(id: id, eventJson: eventJson, eventSize: eventSize)
            result.append(event)
        }
        return result
    }

    enum EventAttributeIndex {
        static let id = 0
        static let eventJson = 1
        static let eventSize = 2
    }
}
