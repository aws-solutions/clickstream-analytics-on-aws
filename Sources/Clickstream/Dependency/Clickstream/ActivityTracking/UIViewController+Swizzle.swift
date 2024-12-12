//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

#if canImport(UIKit)
import UIKit

private var hasSwizzled = false
private var viewDidAppearFunc: ((String, String, String) -> Void)?
extension UIViewController: ClickstreamLogger {}

extension UIViewController {
    @objc func swizzled_viewDidAppear(_ animated: Bool) {
        // Call the original implementation of viewDidAppear
        swizzled_viewDidAppear(animated)

        let screenName = NSStringFromClass(type(of: self))
        let screenPath = getPath()
        let screenHashValue = String(describing: hashValue)
        viewDidAppearFunc?(screenName, screenPath, screenHashValue)
    }

    func getPath() -> String {
        var path = ""
        if let parent {
            path += "\(parent.getPath())/"
        }
        path += "\(type(of: self))"
        return path
    }

    static func swizzle(viewDidAppear: @escaping (String, String, String) -> Void) {
        viewDidAppearFunc = viewDidAppear
        guard !hasSwizzled else { return }

        let originalSelector = #selector(viewDidAppear(_:))
        let swizzledSelector = #selector(swizzled_viewDidAppear(_:))

        let originalMethod = class_getInstanceMethod(self, originalSelector)!
        let swizzledMethod = class_getInstanceMethod(self, swizzledSelector)!

        method_exchangeImplementations(originalMethod, swizzledMethod)

        hasSwizzled = true
    }
}
#endif
