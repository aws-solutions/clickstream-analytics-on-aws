/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

package software.aws.solution.clickstream.common;

import lombok.extern.slf4j.*;
import org.apache.logging.log4j.*;
import org.apache.logging.log4j.core.config.*;
import org.junit.jupiter.api.*;
import software.aws.solution.clickstream.*;
import software.aws.solution.clickstream.common.ingest.*;
import software.aws.solution.clickstream.common.model.*;

import java.io.*;
import java.util.HashMap;
import java.util.Map;

import static software.aws.solution.clickstream.common.Util.objectToJsonString;


@Slf4j
public class ClickstreamEventParserTest extends BaseTest {

    @BeforeAll
    public static void setup() {
        Configurator.setRootLevel(Level.WARN);
        Configurator.setLevel("software.aws.solution.clickstream", Level.DEBUG);
        setEnableEventTimeShift(true);
    }
    private static void setEnableEventTimeShift(boolean b) {
        System.setProperty(ClickstreamEventParser.ENABLE_EVENT_TIME_SHIFT_PROP, b + "");
    }

    @Test
    public void test_parse_line() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line
        String line = resourceFileContent("/original_data_nozip.json");

        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        ClickstreamIngestRow row = clickstreamEventParser.ingestLineToRow(line);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line.json");

