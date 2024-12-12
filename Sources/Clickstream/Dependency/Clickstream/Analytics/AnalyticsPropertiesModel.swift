//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

protocol AnalyticsPropertiesModel {
    func addAttribute(_ attribute: AttributeValue, forKey key: String)
    func addItem(_ item: ClickstreamAttribute)
}

extension AnalyticsPropertiesModel {
    func addAttribute(_ properties: [String: AttributeValue]) {
        for (key, value) in properties {
            addAttribute(value, forKey: key)
        }
    }

    func addItems(_ items: [ClickstreamAttribute]) {
        for item in items {
            addItem(item)
        }
    }
}
