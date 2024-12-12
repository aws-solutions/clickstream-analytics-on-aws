//
// Copyright Amazon.com Inc. or its affiliates.
// All Rights Reserved.
//
// SPDX-License-Identifier: Apache-2.0
//

#if canImport(UIKit)
    import UIKit
#endif
class MockViewControllerA: UIViewController {
    var viewDidAppearCalled = false

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        viewDidAppearCalled = true
    }
}
