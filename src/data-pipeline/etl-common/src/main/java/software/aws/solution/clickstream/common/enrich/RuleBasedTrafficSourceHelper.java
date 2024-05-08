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

package software.aws.solution.clickstream.common.enrich;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import software.aws.solution.clickstream.common.Cache;
import software.aws.solution.clickstream.common.RuleConfig;
import software.aws.solution.clickstream.common.Util;
import software.aws.solution.clickstream.common.enrich.ts.CategoryTrafficSource;
import software.aws.solution.clickstream.common.enrich.ts.SourceMedium;
import software.aws.solution.clickstream.common.enrich.ts.TrafficSourceHelper;
import software.aws.solution.clickstream.common.enrich.ts.TrafficSourceUtm;
import software.aws.solution.clickstream.common.enrich.ts.rule.CategoryListEvaluator;
import software.aws.solution.clickstream.common.enrich.ts.rule.ChannelListEvaluator;
import software.aws.solution.clickstream.common.enrich.ts.rule.ChannelRuleEvaluatorInput;
import software.aws.solution.clickstream.common.enrich.ts.rule.SourceCategoryAndTerms;
import software.aws.solution.clickstream.common.exception.ExtractDataException;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static software.aws.solution.clickstream.common.Util.getUriParams;
import static software.aws.solution.clickstream.common.Util.objectToJsonString;
import static software.aws.solution.clickstream.common.Util.parseUrl;


@Slf4j
public final class RuleBasedTrafficSourceHelper implements TrafficSourceHelper {
    public static final String GCLID = "gclid";
    public static final String TYPE = "type";
    public static final String VALUE = "value";
    public static final String DIRECT = "Direct";
    public static final String LINKEDIN = "linkedin";
    public static final String YOUTUBE = "youtube";
    public static final String TIKTOK = "tiktok";
    public static final String BAIDU = "baidu";
    public static final String GOOGLE = "google";
    public static final String FACEBOOK = "facebook";
    public static final String TWITTER = "twitter";
    public static final String MICROSOFT = "microsoft";
    public static final String PINTEREST = "pinterest";
    public static final String BING = "bing";
    public static final String SCOCIAL = "scocial";
    public static final String VIDEO = "video";
    public static final String CPC = "cpc";
    public static final String DISPLAY = "display";
    public static final String CLID = "clid";
    private static final Map<String, SourceMedium> KNOWN_CLID_TO_MEDIUM_MAP;
    private static final Map<String, RuleBasedTrafficSourceHelper> INSTANCES = new HashMap<>();

    static {
        KNOWN_CLID_TO_MEDIUM_MAP = getKnownClidTypeToSourceMediumMap();
    }

    private final CategoryListEvaluator categoryListEvaluator;
    private final ChannelListEvaluator channelListEvaluator;

    private static final Cache<CategoryTrafficSource> CACHED_CATEGORY_TRAFFIC_SOURCE = new Cache<>();
    @Getter
    private final String appId;

    private RuleBasedTrafficSourceHelper(final String appId, final RuleConfig ruleConfig) {
        String channelRuleFile = "ts/traffic_source_channel_rule_v0.json";
        String categoryRuleFile = "ts/traffic_source_category_rule_v0.json";

        String channelRuleJson = null;
        String categoryRuleJson = null;

        if (ruleConfig != null) {
            channelRuleJson = ruleConfig.getOptChannelRuleJson();
            categoryRuleJson = ruleConfig.getOptCategoryRuleJson();
        }
        this.appId = appId;
        try {
            if (categoryRuleJson == null) {
                log.warn("categoryRuleJson is null, loading from file: {}", categoryRuleFile);
                categoryRuleJson = Util.readResourceFile(categoryRuleFile);
            }
        } catch (IOException e) {
            log.error("Failed to load category or channel rules categoryRuleFile: {}, error: {}", categoryRuleFile, Util.getStackTrace(e));
            throw new ExtractDataException(e);
        }

        try {
            if (channelRuleJson == null) {
                log.warn("channelRuleJson is null, loading from file: {}", channelRuleFile);
                channelRuleJson = Util.readResourceFile(channelRuleFile);
            }
        } catch (IOException e) {
            log.error("Failed to load category or channel rules channelRuleFile: {}, error: {}", channelRuleFile, Util.getStackTrace(e));
            throw new ExtractDataException(e);
        }

        try {
            this.categoryListEvaluator = CategoryListEvaluator.fromJson(categoryRuleJson);
        } catch (JsonProcessingException e) {
            log.error("Failed to load category or channel rules categoryRuleJson: {}, error: {}", categoryRuleJson, Util.getStackTrace(e));
            throw new ExtractDataException(e);
        }

        try {
            this.channelListEvaluator = ChannelListEvaluator.fromJson(channelRuleJson);
        } catch (JsonProcessingException e) {
            log.error("Failed to load category or channel rules  channelRuleJson: {}, error: {}", channelRuleJson, Util.getStackTrace(e));
            throw new ExtractDataException(e);
        }
    }

