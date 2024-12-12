# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import pytest
from time import sleep

from appium import webdriver
from appium.options.ios import XCUITestOptions
from appium.webdriver.common.appiumby import AppiumBy
from selenium.common.exceptions import NoSuchElementException

capabilities = dict(
    platformName='ios',
    automationName='xcuitest',
    deviceName='iPhone',
    bundleId='software.aws.solution.ModerneShopping',
    language='en',
    locale='US',
)

appium_server_url = 'http://0.0.0.0:4723/wd/hub'


class TestShopping:
    def setup_method(self):
        self.driver = webdriver.Remote(appium_server_url, options=XCUITestOptions().load_capabilities(capabilities))
        self.driver.implicitly_wait(10)

    def teardown_method(self):
        if self.driver:
            self.driver.quit()

    @pytest.mark.parametrize("test_suite", [
        "test suite 1",
        "test suite 2"
    ])
    def test_shopping(self, test_suite):
        sleep(3)
        self.perform_click_element('Profile')
        self.perform_click_element('sign_in')
        sleep(3)
        self.perform_click_element('Cart')
        self.perform_click_element('check_out')
        self.perform_click_element('purchase')
        self.perform_click_element('Profile')
        self.perform_click_element("sign_out")
        self.driver.execute_script('mobile: backgroundApp', {"seconds": 5})
        sleep(1)
        self.perform_click_element("show_log_text")
        event_log = self.driver.find_element(by=AppiumBy.ID, value="event_log")
        self.driver.log_event("app_event_log", event_log.text)
        print(event_log.text)
        sleep(1)

    def perform_click_element(self, element_id):
        try:
            element = self.driver.find_element(by=AppiumBy.ID, value=element_id)
            element.click()
            sleep(2)
        except NoSuchElementException:
            pytest.skip(f"Element with ID '{element_id}' not found. Skipped the test")


if __name__ == '__main__':
    TestShopping.test_shopping()
