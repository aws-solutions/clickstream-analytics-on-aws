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

import com.github.benmanes.caffeine.cache.Caffeine;

import java.time.Duration;

public class Cache<T> {
    private final com.github.benmanes.caffeine.cache.Cache<String, T> dataCached;

    public Cache() {
        this(Integer.MAX_VALUE/8); //255M
    }

    public Cache(final int size) {
        this.dataCached =  Caffeine.newBuilder()
                .maximumSize(size)
                .expireAfterWrite(Duration.ofMinutes(5))
                .expireAfterAccess(Duration.ofMinutes(5))
                .build();
    }
    public boolean containsKey(final String key) {
        return dataCached.getIfPresent(key) != null;
    }
    public T get(final String key) {
        return dataCached.getIfPresent(key);
    }

    public void put(final String key, final T data) {
        dataCached.put(key, data);
    }
}