    public static RuleBasedTrafficSourceHelper getInstance(final String appId, final RuleConfig ruleConfig) {
        if (INSTANCES.containsKey(appId)) {
            return INSTANCES.get(appId);
        }
        RuleBasedTrafficSourceHelper helper = new RuleBasedTrafficSourceHelper(appId, ruleConfig);
        INSTANCES.put(appId, helper);
        return INSTANCES.get(appId);
    }

    public static Map<String, SourceMedium> getKnownClidTypeToSourceMediumMap() {
        Map<String, SourceMedium> clidTypeToSourceMediumMap = new HashMap<>();
        clidTypeToSourceMediumMap.put(GCLID, new SourceMedium(GOOGLE, CPC));
        clidTypeToSourceMediumMap.put("dclid", new SourceMedium(GOOGLE, DISPLAY));
        clidTypeToSourceMediumMap.put("fbclid", new SourceMedium(FACEBOOK, SCOCIAL));
        clidTypeToSourceMediumMap.put("msclid", new SourceMedium(MICROSOFT, CPC));
        clidTypeToSourceMediumMap.put("twclid", new SourceMedium(TWITTER, CPC));
        clidTypeToSourceMediumMap.put("pintclid", new SourceMedium(PINTEREST, CPC));
        clidTypeToSourceMediumMap.put("linclid", new SourceMedium(LINKEDIN, CPC));
        clidTypeToSourceMediumMap.put("ytclid", new SourceMedium(YOUTUBE, VIDEO));
        clidTypeToSourceMediumMap.put("tikclid", new SourceMedium(TIKTOK, VIDEO));
        clidTypeToSourceMediumMap.put("bingclid", new SourceMedium(BING, CPC));
        clidTypeToSourceMediumMap.put("baiduclid", new SourceMedium(BAIDU, CPC));
        return clidTypeToSourceMediumMap;
    }

    private static Map<String, String> createClidTypeValueMap(final String gclid, final Map<String, List<String>> params) {
        Map<String, String> clidMap = new HashMap<>();

        if (gclid != null) {
            clidMap.put(TYPE, GCLID);
            clidMap.put(VALUE, gclid);
        } else {
            for (Map.Entry<String, List<String>> entry : params.entrySet()) {
                if (entry.getKey().endsWith(CLID)) {
                    clidMap.put(TYPE, entry.getKey());
                    clidMap.put(VALUE, getFirst(entry.getValue()));
                    break;
                }
            }
        }

        log.debug("clidMap: {}", clidMap);
        return clidMap;
    }

    private static String getFirst(final List<String> list) {
        return list != null && !list.isEmpty() && !list.get(0).isEmpty()? list.get(0) : null;
    }

    private static boolean isEmpty(final String v, final String emtpyValue) {
        return v == null || v.isEmpty() || v.equalsIgnoreCase(emtpyValue);
    }

    private static boolean isEmpty(final String v) {
        return v == null || v.isEmpty();
    }

    @Override
    public CategoryTrafficSource parse(final String pageUrl, final String pageReferrer, final String latestReferrer, final String latestReferrerHost) {
        log.debug("parser() enter pageUrl: {}, pageReferrer: {}, latestReferrer: {}, latestReferrerHost: {}", pageUrl, pageReferrer, latestReferrer, latestReferrerHost);

        String cachedKey = String.join("|", pageUrl, pageReferrer, latestReferrer);
        if (CACHED_CATEGORY_TRAFFIC_SOURCE.containsKey(cachedKey)) {
            return CACHED_CATEGORY_TRAFFIC_SOURCE.get(cachedKey);
        }
        TrafficSourceUtm trafficSourceUtm = new TrafficSourceUtm();

        if (pageUrl != null && !pageUrl.isEmpty()) {
            trafficSourceUtm = getUtmSourceFromUrl(pageUrl);
        }
        CategoryTrafficSource result = parse(trafficSourceUtm, pageReferrer, latestReferrer, latestReferrerHost);
        CACHED_CATEGORY_TRAFFIC_SOURCE.put(cachedKey, result);
        return result;
    }

