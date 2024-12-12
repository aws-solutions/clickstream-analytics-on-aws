//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

protocol ClickstreamDBProtocol {
    /// Create the Event Table
    func createTable() throws

    /// Insert an Event into the Even table
    /// - Parameter bindings: a collection of values to insert into the Event
    func saveEvent(_ event: StorageEvent) throws

    /// Get the oldest event with limit
    /// - Parameter limit: The number of query result to limit
    /// - Returns: A collection of StorageEvent
    func getEventsWith(limit: Int) throws -> [StorageEvent]

    /// Delete the event in the Event table
    /// - Parameter eventId: The event id for the event to delete
    func deleteEvent(eventId: Int64) throws

    /// Deletes all the event where eventId is not larger than lastEventId.
    /// - Parameter lastEventId: The last eventId
    func deleteBatchEvents(lastEventId: Int64) throws

    /// Delete all events from the Event table
    func deleteAllEvents() throws

    /// Get total size of all events json
    /// - Returns: Total event size.
    func getTotalSize() throws -> Int64

    /// Get total number of event
    /// - Returns: Total event number
    func getEventCount() throws -> Int64
}
