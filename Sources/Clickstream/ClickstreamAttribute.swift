//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation

/// the attribute for Clickstream which support String, Int, Int64, Double and Bool
public typealias ClickstreamAttribute = AnalyticsProperties

typealias AttributeValue = AnalyticsPropertyValue
/// for support Int64 attribute value
extension Int64: AnalyticsPropertyValue {}
extension Decimal: AnalyticsPropertyValue {}

struct BaseClickstreamEvent: AnalyticsEvent {
    var properties: AnalyticsProperties?

    /// The name of the event
    var name: String

    /// Properties of the event
    var attribute: ClickstreamAttribute?

    /// Items of the event
    var items: [ClickstreamAttribute]?

    /// Initializer
    /// - Parameters:
    ///   - name: The name of the event
    ///   - attribute: Attribute of the event
    init(name: String,
         attribute: ClickstreamAttribute? = nil,
         items: [ClickstreamAttribute]? = nil)
    {
        self.name = name
        self.attribute = attribute
        self.items = items
    }
}
