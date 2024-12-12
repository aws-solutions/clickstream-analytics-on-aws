//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Foundation

class Session: Codable {
    let sessionId: String
    let startTime: Int64
    let sessionIndex: Int
    private(set) var pauseTime: Int64?
    var isRecorded = false

    init(uniqueId: String, sessionIndex: Int) {
        self.sessionId = Self.generateSessionId(uniqueId: uniqueId)
        self.startTime = Date().millisecondsSince1970
        self.pauseTime = nil
        self.sessionIndex = sessionIndex
    }

    init(sessionId: String, startTime: Int64, pauseTime: Int64, sessionIndex: Int) {
        self.sessionId = sessionId
        self.startTime = startTime
        self.pauseTime = pauseTime
        self.sessionIndex = sessionIndex
    }

    static func getCurrentSession(clickstream: ClickstreamContext, previousSession: Session? = nil) -> Session {
        var session = previousSession
        if session == nil {
            session = UserDefaultsUtil.getSession(storage: clickstream.storage)
        }
        if session != nil {
            if session!.isNewSession || Date().millisecondsSince1970 - session!.pauseTime!
                < clickstream.configuration.sessionTimeoutDuration
            {
                return session!
            } else {
                return Session(uniqueId: clickstream.userUniqueId, sessionIndex: session!.sessionIndex + 1)
            }
        } else {
            return Session(uniqueId: clickstream.userUniqueId, sessionIndex: 1)
        }
    }

    var isNewSession: Bool {
        pauseTime == nil
    }

    var duration: Date.Timestamp {
        Date().millisecondsSince1970 - startTime
    }

    func pause() {
        pauseTime = Date().millisecondsSince1970
    }

    private static func generateSessionId(uniqueId: String) -> String {
        let now = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.timeZone = TimeZone(abbreviation: Constants.defaultTimezone)
        dateFormatter.locale = Locale(identifier: Constants.defaultLocale)

        // Timestamp: Day
        dateFormatter.dateFormat = Constants.dateFormat
        let timestampDay = dateFormatter.string(from: now)

        // Timestamp: Time
        dateFormatter.dateFormat = Constants.timeFormat
        let timestampTime = dateFormatter.string(from: now)

        let uniqueIdKey = uniqueId.padding(toLength: Constants.maxUniqueIdLength,
                                           withPad: Constants.paddingChar,
                                           startingAt: 0)

        // Create Session ID formatted as <UniqueID> - <Day> - <Time>
        return "\(uniqueIdKey)-\(timestampDay)-\(timestampTime)"
    }
}

extension Session {
    enum Constants {
        static let maxUniqueIdLength = 8
        static let paddingChar = "_"
        static let defaultTimezone = "UTC"
        static let defaultLocale = "en_US"
        static let dateFormat = "yyyyMMdd"
        static let timeFormat = "HHmmssSSS"
    }
}
