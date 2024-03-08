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

package software.aws.solution.clickstream.model;

import lombok.*;

@Setter
@Getter
@ToString
public class TrafficSource {
    private String source;
    private String medium;
    private String campaign;
    private String content;
    private String term;
    private String campaignId;
    private String clidPlatform;
    private String clid;
    private String channelGroup;
    private String category;
}
