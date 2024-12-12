//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation

enum Event {
    enum ReservedAttribute {
        static let USER_ID = "_user_id"
        static let USER_FIRST_TOUCH_TIMESTAMP = "_user_first_touch_timestamp"
        static let PREVIOUS_APP_VERSION = "_previous_app_version"
        static let PREVIOUS_OS_VERSION = "_previous_os_version"
        static let ENGAGEMENT_TIMESTAMP = "_engagement_time_msec"
        static let ENTRANCES = "_entrances"
        static let PREVIOUS_SCREEN_ID = "_previous_screen_id"
        static let PREVIOUS_SCREEN_NAME = "_previous_screen_name"
        static let PREVIOUS_SCREEN_UNIQUEID = "_previous_screen_unique_id"
        static let PREVIOUS_TIMESTAMP = "_previous_timestamp"
        static let SCREEN_ID = "_screen_id"
        static let SCREEN_NAME = "_screen_name"
        static let SCREEN_UNIQUEID = "_screen_unique_id"
        static let IS_FIRST_TIME = "_is_first_time"
        static let EXCEPTION_NAME = "_exception_name"
        static let EXCEPTION_REASON = "_exception_reason"
        static let EXCEPTION_STACK = "_excepiton_stack"
        static let ERROR_CODE = "_error_code"
        static let ERROR_MESSAGE = "_error_message"
    }

    enum User {
        static let USER_ID_NIL = "_clickstream_user_id_nil"
        static let USER_ID_EMPTY = "_clickstream_user_id_empty"
    }

    enum Limit {
        /// max event type length
        static let MAX_EVENT_TYPE_LENGTH = 50

        /// max limit of single event attribute number.
        static let MAX_NUM_OF_ATTRIBUTES = 500

        /// max limit of single event user attribute number.
        static let MAX_NUM_OF_USER_ATTRIBUTES = 100

        /// max limit of attribute name character length.
        static let MAX_LENGTH_OF_NAME = 50

        /// max limit of attribute value character length.
        static let MAX_LENGTH_OF_VALUE = 1_024

        /// max limit of user attribute value character length.
        static let MAX_LENGTH_OF_USER_VALUE = 256

        /// max limit of item attribute value character length.
        static let MAX_LENGTH_OF_ITEM_VALUE = 256

        /// max limit of one batch event number.
        static let MAX_EVENT_NUMBER_OF_BATCH = 100

        /// max limit of error attribute value length.
        static let MAX_LENGTH_OF_ERROR_VALUE = 256

        /// max limit of item number in one event.
        static let MAX_NUM_OF_ITEMS = 100

        /// max limit of item custom attribute number in one item.
        static let MAX_NUM_OF_CUSTOM_ITEM_ATTRIBUTE = 10
    }

    enum PresetEvent {
        static let SESSION_START = "_session_start"
        static let PROFILE_SET = "_profile_set"
        static let APP_UPDATE = "_app_update"
        static let OS_UPDATE = "_os_update"
        static let FIRST_OPEN = "_first_open"
        static let USER_ENGAGEMENT = "_user_engagement"
        static let SCREEN_VIEW = "_screen_view"
        static let APP_START = "_app_start"
        static let APP_END = "_app_end"
        static let APP_EXCEPTION = "_app_exception"
        static let CLICKSTREAM_ERROR = "_clickstream_error"
    }

    enum ErrorCode {
        static let NO_ERROR = 0
        static let EVENT_NAME_INVALID = 1_001
        static let EVENT_NAME_LENGTH_EXCEED = 1_002
        static let ATTRIBUTE_NAME_LENGTH_EXCEED = 2_001
        static let ATTRIBUTE_NAME_INVALID = 2_002
        static let ATTRIBUTE_VALUE_LENGTH_EXCEED = 2_003
        static let ATTRIBUTE_SIZE_EXCEED = 2_004
        static let ATTRIBUTE_VALUE_INFINITE = 2_005
        static let USER_ATTRIBUTE_SIZE_EXCEED = 3_001
        static let USER_ATTRIBUTE_NAME_LENGTH_EXCEED = 3_002
        static let USER_ATTRIBUTE_NAME_INVALID = 3_003
        static let USER_ATTRIBUTE_VALUE_LENGTH_EXCEED = 3_004
        static let ITEM_SIZE_EXCEED = 4_001
        static let ITEM_ATTRIBUTE_VALUE_LENGTH_EXCEED = 4_002
        static let ITEM_CUSTOM_ATTRIBUTE_SIZE_EXCEED = 4_003
        static let ITEM_CUSTOM_ATTRIBUTE_KEY_LENGTH_EXCEED = 4_004
        static let ITEM_CUSTOM_ATTRIBUTE_KEY_INVALID = 4_005
        static let SCREEN_VIEW_MISSING_SCREEN_NAME = 5_001
    }
}