    private TrafficSourceUtm getUtmSourceFromUrl(final String urlInput) {
        TrafficSourceUtm trafficSourceUtm = new TrafficSourceUtm();
        if (urlInput == null || urlInput.isEmpty()) {
            return trafficSourceUtm;
        }

        String url = urlInput;
        if (!urlInput.contains("://")) {
            url = "http://" + url;
        }

        Map<String, List<String>> params = getUriParams(url);
        String utmId = getFirst(params.get("utm_id"));
        String utmSource = getFirst(params.get("utm_source"));
        String utmMedium = getFirst(params.get("utm_medium"));
        String utmContent = getFirst(params.get("utm_content"));
        String utmTerm = getFirst(params.get("utm_term"));
        String gclid = getFirst(params.get(GCLID));
        String utmCampaign = getFirst(params.get("utm_campaign"));
        String utmSourcePlatform = getFirst(params.get("utm_source_platform"));

        log.debug("utmSource: {}, utmMedium: {}, utmContent: {}, utmTerm: {}, utmCampaign: {}, utmId: {}, utmSourcePlatform: {}, gclid: {}",
                utmSource, utmMedium, utmContent, utmTerm, utmCampaign, utmId, utmSourcePlatform, gclid);

        Map<String, String> clidMap = createClidTypeValueMap(gclid, params);

        String clidType = clidMap.get(TYPE);

        if (utmSource == null && clidType != null && KNOWN_CLID_TO_MEDIUM_MAP.containsKey(clidType)) {
            utmSource = KNOWN_CLID_TO_MEDIUM_MAP.get(clidType).getSource();
            if (utmMedium == null) {
                utmMedium = KNOWN_CLID_TO_MEDIUM_MAP.get(clidType).getMedium();
            }
        }
        trafficSourceUtm.setSource(utmSource);
        trafficSourceUtm.setMedium(utmMedium);
        trafficSourceUtm.setCampaign(utmCampaign);
        trafficSourceUtm.setContent(utmContent);
        trafficSourceUtm.setTerm(utmTerm);
        trafficSourceUtm.setCampaignId(utmId);
        trafficSourceUtm.setClidPlatform(utmSourcePlatform);
        if (!clidMap.isEmpty()) {
            try {
                trafficSourceUtm.setClid(objectToJsonString(clidMap));
            } catch (JsonProcessingException e) {
                log.error("Error converting clidMap to string", e);
            }
        }
        return trafficSourceUtm;
    }

    public CategoryTrafficSource parse(final TrafficSourceUtm trafficSourceUtmInput, final String theReferrer, final String theReferrerHost) {
        log.debug("trafficSourceUtmInput: {}, theReferrer: {}, theReferrerHost: {}", trafficSourceUtmInput, theReferrer, theReferrerHost);
        TrafficSourceUtm trafficSourceUtm = normEmptyInTrafficSourceUtm(trafficSourceUtmInput);

        SourceCategoryAndTerms sourceCategoryAndTerms = this.categoryListEvaluator.evaluate(theReferrer);

        String source = sourceCategoryAndTerms.getSource();
        String terms = sourceCategoryAndTerms.getTerms();
        String category = sourceCategoryAndTerms.getCategory();

        log.debug("categoryListEvaluator source: {}, terms: {}, category: {}", source, terms, category);

        if (trafficSourceUtm.getSource() == null) {
            trafficSourceUtm.setSource(source);
        }
        if (trafficSourceUtm.getTerm() == null) {
            trafficSourceUtm.setTerm(terms);
        }

        String categoryForEval = category;
        if (CategoryListEvaluator.UNASSIGNED.equals(categoryForEval)) {
            categoryForEval = null;
        }

        if (trafficSourceUtm.getSource() != null && categoryForEval == null) {
            category = this.categoryListEvaluator.getCategoryBySource(trafficSourceUtm.getSource());
            log.debug("category is null/UNASSIGNED, trying to get category from source: {} -> category: {}", trafficSourceUtm.getSource(), category);
        }

        ChannelRuleEvaluatorInput evalInput = ChannelRuleEvaluatorInput.from(trafficSourceUtm, categoryForEval, theReferrer, theReferrerHost);
        String channel = this.channelListEvaluator.evaluate(evalInput);

        CategoryTrafficSource categoryTrafficSource = new CategoryTrafficSource(trafficSourceUtm, category, channel);

        if (categoryTrafficSource.getSource() == null) {
            if (theReferrer != null && !theReferrer.isEmpty()) {
                categoryTrafficSource.setSource(theReferrerHost);
            } else {
                categoryTrafficSource.setCampaign(DIRECT);
            }
        }
        log.debug("return categoryTrafficSource: {}", categoryTrafficSource);
        return categoryTrafficSource;

    }

