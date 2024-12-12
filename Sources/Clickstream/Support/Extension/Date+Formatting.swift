//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Foundation

extension Date {
    typealias Timestamp = Int64

    var millisecondsSince1970: Int64 {
        Int64(timeIntervalSince1970 * 1_000)
    }
}
