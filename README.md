# AWS Solution Clickstream Analytics SDK for Swift

## Introduction

Clickstream Swift SDK can help you easily collect and report in-app events from iOS devices to AWS. This SDK is part of an AWS solution - [Clickstream Analytics on AWS](https://github.com/awslabs/clickstream-analytics-on-aws), which provisions data pipeline to ingest and process event data into AWS services such as S3, Redshift.

The SDK relies on the Amplify for Swift Core Library and is developed according to the Amplify Swift SDK plug-in specification. In addition, we've added features that automatically collect common user events and attributes (e.g., screen view, first open) to simplify data collection for users.

Visit our [Documentation site](https://awslabs.github.io/clickstream-analytics-on-aws/en/latest/sdk-manual/swift/) and to learn more about Clickstream Swift SDK.

### Platform Support
    
The Clickstream SDK supports iOS 13+.

[**API Documentation**](https://awslabs.github.io/clickstream-swift/) 

- [Objective-C API Reference](https://awslabs.github.io/clickstream-swift/Classes/ClickstreamObjc.html)

## Integrate SDK

Clickstream requires Xcode 13.4 or higher to build.

### 1.Add Package

We use **Swift Package Manager** to distribute Clickstream Swift SDK, open your project in Xcode and select **File > Add Packages**.

![](images/add_package.png)

Enter the Clickstream Library for Swift GitHub repo URL (`https://github.com/awslabs/clickstream-swift`) into the search bar, you'll see the Clickstream Library for Swift repository rules for which version of Clickstream you want Swift Package Manager to install. Choose **Up to Next Major Version**, then click **Add Package**, make the Clickstream product checked as default, and click **Add Package** again.

![](images/add_package_url.png)

### 2.Parameter configuration

Downlod your `amplifyconfiguration.json` file from your Clickstream solution control plane, and paste it to your project root folder:

![](images/add_amplify_config_json_file.png)

the json file will be as follows:

```json
{
  "analytics": {
    "plugins": {
      "awsClickstreamPlugin ": {
        "appId": "appId",
        "endpoint": "https://example.com/collect",
        "isCompressEvents": true,
        "autoFlushEventsInterval": 10000,
        "isTrackAppExceptionEvents": false
      }
    }
  }
}
```

Your `appId` and `endpoint` are already set up in it, here's an explanation of each property:

- **appId**: the app id of your project in control plane.
- **endpoint**: the endpoint url you will upload the event to AWS server.
- **isCompressEvents**: whether to compress event content when uploading events, default is `true`
- **autoFlushEventsInterval**: event sending interval, the default is `10s`
- **isTrackAppExceptionEvents**: whether auto track exception event in app, default is `false`

### 3.Initialize the SDK

Once you have configured the parameters, you need to initialize it in your app delegate's `application(_:didFinishLaunchingWithOptions:)` lifecycle method:

#### 3.1 Initialize the SDK with default configuration
```swift
import Clickstream
...
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    do {
        try ClickstreamAnalytics.initSDK()
    } catch {
        assertionFailure("Fail to initialize ClickstreamAnalytics: \(error)")
    }
    return true
}
```

#### 3.2 Initialize the SDK with global attributes and custom configuration

The following example code shows how to add traffic source fields as global attributes when initializing the SDK.

```swift
import Clickstream
...
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    do {
        let configuration = ClickstreamConfiguration()
            .withAppId("your appId")
            .withEndpoint("https://example.com/collect")
            .withLogEvents(true)
            .withInitialGlobalAttributes([
                ClickstreamAnalytics.Attr.TRAFFIC_SOURCE_SOURCE: "amazon",
                ClickstreamAnalytics.Attr.TRAFFIC_SOURCE_MEDIUM: "cpc",
                ClickstreamAnalytics.Attr.TRAFFIC_SOURCE_CAMPAIGN: "summer_promotion",
                ClickstreamAnalytics.Attr.TRAFFIC_SOURCE_CAMPAIGN_ID: "summer_promotion_01",
                ClickstreamAnalytics.Attr.TRAFFIC_SOURCE_TERM: "running_shoes",
                ClickstreamAnalytics.Attr.TRAFFIC_SOURCE_CONTENT: "banner_ad_1",
                ClickstreamAnalytics.Attr.TRAFFIC_SOURCE_CLID: "amazon_ad_123",
                ClickstreamAnalytics.Attr.TRAFFIC_SOURCE_CLID_PLATFORM: "amazon_ads",
                ClickstreamAnalytics.Attr.APP_INSTALL_CHANNEL: "App Store"
            ])
        try ClickstreamAnalytics.initSDK(configuration)
    } catch {
        assertionFailure("Fail to initialize ClickstreamAnalytics: \(error)")
    }
    return true
}
```

By default, we will use the configurations in `amplifyconfiguration.json` file. If you add a custom configuration, the added configuration items will override the default values. 

You can also add all the configuration parameters you need in the `initSDK` method without using the `amplifyconfiguration.json` file.

#### 3.3 SwiftUI configuration
If your project is developed with SwiftUI, you need to create an application delegate and attach it to your `App` through `UIApplicationDelegateAdaptor`. 

```swift
@main
struct YourApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    var body: some Scene {
        WindowGroup {
            YourView()
        }
    }
}
```

Clickstream Swift SDK depends on method swizzling to automatically record screen views. SwiftUI apps must [record screen view events manually](#record-screen-view-events-manually), and disable automatic tracking of screen view events by setting `configuration.withTrackScreenViewEvents(false)` when the SDK is initialized.

### 4. Update Configuration

```swift
import Clickstream

// configure the sdk after initialize.
do {
    let configuration = try ClickstreamAnalytics.getClickstreamConfiguration()
    configuration.withAppId("your appId")
        .withEndpoint("https://example.com/collect")
        .withLogEvents(true)
        .withCompressEvents(true)
        .withSessionTimeoutDuration(1800000)
        .withTrackAppExceptionEvents(true)
        .withTrackScreenViewEvents(true)
        .withTrackUserEngagementEvents(true)
} catch {
    print("Failed to config ClickstreamAnalytics: \(error)")
}
```

> note: this configuation will override the default configuation in `amplifyconfiguration.json` file

### Start using

#### Recored event.

Add the following code where you need to complete the event report.

```swift
import Clickstream

let attributes: ClickstreamAttribute = [
    "Channel": "apple",
    "Successful": true,
    "ProcessDuration": 12.33,
    "UserAge": 20,
]
ClickstreamAnalytics.recordEvent("testEvent", attributes)

// for record an event with event name
ClickstreamAnalytics.recordEvent("button_click")
```

#### Record event with items

You can add the following code to log an event with an item.

**Note: Only pipelines from version 1.1+ can handle items with custom attribute.**

```swift
import Clickstream

let attributes: ClickstreamAttribute = [
    ClickstreamAnalytics.Item.ITEM_ID: "123",
    ClickstreamAnalytics.Item.CURRENCY: "USD",
    "event_category": "recommended"
]

let item_book: ClickstreamAttribute = [
    ClickstreamAnalytics.Item.ITEM_ID: 123,
    ClickstreamAnalytics.Item.ITEM_NAME: "Nature",
    ClickstreamAnalytics.Item.ITEM_CATEGORY: "book",
    ClickstreamAnalytics.Item.PRICE: 99.9,
    "book_publisher": "Nature Research"
]
ClickstreamAnalytics.recordEvent("view_item", attributes, [item_book])
```

#### Record Screen View events manually

By default, SDK will automatically track the preset `_screen_view` event when ViewController triggers `viewDidAppear`.

You can also manually record screen view events whether or not automatic screen view tracking is enabled, add the following code to record a screen view event with two attributes.

* `SCREEN_NAME` Required. Your screen's name.
* `SCREEN_UNIQUE_ID` Optional. Set the hashValue of your ViewController or UIView. If you do not set, SDK will set a default value based on the current ViewController's hashValue.

```swift
import Clickstream

ClickstreamAnalytics.recordEvent(ClickstreamAnalytics.EventName.SCREEN_VIEW, [
    ClickstreamAnalytics.Attr.SCREEN_NAME: "HomeView",
    ClickstreamAnalytics.Attr.SCREEN_UNIQUE_ID: homeView.hashValue
])
```

#### Add global attribute

```swift
import Clickstream

let globalAttribute: ClickstreamAttribute = [
    ClickstreamAnalytics.Attr.APP_INSTALL_CHANNEL: "apple",
    "class": 6,
    "level": 5.1,
    "isOpenNotification": true,
]
ClickstreamAnalytics.addGlobalAttributes(globalAttribute)

// for delete an global attribute
ClickstreamAnalytics.deleteGlobalAttributes("level")
```

#### Login and logout

```swift
import Clickstream

// when user login usccess.
ClickstreamAnalytics.setUserId("userId")

// when user logout
ClickstreamAnalytics.setUserId(nil)
```

When we log into another user, we will clear the before user's user attributes, after `setUserId()` you need to add new user's attribute.

#### Add user attribute

```swift
import Clickstream

let userAttributes : ClickstreamAttribute=[
    "_user_age": 21,
    "_user_name": "carl"
]
ClickstreamAnalytics.addUserAttributes(userAttributes)
```

Current login user‘s attributes will be cached in disk, so the next time app launch you don't need to set all user's attribute again, of course you can update the current user's attribute when it changes.

#### Log the event json in debug mode

```swift
import Clickstream

// log the event in debug mode.
do {
    var configuration = try ClickstreamAnalytics.getClickstreamConfiguration()
    configuration.isLogEvents = true
} catch {
    print("Failed to config ClickstreamAnalytics: \(error)")
}
```

After config `configuration.isLogEvents = true` and when you record an event, you can see the event json at your Xcode log pannel by filter `EventRecorder`.

#### Send event immediately

```swift
import Clickstream
// for send event immediately.
ClickstreamAnalytics.flushEvents()
```

#### Disable SDK

You can disable the SDK in the scenario you need. After disabling the SDK, the SDK will not handle the logging and sending of any events. Of course you can enable the SDK when you need to continue logging events.

```swift
import Clickstream

// disable SDK
ClickstreamAnalytics.disable()

// enable SDK
ClickstreamAnalytics.enable()
```

## How to build & test locally

### Config your code format

Install [swiftformat plugin](https://github.com/nicklockwood/SwiftFormat#xcode-source-editor-extension) in your Xcode, and config shortcut for code format.

### Config your code lint

Install [swiftlint](https://github.com/realm/SwiftLint), and execute the below command at the project root folder:

```bash
swiftlint
```

### Build

Open an termial window, at the root project folder to execute: 

```bash
swift build
```

### Test

```bash
swift test
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under [Apache 2.0 License](./LICENSE).

## Anonymous operational metrics

This solution collects anonymous operational metrics to help AWS improve the quality and features of the solution. For more information, including how to disable this capability, please see the [implementation guide](https://docs.aws.amazon.com/solutions/latest/clickstream-analytics-on-aws/solution-overview.html).
