//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Foundation

class EventChecker {
    static var itemKeySet: Set<String> = []

    /// Check the event name whether valide
    /// - Parameter eventType: the event name
    /// - Returns: the EventError object
    static func checkEventType(eventType: String) -> EventError {
        let error = EventError()
        var errorMsg: String?
        if eventType.utf8.count > Event.Limit.MAX_EVENT_TYPE_LENGTH {
            errorMsg = """
            Event name is too long, the max event type length is \
            \(Event.Limit.MAX_EVENT_TYPE_LENGTH) characters. event name: \(eventType)
            """
            error.errorCode = Event.ErrorCode.EVENT_NAME_LENGTH_EXCEED
            error.errorMessage = getErrorMessage(errorMsg!)
        } else if !isValidName(name: eventType) {
            errorMsg = """
            Event name can only contains uppercase and lowercase letters, underscores, number,\
             and is not start with a number. event name: \(eventType)
            """
            error.errorCode = Event.ErrorCode.EVENT_NAME_INVALID
            error.errorMessage = getErrorMessage(errorMsg!)
        }
        if errorMsg != nil {
            log.warn(errorMsg!)
        }
        return error
    }

    /// Check the attribute error.
    /// - Parameters:
    ///   - currentNumber: current attribute number
    ///   - key: attribute key
    ///   - value: attribute value
    /// - Returns: the ErrorType
    static func checkAttribute(currentNumber: Int, key: String, value: AttributeValue) -> EventError {
        let error = EventError()
        var errorMsg: String?
        if currentNumber >= Event.Limit.MAX_NUM_OF_ATTRIBUTES {
            errorMsg = """
            reached the max number of attributes limit (\(Event.Limit.MAX_NUM_OF_ATTRIBUTES)).\
             and the attribute: \(key) will not be recorded
            """
            let errorString = "attribute name: \(key)"
            error.errorCode = Event.ErrorCode.ATTRIBUTE_SIZE_EXCEED
            error.errorMessage = getErrorMessage(errorString)
        } else if key.utf8.count > Event.Limit.MAX_LENGTH_OF_NAME {
            errorMsg = """
            attribute : \(key), reached the max length of attributes name limit(\(Event.Limit.MAX_LENGTH_OF_NAME).\
             current length is:(\(key.utf8.count)) and the attribute will not be recorded
            """
            let errorString = "attribute name length is:(\(key.utf8.count)) name is: \(key)"
            error.errorCode = Event.ErrorCode.ATTRIBUTE_NAME_LENGTH_EXCEED
            error.errorMessage = getErrorMessage(errorString)
        } else if !isValidName(name: key) {
            errorMsg = """
            attribute : \(key), was not valid, attribute name can only contains uppercase\
             and lowercase letters, underscores, number, and is not start with a number.\
             so the attribute will not be recorded
            """
            error.errorCode = Event.ErrorCode.ATTRIBUTE_NAME_INVALID
            error.errorMessage = getErrorMessage(key)
        } else if let value = value as? String {
            let valueLength = value.utf8.count
            if valueLength > Event.Limit.MAX_LENGTH_OF_VALUE {
                errorMsg = """
                attribute : \(key), reached the max length of attributes value limit\
                (\(Event.Limit.MAX_LENGTH_OF_VALUE)). current length is:(\(valueLength)).\
                 and the attribute will not be recorded, attribute value: \(value)
                """
                let errorString = "attribute name: \(key), attribute value: \(value)"
                error.errorCode = Event.ErrorCode.ATTRIBUTE_VALUE_LENGTH_EXCEED
                error.errorMessage = getErrorMessage(errorString)
            }
        } else if !checkFinite(value) {
            errorMsg = """
            the value for attribute : \(key), is infinite\
             and the attribute will not be recorded
            """
            let errorString = "the value for attribute name: \(key) is infinite"
            error.errorCode = Event.ErrorCode.ATTRIBUTE_VALUE_INFINITE
            error.errorMessage = getErrorMessage(errorString)
        }
        if errorMsg != nil {
            log.warn(errorMsg!)
        }
        return error
    }

    /// Check the Dboule or Decimal whether is finite
    /// - Parameters:
    ///   - value: attribute value
    /// - Returns: the isFinite boolean result
    static func checkFinite(_ value: Any) -> Bool {
        if let value = value as? Double, !value.isFinite {
            return false
        }
        if let value = value as? Decimal, !value.isFinite {
            return false
        }
        return true
    }

