//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

extension AWSClickstreamPlugin {
    func reset() {
        if clickstream != nil {
            clickstream = nil
        }

        if autoFlushEventsTimer != nil {
            autoFlushEventsTimer?.setEventHandler {}
            autoFlushEventsTimer?.cancel()
            autoFlushEventsTimer = nil
        }

        if isEnabled != nil {
            isEnabled = false
        }

        if networkMonitor != nil {
            networkMonitor.stopMonitoring()
            networkMonitor = nil
        }
    }
}
