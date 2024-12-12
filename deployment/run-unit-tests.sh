#!/bin/bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Script to run unit tests for the solution

set -e  # Exit on error
set -x  # Enable command tracing

# Function to print an error message and exit
print_error_and_exit() {
    echo "$1 Exiting."
    exit 0
}

# Function to check if a required command is available
check_command() {
    if ! command -v "$1" &>/dev/null; then
        print_error_and_exit "$1 is not available in the environment."
    fi
}

# Function to run unit tests using xcodebuild and xcpretty
run_unit_tests() {
    echo "Running unit tests..."
    xcodebuild test \
        -scheme aws-solution-clickstream-swift \
        -sdk iphonesimulator \
        -derivedDataPath .build/ \
        -destination "$DESTINATION" \
        -enableCodeCoverage YES | \
        xcpretty
}

# Main script execution
main() {
    # Source shared configuration
    source ./config.sh

    # Validate required commands
    check_command xcodebuild
    check_command xcpretty

    # Move to repository root and run tests
    cd ..
    run_unit_tests

    echo "Tests completed successfully. Coverage data is located at: .build/Logs/Test"
}

# Execute the main function
main "$@"
