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

import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;

import java.io.*;

public class SafeBooleanDeserializer extends JsonDeserializer<Boolean> {
    @Override
    public Boolean deserialize(final JsonParser p, final DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.isEmpty() || value.equals("null")) {
            return null;
        }

        if (value.equals("1")) {
            return true;
        }

        if (value.equals("0")) {
            return false;
        }

        try {
            return Boolean.parseBoolean(value);
        } catch (Exception e) {
            return null;
        }
    }
}
