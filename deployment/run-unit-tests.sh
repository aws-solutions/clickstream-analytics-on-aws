#!/usr/bin/env bash

set -euxo pipefail

cd ${CODEBUILD_SRC_DIR}

rm frontend/src/ts/constant-ln.ts
cp src/common/constant.ts frontend/src/ts/constant-ln.ts
rm src/control-plane/backend/lambda/api/common/*-ln.ts
cp src/common/constant.ts src/control-plane/backend/lambda/api/common/constants-ln.ts
cp src/common/model.ts src/control-plane/backend/lambda/api/common/model-ln.ts
cp src/common/sdk-client-config.ts src/control-plane/backend/lambda/api/common/sdk-client-config-ln.ts
cp src/common/solution-info.ts src/control-plane/backend/lambda/api/common/solution-info-ln.ts
cp src/common/utils.ts src/control-plane/backend/lambda/api/common/utils-ln.ts
rm src/control-plane/backend/lambda/api/middle-ware/authorizer.ts
cp src/control-plane/auth/authorizer.ts src/control-plane/backend/lambda/api/middle-ware/authorizer.ts
rm src/control-plane/backend/lambda/api/service/quicksight/dashboard-ln.ts
cp src/reporting/private/dashboard.ts src/control-plane/backend/lambda/api/service/quicksight/dashboard-ln.ts

echo "yarn install"
yarn install --check-files --frozen-lockfile

npx projen

echo "npx yarn test"
npx yarn test

export CI=true
npx yarn install --check-files --frozen-lockfile --cwd frontend
npx yarn --cwd frontend run test

docker run -i --rm -v `pwd`/src/data-pipeline/spark-etl/:/data --workdir /data \
  public.ecr.aws/docker/library/gradle:7.6-jdk17 gradle test jacocoAggregatedReport