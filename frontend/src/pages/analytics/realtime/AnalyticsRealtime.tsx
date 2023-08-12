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

import { AppLayout } from '@cloudscape-design/components';
import { createEmbeddingContext } from 'amazon-quicksight-embedding-sdk';
import { fetchEmbeddingUrl } from 'apis/analytics';
import Loading from 'components/common/Loading';
import Navigation from 'components/layouts/Navigation';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const AnalyticsRealtime: React.FC = () => {
  const { pid, appid } = useParams();
  const [loadingData, setLoadingData] = useState(false);

  const getEmbeddingUrl = async () => {
    try {
      const { success, data }: ApiResponse<any> = await fetchEmbeddingUrl(
        'us-west-2',
        window.location.origin,
        '06699301-ba58-4ad3-8b74-585dac04d275'
      );
      if (success) {
        const embedDashboard = async () => {
          const embeddingContext = await createEmbeddingContext();
          await embeddingContext.embedDashboard({
            url: data.EmbedUrl,
            container: '#qs-container',
          });
        };
        embedDashboard();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoadingData(true);
    getEmbeddingUrl();
    setLoadingData(false);
  }, []);

  return (
    <AppLayout
      toolsHide
      content={
        loadingData ? (
          <Loading />
        ) : (
          <div
            id={'qs-container'}
            className='iframe-dashboard'
          ></div>
        )
      }
      headerSelector="#header"
      navigation={
        <Navigation activeHref={`/analytics/${pid}/app/${appid}/realtime`} />
      }
    />
  );
};

export default AnalyticsRealtime;
