//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

@testable import Clickstream
import Foundation

class MockNetworkMonitor: NetworkMonitor {
    var isOnline = true
    var netWorkType = "Mobile"
    func startMonitoring(using queue: DispatchQueue) {}
    func stopMonitoring() {}
}
