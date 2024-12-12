//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Foundation
import Gzip

enum CompressUtil {
    /// compress String use gzip and return base64 encoded string
    /// - Parameter unZipString: unzip String
    /// - Returns: the result of compress string
    static func compressForGzip(unZipString: String) -> String? {
        guard let data = unZipString.data(using: .utf8) else { return nil }
        var result: String?
        do {
            let compressData = try data.gzipped()
            result = compressData.base64EncodedString()
        } catch {
            log.error("Gzipped fail for event json string")
        }
        return result
    }
}

extension CompressUtil: ClickstreamLogger {}
