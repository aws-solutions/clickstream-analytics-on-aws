// swift-tools-version: 5.7
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let platforms: [SupportedPlatform] = [.iOS(.v13), .macOS(.v10_15)]
let package = Package(
    name: "aws-solution-clickstream-swift",
    platforms: platforms,
    products: [
        .library(
            name: "Clickstream",
            targets: ["Clickstream"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/aws-amplify/amplify-swift.git", exact: "2.10.0"),
        .package(url: "https://github.com/stephencelis/SQLite.swift.git", exact: "0.13.2"),
        .package(url: "https://github.com/1024jp/GzipSwift", exact: "5.2.0"),
        .package(url: "https://github.com/httpswift/swifter", exact: "1.5.0")
    ],
    targets: [
        .target(
            name: "Clickstream",
            dependencies: [
                .product(name: "AWSPluginsCore", package: "amplify-swift"),
                .product(name: "SQLite", package: "SQLite.swift"),
                .product(name: "Gzip", package: "GzipSwift")
            ]
        ),
        .testTarget(
            name: "ClickstreamTests",
            dependencies: ["Clickstream", .product(name: "Swifter", package: "swifter")],
            resources: [.process("amplifyconfiguration.json")]
        )
    ]
)