    /// Check the user attribute error.
    /// - Parameters:
    ///   - currentNumber: current attribute number
    ///   - key: attribute key
    ///   - value: attribute value
    /// - Returns: the ErrorType
    static func checkUserAttribute(currentNumber: Int, key: String, value: AttributeValue) -> EventError {
        let error = EventError()
        var errorMsg: String?
        if currentNumber >= Event.Limit.MAX_NUM_OF_USER_ATTRIBUTES {
            errorMsg = """
            reached the max number of user attributes limit (\(Event.Limit.MAX_NUM_OF_USER_ATTRIBUTES)).\
             and the user attribute: \(key) will not be recorded
            """
            let errorString = "attribute name: \(key)"
            error.errorCode = Event.ErrorCode.USER_ATTRIBUTE_SIZE_EXCEED
            error.errorMessage = getErrorMessage(errorString)
        } else if key.utf8.count > Event.Limit.MAX_LENGTH_OF_NAME {
            errorMsg = """
            user attribute : \(key), reached the max length of attributes name limit\
            (\(Event.Limit.MAX_LENGTH_OF_NAME). current length is:(\(key.utf8.count))\
             and the attribute will not be recorded
            """
            let errorString = "user attribute name length is:(\(key.utf8.count)) name is: \(key)"
            error.errorCode = Event.ErrorCode.USER_ATTRIBUTE_NAME_LENGTH_EXCEED
            error.errorMessage = getErrorMessage(errorString)
        }
        if !isValidName(name: key) {
            errorMsg = """
            user attribute : \(key), was not valid, user attribute name can only contains uppercase\
             and lowercase letters, underscores, number, and is not start with a number.\
             so the attribute will not be recorded
            """
            error.errorCode = Event.ErrorCode.USER_ATTRIBUTE_NAME_INVALID
            error.errorMessage = getErrorMessage(key)
        } else if let value = value as? String {
            let valueLength = value.utf8.count
            if valueLength > Event.Limit.MAX_LENGTH_OF_USER_VALUE {
                errorMsg = """
                user attribute : \(key), reached the max length of attributes value limit\
                 (\(Event.Limit.MAX_LENGTH_OF_USER_VALUE)). current length is:(\(valueLength)).\
                 and the attribute will not be recorded, attribute value: \(value)
                """
                let errrorString = "attribute name: \(key), attribute value: \(value)"
                error.errorCode = Event.ErrorCode.USER_ATTRIBUTE_VALUE_LENGTH_EXCEED
                error.errorMessage = getErrorMessage(errrorString)
            }
        }
        if errorMsg != nil {
            log.warn(errorMsg!)
        }
        return error
    }

    /// Verify the string whether only contains number, uppercase and lowercase letters,
    /// underscores, and is not start with a number
    /// - Parameter name: the name to verify
    /// - Returns: the name is valid.
    static func isValidName(name: String) -> Bool {
        let regex = try? NSRegularExpression(pattern: "^(?![0-9])[0-9a-zA-Z_]+$")
        let range = NSRange(location: 0, length: name.utf8.count)
        let matches = regex?.matches(in: name, range: range)
        if matches != nil {
            return !matches!.isEmpty
        } else {
            return false
        }
    }

