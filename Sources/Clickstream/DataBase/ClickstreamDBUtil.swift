//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import SQLite

class ClickstreamDBUtil: ClickstreamDBProtocol {
    private let dbAdapter: BaseDBAdapter

    /// Initializer
    /// - Parameter dbAdapter: a BaseDBProtocol adapter
    init(dbAdapter: BaseDBAdapter) {
        self.dbAdapter = dbAdapter
    }

    /// Create the Event Table
    func createTable() throws {
        log.debug("Initializing event table")
        let createEventTableStatement = """
            CREATE TABLE IF NOT EXISTS Event (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            eventJson TEXT NOT NULL,
            eventSize INTEGER NOT NULL)
        """
        do {
            try dbAdapter.createTable(createEventTableStatement)
        } catch {
            log.error("Failed to create event table")
            throw StorageError.invalidOperation(causedBy: error)
        }
    }

    /// Save an StorageEvent to sqlite
    /// - Parameter event: the StorageEvent
    func saveEvent(_ event: StorageEvent) throws {
        let insertStatement = """
            INSERT INTO Event (eventJson, eventSize)
            VALUES (?, ?)
        """
        _ = try dbAdapter.executeQuery(insertStatement, event.bingings)
    }

    /// get oldest events with limit
    /// - Parameter limit: the limit for event number
    /// - Returns: the StorageEvent array
    func getEventsWith(limit: Int) throws -> [StorageEvent] {
        let queryStatement = """
        SELECT * FROM Event
        ORDER BY id ASC
        LIMIT ?
        """
        let rows = try dbAdapter.executeQuery(queryStatement, [limit])
        return rows.asStorageEvents()
    }

    func deleteEvent(eventId: Int64) throws {
        let deleteStatement = """
        DELETE FROM Event WHERE id = ?
        """
        _ = try dbAdapter.executeQuery(deleteStatement, [eventId])
    }

    func deleteBatchEvents(lastEventId: Int64) throws {
        let deleteBatchStatement = """
        DELETE FROM Event WHERE id <= ?
        """
        _ = try dbAdapter.executeQuery(deleteBatchStatement, [lastEventId])
    }

    func deleteAllEvents() throws {
        let deleteStatement = "DELETE FROM Event"
        _ = try dbAdapter.executeQuery(deleteStatement, [])
    }

    func getTotalSize() throws -> Int64 {
        let getTotalStatement = """
        SELECT SUM(eventSize) FROM Event
        """
        if let totalSize = try dbAdapter.executeQuery(getTotalStatement, []).scalar() as? Int64 {
            return totalSize
        } else {
            return 0
        }
    }

    func getEventCount() throws -> Int64 {
        let getEventCountStatement = """
        SELECT COUNT(*) FROM Event
        """
        if let totalCount = try dbAdapter.executeQuery(getEventCountStatement, []).scalar() as? Int64 {
            return totalCount
        } else {
            return 0
        }
    }
}

extension ClickstreamDBUtil: ClickstreamLogger {}
