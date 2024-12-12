//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation
import SQLite

/// Local storage adapter that implements local storage using SQLite.swift
final class BaseDBAdapter: BaseDBProtocol {
    private var connection: Connection?
    private let dbFilePath: URL

    /// Initializer
    /// - Parameters
    ///     - prefixPath: A prefix to be used for the database path. Defaults to none.
    ///     - databaseName: The database name
    ///     - fileManager: A FileManagerBehaviour instance to interact with the disk. Defaults to FileManager.default
    init(prefixPath: String = "",
         databaseName: String) throws
    {
        let fileManager = FileManager.default
        let dbDirectoryPath = try Self.getTmpPath()
            .appendingPathComponent(prefixPath)
        var dbFilePath = dbDirectoryPath.appendingPathComponent(databaseName)
        if !fileManager.fileExists(atPath: dbDirectoryPath.path) {
            try fileManager.createDirectory(atPath: dbDirectoryPath.path,
                                            withIntermediateDirectories: true)
        }

        let connection: Connection
        do {
            connection = try Connection(dbFilePath.path)
            var urlResourceValues = URLResourceValues()
            urlResourceValues.isExcludedFromBackup = true
            try dbFilePath.setResourceValues(urlResourceValues)
        } catch {
            throw StorageError.invalidStorage(path: dbFilePath.absoluteString, error)
        }

        self.connection = connection
        self.dbFilePath = dbFilePath
        try initializeDatabase(connection: connection)
    }

    /// Initilizes the database and create the table if it doesn't already exists
    /// - Parameter connection: SQLite connection
    private func initializeDatabase(connection: Connection) throws {
        log.debug("Initializing database connection")
        let databaseInitializationStatement = """
        pragma auto_vacuum = full;
        pragma encoding = "utf-8";
        """
        try connection.execute(databaseInitializationStatement)
    }

    /// Get document path
    /// - Parameter fileManager: The FileManagerBehaviour instance used to interact with the disk
    /// - Returns: Optional URL to the Document path
    private static func getTmpPath() throws -> URL {
        guard let tmpUrl = URL(string: NSTemporaryDirectory()) else {
            throw StorageError.fileSystemError(description: "Could not create the database at tmp directory")
        }
        return tmpUrl
    }

    /// Create a SQL table
    /// - Parameter statement: SQL statement to create a table
    func createTable(_ statement: String) throws {
        guard let connection else {
            throw StorageError.missingConnection
        }

        do {
            try connection.execute(statement)
        } catch {
            throw StorageError.invalidOperation(causedBy: error)
        }
    }

    /// Executes a SQL query
    /// - Parameters:
    ///   - statement: SQL query statement
    ///   - bindings: A collection of SQL bindings to prepare with the query statement
    /// - Returns: A SQL statement result from the query
    func executeQuery(_ statement: String, _ bindings: [Binding?]) throws -> Statement {
        guard let connection else {
            throw StorageError.missingConnection
        }

        do {
            let statement = try connection.prepare(statement).run(bindings)
            return statement
        } catch {
            throw StorageError.invalidOperation(causedBy: error)
        }
    }
}

extension BaseDBAdapter: ClickstreamLogger {}
