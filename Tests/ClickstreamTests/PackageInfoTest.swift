//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class PackageInfoTest: XCTestCase {
    func testVersionNotNil() {
        let version = PackageInfo.version
        XCTAssertNotNil(version)
    }
}
