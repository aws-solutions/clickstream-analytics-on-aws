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

package software.aws.solution.clickstream.plugin.enrich;

import org.apache.flink.shaded.jackson2.com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ua_parser.Client;
import ua_parser.Parser;

import java.util.Map;
import java.util.Optional;

public class UAEnrichment implements Enrichment {
    public static final String PARAM_KEY_UA = "ua";
    private static final Logger LOG = LoggerFactory.getLogger(UAEnrichment.class);
    private static final Parser UA_PARSER = new Parser();

    @Override
    public ObjectNode enrich(ObjectNode device, Map<String, String> paramMap) {
        String ua = paramMap.get(PARAM_KEY_UA);
        Client client = UA_PARSER.parse(ua);
        String uaBrowser = Optional.ofNullable(client.userAgent).map(a -> a.family).orElse(null);
        String uaBrowserVersion = Optional.ofNullable(client.userAgent)
                .map(a -> getVersion(a.major, a.major, a.patch)).orElse(null);

        String uaOs = Optional.ofNullable(client.os).map(a -> a.family).orElse(null);
        String uaOsVersion = Optional.ofNullable(client.os)
                .map(a -> getVersion(a.major, a.major, a.patch)).orElse(null);

        String uaDevice = Optional.ofNullable(client.device).map(a -> a.family).orElse(null);
        String uaDeviceCategory = null; // PC|Tablet|Mobile|Bot|Other

        device.put("ua_browser", uaBrowser);
        device.put("ua_browser_version", uaBrowserVersion);
        device.put("ua_os", uaOs);
        device.put("ua_os_version", uaOsVersion);
        device.put("ua_device", uaDevice);
        device.put("ua_device_category", uaDeviceCategory);
        return device;
    }

    private static String getVersion(final String major, final String minor, final String patch) {
        if (major != null && minor != null && patch != null) {
            return String.format("%s.%s.%s", major, minor, patch);
        } else {
            return null;
        }
    }
}
