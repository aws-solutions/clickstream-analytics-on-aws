//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import XCTest

class CompressUtilTest: XCTestCase {
    func testCompressEmptyString() {
        let result = CompressUtil.compressForGzip(unZipString: "")
        XCTAssertEqual("", result)
    }

    func testCompressNormalString() {
        let normalString = "Hellow compress gzip!"
        let result = CompressUtil.compressForGzip(unZipString: normalString)
        XCTAssertNotNil(result)
        XCTAssertTrue(!result!.isEmpty)
    }

    func testCompressJsonSuccess() throws {
        let normalString = "[{\"test\":\"testValue\"},{}]"
        let result = CompressUtil.compressForGzip(unZipString: normalString)
        XCTAssertNotNil(result)
        XCTAssertTrue(!result!.isEmpty)
    }
}