    /// Check the items attribute error.
    /// - Parameters:
    ///   - currentNumber: current item number
    ///   - item: the object of item
    /// - Returns: the ErrorType and result item
    static func checkItem(currentNumber: Int, item: ClickstreamAttribute) ->
        (eventError: EventError, resultItem: ClickstreamAttribute)
    {
        initItemKeySet()
        var resultItem: ClickstreamAttribute = [:]
        if currentNumber >= Event.Limit.MAX_NUM_OF_ITEMS {
            let itemJsonString = (item as JsonObject).toJsonString()
            let errorMsg = """
            reached the max number of items limit \(Event.Limit.MAX_NUM_OF_ITEMS).
             and the item: \(itemJsonString) will not be recorded
            """
            log.warn(errorMsg)
            return (EventError(errorCode: Event.ErrorCode.ITEM_SIZE_EXCEED,
                               errorMessage: getErrorMessage(errorMsg)), resultItem)
        }
        var customKeyNumber = 0
        let error = EventError()
        var errorMsg: String?
        for (key, value) in item {
            let valueString = String(describing: value)
            if !itemKeySet.contains(key) {
                customKeyNumber += 1
                if customKeyNumber > Event.Limit.MAX_NUM_OF_CUSTOM_ITEM_ATTRIBUTE {
                    errorMsg = """
                    reached the max number of custom item attributes limit (
                    \(Event.Limit.MAX_NUM_OF_CUSTOM_ITEM_ATTRIBUTE) ). and the custom item attribute:
                    \(key) will not be recorded
                    """
                    error.errorCode = Event.ErrorCode.ITEM_CUSTOM_ATTRIBUTE_SIZE_EXCEED
                    error.errorMessage = getErrorMessage("item attribute key: \(key)")
                } else if key.utf8.count > Event.Limit.MAX_LENGTH_OF_NAME {
                    errorMsg = """
                    item attribute key: \(key), reached the max length of item attributes key limit(
                    \(Event.Limit.MAX_LENGTH_OF_NAME)). current length is:(\(key.utf8.count))
                    and the item attribute will not be recorded"
                    """
                    let errorString = "item attribute key length is: (\(key.utf8.count)), key is:\(key)"
                    error.errorCode = Event.ErrorCode.ITEM_CUSTOM_ATTRIBUTE_KEY_LENGTH_EXCEED
                    error.errorMessage = getErrorMessage(errorString)
                } else if !isValidName(name: key) {
                    errorMsg = """
                    item attribute key: \(key) was not valid, item attribute key can only contains
                    uppercase and lowercase letters, underscores, number, and is not start with a number.
                    so the item attribute will not be recorded
                    """
                    error.errorCode = Event.ErrorCode.ITEM_CUSTOM_ATTRIBUTE_KEY_INVALID
                    error.errorMessage = getErrorMessage(key)
                }
            }
            if error.errorCode == Event.ErrorCode.NO_ERROR,
               valueString.utf8.count > Event.Limit.MAX_LENGTH_OF_ITEM_VALUE
            {
                errorMsg = """
                item attribute : \(key), reached the max length of item attribute value limit (
                \(Event.Limit.MAX_LENGTH_OF_ITEM_VALUE). current length is: (\(valueString.utf8.count))
                . and the item attribute will not be recorded, attribute value: \(valueString)
                """
                let errorString = "item attribute name: \(key), item attribute value: \(valueString)"
                error.errorCode = Event.ErrorCode.ITEM_ATTRIBUTE_VALUE_LENGTH_EXCEED
                error.errorMessage = getErrorMessage(errorString)
            }
            if error.errorCode > 0 {
                break
            }
            if let value = value as? Double {
                resultItem[key] = Decimal(string: String(value))
            } else {
                resultItem[key] = value
            }
        }
        if errorMsg != nil {
            log.warn(errorMsg!)
        }
        return (error, resultItem)
    }

    static func getErrorMessage(_ errorMsg: String) -> String {
        "\(errorMsg.prefix(Event.Limit.MAX_LENGTH_OF_ERROR_VALUE))"
    }

    class EventError {
        var errorCode = Event.ErrorCode.NO_ERROR
        var errorMessage = ""
        init() {}
        init(errorCode: Int, errorMessage: String) {
            self.errorCode = errorCode
            self.errorMessage = errorMessage
        }
    }

    static func initItemKeySet() {
        if itemKeySet.isEmpty {
            itemKeySet = Set<String>([
                ClickstreamAnalytics.Item.ITEM_ID,
                ClickstreamAnalytics.Item.ITEM_NAME,
                ClickstreamAnalytics.Item.LOCATION_ID,
                ClickstreamAnalytics.Item.ITEM_BRAND,
                ClickstreamAnalytics.Item.CURRENCY,
                ClickstreamAnalytics.Item.PRICE,
                ClickstreamAnalytics.Item.QUANTITY,
                ClickstreamAnalytics.Item.CREATIVE_NAME,
                ClickstreamAnalytics.Item.CREATIVE_SLOT,
                ClickstreamAnalytics.Item.ITEM_CATEGORY,
                ClickstreamAnalytics.Item.ITEM_CATEGORY2,
                ClickstreamAnalytics.Item.ITEM_CATEGORY3,
                ClickstreamAnalytics.Item.ITEM_CATEGORY4,
                ClickstreamAnalytics.Item.ITEM_CATEGORY5
            ])
        }
    }
}

extension EventChecker: ClickstreamLogger {}
