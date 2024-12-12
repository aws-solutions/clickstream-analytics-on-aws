# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import json
import re

import pytest
import yaml


class TestLogcatIOS:
    path = yaml.safe_load(open("ios_path.yaml", "r"))

    def init_events(self, path):
        self.recorded_events = get_recorded_events(path)

    @pytest.mark.parametrize("path", path)
    def test_upload(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        self.submitted_events = get_submitted_events(path)
        # assert all record events are submitted.
        assert sum(self.submitted_events) > 0
        assert len(self.recorded_events) > 0
        assert sum(self.submitted_events) >= len(self.recorded_events)
        print("Verifying successful upload of all events.")

    @pytest.mark.parametrize("path", path)
    def test_launch_events(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert launch events
        start_events = [self.recorded_events[0]['event_name'],
                        self.recorded_events[1]['event_name'],
                        self.recorded_events[2]['event_name'],
                        self.recorded_events[3]['event_name']]
        assert '_app_start' in start_events
        assert '_session_start' in start_events
        if '_first_open' not in start_events:
            first_open_event = next(
                (event for event in self.recorded_events if '_first_open' in event.get('event_name', '')),
                None)
            assert first_open_event is not None
        print("Verifying successful order of launch events.")

    @pytest.mark.parametrize("path", path)
    def test_first_screen_view(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert first _screen_view
        screen_view_events = [event for event in self.recorded_events if '_screen_view' in event.get('event_name', '')]
        sorted_screen_view_events = sorted(
            screen_view_events,
            key=lambda event: event['event_json'].get('timestamp', float('inf'))
        )
        screen_view_event = sorted_screen_view_events[0]
        if screen_view_event['event_json'].get('attributes')['_entrances'] == 0:
            screen_view_event = sorted_screen_view_events[1]
        assert screen_view_event['event_json'].get('attributes')['_entrances'] == 1
        assert '_screen_name' in screen_view_event['event_json'].get('attributes')
        assert '_screen_unique_id' in screen_view_event['event_json'].get('attributes')

        assert '_session_start_timestamp' in screen_view_event['event_json'].get('attributes')
        assert '_session_duration' in screen_view_event['event_json'].get('attributes')
        assert '_session_number' in screen_view_event['event_json'].get('attributes')
        print("Verifying successful attributes of all first _screen_view events.")

    @pytest.mark.parametrize("path", path)
    def test_last_screen_view(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert last _screen_view
        screen_view_event = next(
            (event for event in reversed(self.recorded_events) if '_screen_view' in event.get('event_name', '')),
            None)
        assert screen_view_event['event_json'].get('attributes')['_entrances'] == 0
        assert '_screen_name' in screen_view_event['event_json'].get('attributes')
        assert '_screen_unique_id' in screen_view_event['event_json'].get('attributes')

        assert '_previous_screen_name' in screen_view_event['event_json'].get('attributes')
        assert '_previous_screen_unique_id' in screen_view_event['event_json'].get('attributes')
        assert '_previous_timestamp' in screen_view_event['event_json'].get('attributes')

        print("Verifying successful attributes of all last _screen_view events.")

    @pytest.mark.parametrize("path", path)
    def test_profile_set(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert _profile_set
        profile_set_event = [event for event in self.recorded_events if '_profile_set' in event.get('event_name', '')]
        assert '_user_id' not in profile_set_event[-1]['event_json']['user']
        assert '_user_id' in profile_set_event[-2]['event_json']['user']
        print("Verifying successful attributes of _profile_set events.")

    @pytest.mark.parametrize("path", path)
    def test_login(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert login
        login_event = [event for event in self.recorded_events if 'login' in event.get('event_name', '')]
        assert len(login_event) > 0
        print("Verifying successful login events.")

    @pytest.mark.parametrize("path", path)
    def test_product_exposure(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert product_exposure
        product_exposure = next(
            (event for event in self.recorded_events if 'product_exposure' in event.get('event_name', '')),
            None)
        assert len(product_exposure['event_json'].get('items')) > 0
        assert 'id' in product_exposure['event_json'].get('attributes')
        print("Verifying successful attributes of product_exposure events.")

    @pytest.mark.parametrize("path", path)
    def test_add_to_cart(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert add_to_cart
        add_to_cart_event = [event for event in self.recorded_events if 'add_to_cart' in event.get('event_name', '')]
        assert len(add_to_cart_event) > 0
        assert 'product_id' in add_to_cart_event[0]['event_json'].get('attributes')
        print("Verifying successful attributes of add_to_cart_event events.")

    @pytest.mark.parametrize("path", path)
    def test_view_home(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert view_home
        view_home_event = [event for event in self.recorded_events if 'view_home' in event.get('event_name', '')]
        assert len(view_home_event) > 0
        print("Verifying successful view_home events.")

    @pytest.mark.parametrize("path", path)
    def test_view_cart(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert view_cart
        view_cart_event = [event for event in self.recorded_events if 'view_cart' in event.get('event_name', '')]
        assert len(view_cart_event) > 0
        print("Verifying successful view_cart events.")

    @pytest.mark.parametrize("path", path)
    def test_view_profile(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert view_account
        view_account_event = [event for event in self.recorded_events if 'view_profile' in event.get('event_name', '')]
        assert len(view_account_event) > 0
        print("Verifying successful view_account events.")

    @pytest.mark.parametrize("path", path)
    def test_check_out(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert check_out
        check_out_event = [event for event in self.recorded_events if 'check_out_click' in event.get('event_name', '')]
        assert len(check_out_event) > 0
        assert float(check_out_event[0]['event_json'].get('attributes')["totalPrice"]) > 0
        print("Verifying successful check_out events.")

    @pytest.mark.parametrize("path", path)
    def test_user_engagement(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert _user_engagement
        user_engagement_event = next(
            (event for event in self.recorded_events if '_user_engagement' in event.get('event_name', '')),
            None)
        assert '_engagement_time_msec' in user_engagement_event['event_json'].get('attributes')
        assert user_engagement_event['event_json'].get('attributes')['_engagement_time_msec'] > 1000
        print("Verifying successful attributes of _user_engagement events.")

    @pytest.mark.parametrize("path", path)
    def test_app_end(self, path):
        print("Start verify: " + str(path))
        self.init_events(path)
        # assert _app_end
        app_end_event = next((event for event in self.recorded_events if '_app_end' in event.get('event_name', '')),
                             None)
        assert app_end_event is not None
        print("Verifying successful completion of _app_end event.")


def get_submitted_events(path):
    submitted_events = []
    with open(path, 'r') as file:
        pattern = re.compile(r'^Send (\d+) events')
        for line in file:
            match = pattern.search(line)
            if match:
                submitted_events.append(int(match.group(1)))
    return submitted_events


def get_recorded_events(path):
    with open(path, 'r') as file:
        log_lines = file.readlines()
    events = []
    first_event_pattern = re.compile(r'app_event_log:Saved event (\w+):(.*)$')
    event_pattern = re.compile(r'^Saved event (\w+):(.*)$')

    current_event_name = ''

    for line in log_lines:
        first_event_match = first_event_pattern.search(line)
        event_match = event_pattern.search(line)
        if first_event_match:
            event_match = first_event_match
        if event_match:
            event_name, event_json = event_match.groups()
            if event_name == '_app_start' and (
                    current_event_name == '_app_end' or current_event_name == '_user_engagement'):
                continue
            else:
                events.append({
                    'event_name': event_name,
                    'event_json': json.loads(event_json)
                })
                current_event_name = event_name
        else:
            continue
    return events
