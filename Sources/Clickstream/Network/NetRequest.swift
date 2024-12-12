//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

import Amplify
import Foundation

enum NetRequest {
    static func uploadEventWithURLSession(
        eventsJson: String,
        configuration: ClickstreamConfiguration,
        bundleSequenceId: Int) -> Bool
    {
        var requestData = eventsJson
        var compression = ""
        if configuration.isCompressEvents {
            let compressString = CompressUtil.compressForGzip(unZipString: eventsJson)
            if compressString == nil {
                return false
            }
            requestData = compressString!
            compression = "gzip"
        }
        guard var urlComponts = URLComponents(string: configuration.endpoint) else {
            log.error("error: invalid endpoint")
            return false
        }
        urlComponts.queryItems = [
            URLQueryItem(name: "platform", value: "iOS"),
            URLQueryItem(name: "appId", value: configuration.appId),
            URLQueryItem(name: "compression", value: compression),
            URLQueryItem(name: "event_bundle_sequence_id", value: String(describing: bundleSequenceId)),
            URLQueryItem(name: "upload_timestamp", value: String(describing: Date().millisecondsSince1970)),
            URLQueryItem(name: "hashCode", value: requestData.hashCode())
        ]

        var request = URLRequest(url: urlComponts.url!, timeoutInterval: 15.0)
        request.httpMethod = "POST"
        request.addValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")
        if configuration.authCookie != nil {
            request.addValue(configuration.authCookie!, forHTTPHeaderField: "cookie")
        }
        request.httpBody = requestData.data(using: .utf8)
        let semaphore = DispatchSemaphore(value: 0)

        var result = false
        let task = URLSession.shared.dataTask(with: request) { _, response, error in
            if response == nil {
                log.error("send event request fail error:\(String(describing: error))")
            } else {
                guard let httpResponse = response as? HTTPURLResponse else {
                    return
                }
                if httpResponse.statusCode == 200 {
                    result = true
                }
            }
            semaphore.signal()
        }
        task.resume()
        semaphore.wait()
        return result
    }
}

extension NetRequest: ClickstreamLogger {}
