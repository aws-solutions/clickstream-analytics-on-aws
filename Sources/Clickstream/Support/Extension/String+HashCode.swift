//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import CryptoKit
import Foundation

extension String {
    func hashCode() -> String {
        if let data = data(using: .utf8) {
            let hashed = SHA256.hash(data: data)
            let hashString = hashed.compactMap { String(format: "%02x", $0) }.joined()
            return String(hashString.prefix(8))
        }
        return ""
    }
}

extension String? {
    func isNilOrEmpty() -> Bool {
        self?.isEmpty ?? true
    }
}