    @Override
    public CategoryTrafficSource parse(final TrafficSourceUtm trafficSourceUtmInput, final String pageReferrer, final String latestReferrer, final String latestReferrerHost) {
        log.debug("parser() enter trafficSourceUtm: {}, pageReferrer: {}, latestReferrer: {}, latestReferrerHost: {}", trafficSourceUtmInput, pageReferrer, latestReferrer, latestReferrerHost);

        String catchKey = String.join("|", trafficSourceUtmInput.hashCode() + "", pageReferrer, latestReferrer);
        if (CACHED_CATEGORY_TRAFFIC_SOURCE.containsKey(catchKey)) {
            return CACHED_CATEGORY_TRAFFIC_SOURCE.get(catchKey);
        }
        TrafficSourceUtm trafficSourceUtm = normEmptyInTrafficSourceUtm(trafficSourceUtmInput);

        if (trafficSourceUtm.getSource() == null) {
            trafficSourceUtm = getUtmSourceFromUrl(latestReferrer);
        }

        if (trafficSourceUtm.getSource() == null) {
            trafficSourceUtm = getUtmSourceFromUrl(pageReferrer);
        }

        String theReferrer = null;
        String theReferrerHost = null;
        CategoryTrafficSource categoryTrafficSource = null;

        if (latestReferrer != null && !latestReferrer.isEmpty()) {
            theReferrer = latestReferrer;
            theReferrerHost = latestReferrerHost;
            categoryTrafficSource = parse(trafficSourceUtm, theReferrer, theReferrerHost);
        } else if (pageReferrer != null && !pageReferrer.isEmpty()) {
            theReferrer = pageReferrer;
            theReferrerHost = parseUrl(theReferrer).getHostName();
            categoryTrafficSource = parse(trafficSourceUtm, theReferrer, theReferrerHost);
        } else {
            categoryTrafficSource = parse(trafficSourceUtm, null, null);
        }

        if (categoryTrafficSource.getSource() != null) {
            if (categoryTrafficSource.getCategory() == null) {
                categoryTrafficSource.setCategory(CategoryListEvaluator.UNASSIGNED);
            }
            if (categoryTrafficSource.getChannelGroup() == null) {
                categoryTrafficSource.setChannelGroup(ChannelListEvaluator.UNASSIGNED);
            }
        }

        if (categoryTrafficSource.getSource() == null) {
            categoryTrafficSource.setSource(DIRECT);
            categoryTrafficSource.setCategory(DIRECT);
            categoryTrafficSource.setChannelGroup(DIRECT);
        }

        if (categoryTrafficSource.getMedium() == null) {
            categoryTrafficSource.setMedium(categoryTrafficSource.getChannelGroup());
        }
        CACHED_CATEGORY_TRAFFIC_SOURCE.put(catchKey, categoryTrafficSource);

        return categoryTrafficSource;
    }

    private TrafficSourceUtm normEmptyInTrafficSourceUtm(final TrafficSourceUtm trafficSourceUtmInput) {

        TrafficSourceUtm trafficSourceUtm = new TrafficSourceUtm();
        if (trafficSourceUtmInput == null) {
            return trafficSourceUtm;
        }

        if (!isEmpty(trafficSourceUtmInput.getSource(), DIRECT)) {
            trafficSourceUtm.setSource(trafficSourceUtmInput.getSource());
        }
        if (!isEmpty(trafficSourceUtmInput.getMedium(), DIRECT)) {
            trafficSourceUtm.setMedium(trafficSourceUtmInput.getMedium());
        }
        if (!isEmpty(trafficSourceUtmInput.getCampaign(), DIRECT)) {
            trafficSourceUtm.setCampaign(trafficSourceUtmInput.getCampaign());
        }
        if (!isEmpty(trafficSourceUtmInput.getContent())) {
            trafficSourceUtm.setContent(trafficSourceUtmInput.getContent());
        }
        if (!isEmpty(trafficSourceUtmInput.getTerm())) {
            trafficSourceUtm.setTerm(trafficSourceUtmInput.getTerm());
        }
        if (!isEmpty(trafficSourceUtmInput.getCampaignId())) {
            trafficSourceUtm.setCampaignId(trafficSourceUtmInput.getCampaignId());
        }
        if (!isEmpty(trafficSourceUtmInput.getClidPlatform())) {
            trafficSourceUtm.setClidPlatform(trafficSourceUtmInput.getClidPlatform());
        }
        if (!isEmpty(trafficSourceUtmInput.getClid(), "{}")) {
            trafficSourceUtm.setClid(trafficSourceUtmInput.getClid());
        }
        return trafficSourceUtm;
    }

}