        Assertions.assertEquals(expectedJson, prettyJson(objectToJsonString(row)));
    }

    @Test
    public void test_parse_line_client_time() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_client_time
        String lines = resourceFileContent("/original_data_nozip_client_time.json");
        String firstLine = lines.split("\n")[0];
        String secondLine = lines.split("\n")[1];
        String thirdLine = lines.split("\n")[2];

        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        ClickstreamIngestRow row1 = clickstreamEventParser.ingestLineToRow(firstLine);
        Assertions.assertEquals(1682319109405L, row1.getUploadTimestamp());

        ClickstreamIngestRow row2 = clickstreamEventParser.ingestLineToRow(secondLine);
        Assertions.assertNull(row2.getUploadTimestamp());

        ClickstreamIngestRow row3 = clickstreamEventParser.ingestLineToRow(thirdLine);
        Assertions.assertEquals(1682319109406L, row3.getUploadTimestamp());
    }
    @Test
    void test_parse_data() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_data
        String line = resourceFileContent("/event_deser_input.json");
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        Event ingestEvent = clickstreamEventParser.ingestDataToEvent(line);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_data.json");

        Assertions.assertEquals(expectedJson, prettyJson(objectToJsonString(ingestEvent)));
    }


    @Test
    void test_parse_line_to_db_row() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row

        setEnableEventTimeShift(false);
        String line = resourceFileContent("/original_data_nozip_upload_time.json");
        log.info(line);
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        String projectId = "test_project_id";
        String fileName = "original_data_nozip_upload_time.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamEvent eventV2 = rowResult.getClickstreamEventList().stream().filter(e -> {
            return e.getEventTimeMsec() == 1682319109447L;
        }).findFirst().get();

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_event_v2.json");

        Assertions.assertEquals(expectedJson, prettyJson(eventV2.toJson()));
    }


    @Test
    void test_parse_line_to_db_row_time_shift() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_time_shift

        setEnableEventTimeShift(true);
        String line = resourceFileContent("/original_data_nozip_uri_upload.json");
        log.info(line);
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        String projectId = "test_project_id";
        String fileName = "original_data_nozip_uri_upload.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamEvent eventV2 = rowResult.getClickstreamEventList().get(0);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_time_shift.json");

        Assertions.assertEquals(expectedJson, prettyJson(eventV2.toJson()));
    }

    @Test
    public void test_parse_line_to_db_row_disable_time_shift() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_disable_time_shift
        setEnableEventTimeShift(false);

        String line = resourceFileContent("/original_data_nozip_upload_time.json");
        log.info(line);
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        String projectId = "test_project_id";
        String fileName = "original_data_nozip_upload_time.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamEvent eventV2 = rowResult.getClickstreamEventList().get(0);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_disable_time_shift.json");

        Assertions.assertEquals(expectedJson, prettyJson(eventV2.toJson()));

        setEnableEventTimeShift(true);
    }

    @Test
    void test_parse_line_to_db_row_single() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_single
        String line = resourceFileContent("/original_data_single.json");
        log.info(line);
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        String projectId = "test_project_id";
        String fileName = "original_data_single.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamEvent eventV2 = rowResult.getClickstreamEventList().get(0);

        Assertions.assertEquals("ClickMe", eventV2.getEventName());
    }


    @Test
    void test_parse_line_to_db_row_zip() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_zip
        String line = resourceFileContent("/original_data.json");
        log.info(line);
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        String projectId = "test_project_id";
        String fileName = "original_data.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamEvent eventV2 = rowResult.getClickstreamEventList().get(0);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_zip_event_v2.json");

        Assertions.assertEquals(expectedJson, prettyJson(eventV2.toJson()));
    }

    @Test
    public void test_parse_line_to_db_row_event() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_event
        setEnableEventTimeShift(false);

        String line = resourceFileContent("/original_data_page_url.json");
        log.info(line);
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        String projectId = "test_project_id";
        String fileName = "original_data_page_url.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamEvent eventV2 = rowResult.getClickstreamEventList().get(0);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_event.json");

        Assertions.assertEquals(expectedJson, prettyJson(eventV2.toJson()));

        setEnableEventTimeShift(true);
    }

    @Test
    public void test_parse_line_to_db_row_event_with_config() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_event_with_config
        setEnableEventTimeShift(false);

        String line = resourceFileContent("/original_data_page_url_web.json");
        log.info(line);
        Map<String, RuleConfig> ruleConfigMap = new HashMap<>();
        ruleConfigMap.put("uba-app", getRuleConfigV0());

        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance(ruleConfigMap);
        String projectId = "test_project_id";
        String fileName = "original_data_page_url.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamEvent eventV2 = rowResult.getClickstreamEventList().get(0);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_event_web.json");

        Assertions.assertEquals(expectedJson, prettyJson(eventV2.toJson()));

        setEnableEventTimeShift(true);
    }

    @Test
    public void test_parse_line_to_db_row_event_with_config2() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_event_with_config2
        setEnableEventTimeShift(false);

        String line = resourceFileContent("/original_data_page_url_web.json");
        log.info(line);
        Map<String, RuleConfig> ruleConfigMap = new HashMap<>();
        ruleConfigMap.put("uba-app", getRuleConfigV0());

        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        clickstreamEventParser.setAppRuleConfig(ruleConfigMap);

        String projectId = "test_project_id";
        String fileName = "original_data_page_url.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamEvent eventV2 = rowResult.getClickstreamEventList().get(0);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_event_web.json");

        Assertions.assertEquals(expectedJson, prettyJson(eventV2.toJson()));

        setEnableEventTimeShift(true);
    }

    @Test
    public void test_parse_line_to_db_row_item() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_item
        setEnableEventTimeShift(false);

        String line = resourceFileContent("/original_data_with_items.json");
        log.info(line);
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        String projectId = "test_project_id";
        String fileName = "original_data_with_items.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamItem itemV2 = rowResult.getClickstreamItemList().get(0);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_item.json");

        Assertions.assertEquals(expectedJson, prettyJson(itemV2.toJson()));

        setEnableEventTimeShift(true);
    }

    @Test
    public void test_parse_line_to_db_row_user() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_line_to_db_row_user
        setEnableEventTimeShift(false);

        String line = resourceFileContent("/original_data_page_url.json");
        log.info(line);
        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        String projectId = "test_project_id";
        String fileName = "original_data_page_url.json";

        ParseRowResult rowResult = clickstreamEventParser.parseLineToDBRow(line, projectId, fileName);

        ClickstreamUser userV2 = rowResult.getClickstreamUserList().get(0);

        String expectedJson = this.resourceFileAsString("/expected/test_parse_line_to_db_row_user.json");

        Assertions.assertEquals(expectedJson, prettyJson(userV2.toJson()));

        setEnableEventTimeShift(true);
    }

    @Test
    void test_parse_empty_data() throws IOException {
        // ./gradlew clean test --info --tests software.aws.solution.clickstream.common.ClickstreamEventParserTest.test_parse_empty_data

        ClickstreamEventParser clickstreamEventParser = ClickstreamEventParser.getInstance();
        ExtraParams extraParams = ExtraParams.builder().build();
        ParseDataResult r = clickstreamEventParser.parseData("", extraParams, 0);
        Assertions.assertEquals(0, r.getClickstreamEventList().size());
        Assertions.assertEquals(0, r.getClickstreamItemList().size());
        Assertions.assertNull(r.getClickstreamUser());

        r = clickstreamEventParser.parseData("", extraParams, 0);
        Assertions.assertEquals(0, r.getClickstreamEventList().size());
        Assertions.assertEquals(0, r.getClickstreamItemList().size());
        Assertions.assertNull(r.getClickstreamUser());

        r = clickstreamEventParser.parseData("{\"invalid_name\": \"Test\"}", extraParams, 0);
        Assertions.assertEquals(0, r.getClickstreamEventList().size());
        Assertions.assertEquals(0, r.getClickstreamItemList().size());
        Assertions.assertNull(r.getClickstreamUser());
    }


    @Test
    void testGetSetForTimeShiftInfo() {
        TimeShiftInfo timeShiftInfo = new TimeShiftInfo();

        timeShiftInfo.setTimeDiff(1000L);
        timeShiftInfo.setUploadTimestamp(2000L);
        timeShiftInfo.setEventTimestamp(3000L);
        timeShiftInfo.setAdjusted(false);
        timeShiftInfo.setUri("uri://test");
        timeShiftInfo.setIngestTimestamp(4000L);
        timeShiftInfo.setOriginEventTimestamp(5000L);

        Assertions.assertEquals(1000L, timeShiftInfo.getTimeDiff());
        Assertions.assertEquals(2000L, timeShiftInfo.getUploadTimestamp());
        Assertions.assertEquals(3000L, timeShiftInfo.getEventTimestamp());
        Assertions.assertFalse(timeShiftInfo.isAdjusted());
        Assertions.assertEquals("uri://test", timeShiftInfo.getUri());
        Assertions.assertEquals(4000L, timeShiftInfo.getIngestTimestamp());
        Assertions.assertEquals(5000L, timeShiftInfo.getOriginEventTimestamp());

    }



}
