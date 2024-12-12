//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation
#if canImport(UIKit)
    import UIKit
#else
    import AppKit
#endif

enum ActivityEvent {
    case applicationDidMoveToBackground
    case applicationWillMoveToForeground
    case applicationWillTerminate
}

enum ApplicationState {
    case initializing
    case runningInForeground
    case runningInBackground
    case terminated

    enum Resolver {
        static func resolve(currentState: ApplicationState, event: ActivityEvent) -> ApplicationState {
            if case .terminated = currentState {
                log.warn("Unexpected state transition. Received event \(event) in \(currentState) state.")
                return currentState
            }

            switch event {
            case .applicationWillTerminate:
                return .terminated
            case .applicationDidMoveToBackground:
                return .runningInBackground
            case .applicationWillMoveToForeground:
                return .runningInForeground
            }
        }
    }
}

extension ApplicationState: Equatable {}

extension ApplicationState: ClickstreamLogger {}

protocol ActivityTrackerBehaviour {
    func beginActivityTracking(_ listener: @escaping (ApplicationState) -> Void)
}

class ActivityTracker: ActivityTrackerBehaviour {
    private let stateMachine: StateMachine<ApplicationState, ActivityEvent>
    private var stateMachineSubscriberToken: StateMachineSubscriberToken?

    private static let applicationDidMoveToBackground: Notification.Name = {
        #if canImport(UIKit)
            UIApplication.didEnterBackgroundNotification
        #else
            NSApplication.didResignActiveNotification
        #endif
    }()

    private static let applicationWillMoveToForegound: Notification.Name = {
        #if canImport(UIKit)
            UIApplication.willEnterForegroundNotification
        #else
            NSApplication.willBecomeActiveNotification
        #endif
    }()

    private static var applicationWillTerminate: Notification.Name = {
        #if canImport(UIKit)
            UIApplication.willTerminateNotification
        #else
            NSApplication.willTerminateNotification
        #endif
    }()

    private let notifications = [
        applicationDidMoveToBackground,
        applicationWillMoveToForegound,
        applicationWillTerminate
    ]

    init(stateMachine: StateMachine<ApplicationState, ActivityEvent>? = nil) {
        self.stateMachine = stateMachine ??
            StateMachine(initialState: .initializing,
                         resolver: ApplicationState.Resolver.resolve(currentState:event:))
        for notification in notifications {
            NotificationCenter.default.addObserver(self,
                                                   selector: #selector(handleApplicationStateChange),
                                                   name: notification,
                                                   object: nil)
        }
    }

    deinit {
        for notification in notifications {
            NotificationCenter.default.removeObserver(self,
                                                      name: notification,
                                                      object: nil)
        }
        stateMachineSubscriberToken = nil
    }

    func beginActivityTracking(_ listener: @escaping (ApplicationState) -> Void) {
        stateMachineSubscriberToken = stateMachine.subscribe(listener)
    }

    @objc private func handleApplicationStateChange(_ notification: Notification) {
        switch notification.name {
        case Self.applicationDidMoveToBackground:
            stateMachine.process(.applicationDidMoveToBackground)
        case Self.applicationWillMoveToForegound:
            stateMachine.process(.applicationWillMoveToForeground)
        case Self.applicationWillTerminate:
            stateMachine.process(.applicationWillTerminate)
        default:
            return
        }
    }
}
