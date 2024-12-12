#!/bin/bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Script to build S3 distribution assets for the solution

# Parameters:
#   - source-bucket-base-name: Base name for the S3 bucket to store Lambda code
#   - solution-name: Trademark-approved name of the solution
#   - version-code: Version of the solution package

set -e  # Exit on error
set -x  # Enable command tracing

# Constants
TEMPLATE_DIR="$PWD"
TEMPLATE_DIST_DIR="$TEMPLATE_DIR/global-s3-assets"
BUILD_DIST_DIR="$TEMPLATE_DIR/regional-s3-assets"
PLACEHOLDER_MSG="This folder is intentionally empty because this solution is a code-only SDK."

# Function to print usage instructions
print_usage() {
    echo "Usage: $0 <source-bucket-base-name> <solution-name> <version-code>"
    echo "Example: $0 solutions trademarked-solution-name v1.1.0"
}

# Function to check prerequisites
check_prerequisites() {
    for cmd in xcodebuild swiftlint; do
        if ! command -v $cmd &>/dev/null; then
            echo "$cmd is not available in the environment. Exiting."
            exit 0
        fi
    done
}

# Function to clean and initialize output folders
init_output_folders() {
    echo "Cleaning and initializing output folders..."
    rm -rf "$TEMPLATE_DIST_DIR" "$BUILD_DIST_DIR"
    mkdir -p "$TEMPLATE_DIST_DIR" "$BUILD_DIST_DIR"
    echo "$PLACEHOLDER_MSG" >"$TEMPLATE_DIST_DIR/README.txt"
    echo "$PLACEHOLDER_MSG" >"$BUILD_DIST_DIR/README.txt"
}

# Function to lint Swift code
run_swiftlint() {
    echo "Running SwiftLint..."
    if ! swiftlint; then
        echo "SwiftLint failed with linting issues. Exiting."
        exit 1
    fi
}

# Function to build the solution
run_xcodebuild() {
    echo "Running xcodebuild..."
    xcodebuild build \
        -scheme aws-solution-clickstream-swift \
        -sdk iphonesimulator \
        -derivedDataPath .build/ \
        -destination "$DESTINATION"
}

# Main script execution starts here
main() {
    if [ "$#" -ne 3 ]; then
        echo "Invalid number of arguments."
        print_usage
        exit 1
    fi

    # Parse input arguments
    local source_bucket_base_name="$1"
    local solution_name="$2"
    local version_code="$3"

    echo "Source Bucket Base Name: $source_bucket_base_name"
    echo "Solution Name: $solution_name"
    echo "Version Code: $version_code"

    # Source shared configuration
    source ./config.sh

    # Initialize folders
    init_output_folders

    # Validate environment
    check_prerequisites

    # Move to repository root and run tools
    cd ..
    run_swiftlint
    run_xcodebuild

    echo "Build completed successfully. Artifacts are located in: .build/Build/Products"
}

main "$@"
