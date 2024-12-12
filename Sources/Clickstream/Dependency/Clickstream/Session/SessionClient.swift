//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation

protocol SessionClientBehaviour: AnyObject {
    func startActivityTracking()
    func storeSession()
    func onManualScreenView(_ event: ClickstreamEvent)
}

class SessionClient: SessionClientBehaviour {
    private var session: Session
    private let clickstream: ClickstreamContext
    private let activityTracker: ActivityTrackerBehaviour
    private let sessionClientQueue = DispatchQueue(label: Constants.queue,
                                                   attributes: .concurrent)
    let autoRecordClient: AutoRecordEventClient

    init(activityTracker: ActivityTrackerBehaviour? = nil, clickstream: ClickstreamContext) {
        self.clickstream = clickstream
        self.session = Session.getCurrentSession(clickstream: clickstream)
        self.autoRecordClient = AutoRecordEventClient(clickstream: clickstream)
        self.activityTracker = activityTracker ?? ActivityTracker()
    }

    func startActivityTracking() {
        activityTracker.beginActivityTracking { [weak self] newState in
            guard let self else { return }
            self.sessionClientQueue.sync(flags: .barrier) {
                self.respond(to: newState)
            }
        }
    }

    func handleAppStart() {
        autoRecordClient.handleFirstOpen()
        autoRecordClient.handleAppStart()
        handleSesionStart()
    }

    func storeSession() {
        session.pause()
        UserDefaultsUtil.saveSession(storage: clickstream.storage, session: session)
    }

    func getCurrentSession() -> Session {
        session
    }

    private func handleAppEnterForeground() {
        log.debug("Application entered the foreground.")
        autoRecordClient.handleFirstOpen()
        session = Session.getCurrentSession(clickstream: clickstream, previousSession: session)
        autoRecordClient.handleAppStart()
        autoRecordClient.updateLastScreenStartTimestamp(Date().millisecondsSince1970)
        handleSesionStart()
    }

    private func handleSesionStart() {
        if session.isNewSession, !session.isRecorded {
            autoRecordClient.recordSessionStartEvent()
            autoRecordClient.setIsEntrances()
            autoRecordClient.recordScreenViewAfterSessionStart()
            session.isRecorded = true
        }
    }

    private func handleAppEnterBackground() {
        log.debug("Application entered the background.")
        storeSession()
        autoRecordClient.recordUserEngagement()
        autoRecordClient.recordAppEnd()
        clickstream.analyticsClient.submitEvents(isBackgroundMode: true)
    }

    func onManualScreenView(_ event: ClickstreamEvent) {
        autoRecordClient.recordViewScreenManually(event)
    }

    private func respond(to newState: ApplicationState) {
        if !clickstream.isEnable { return }
        switch newState {
        case .runningInForeground:
            handleAppEnterForeground()
        case .runningInBackground:
            handleAppEnterBackground()
        default:
            break
        }
    }
}

// MARK: - ClickstreamLogger

extension SessionClient: ClickstreamLogger {}
extension SessionClient {
    enum Constants {
        static let queue = "software.aws.solution.Clickstream.SessionClientQueue"
    }
}
