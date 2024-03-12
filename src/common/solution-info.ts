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

interface VersionProps {
  readonly full: string;
  readonly short: string;
  readonly buildId: string;
};

export class SolutionInfo {

  static SOLUTION_ID = 'SO0219';
  static SOLUTION_NAME = 'Clickstream Analytics on AWS';
  static SOLUTION_SHORT_NAME = 'Clickstream';
  static SOLUTION_VERSION = process.env.SOLUTION_VERSION || 'v1.2.0';
  static SOLUTION_VERSION_DETAIL = versionDetail(SolutionInfo.SOLUTION_VERSION);
  static SOLUTION_VERSION_SHORT = parseVersion(SolutionInfo.SOLUTION_VERSION).short;
  static DESCRIPTION = `(${SolutionInfo.SOLUTION_ID}) ${SolutionInfo.SOLUTION_NAME} ${SolutionInfo.SOLUTION_VERSION_DETAIL}`;
  static SOLUTION_TYPE = 'AWS-Solutions';
}

function parseVersion(version: string): VersionProps {
  const versionPattern = /^(v\d+\.\d+\.\d+)-?(.*)/;
  const match = version.match(versionPattern);

  if (match) {
    return {
      full: version,
      short: match[1],
      buildId: match[2],
    };
  }

  throw new Error(`Illegal version string '${version}'.`);
}

export function versionDetail(version: string): string {
  const { short, buildId } = parseVersion(version);
  const buildInfo = buildId ? `(Build ${buildId})` : '';

  return `(Version ${short})${buildInfo}`;
}