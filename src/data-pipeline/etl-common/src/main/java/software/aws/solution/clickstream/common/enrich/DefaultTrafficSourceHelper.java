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
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import software.aws.solution.clickstream.common.enrich.ts.CategoryTrafficSource;
import software.aws.solution.clickstream.common.enrich.ts.SourceMedium;
import software.aws.solution.clickstream.common.enrich.ts.TrafficSource;
import software.aws.solution.clickstream.common.enrich.ts.TrafficSourceHelper;
import software.aws.solution.clickstream.common.enrich.ts.TrafficSourceParserResult;
import software.aws.solution.clickstream.common.model.UriInfo;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static software.aws.solution.clickstream.common.Util.ERROR_LOG;
import static software.aws.solution.clickstream.common.Util.getUriParams;


@Slf4j
public final class DefaultTrafficSourceHelper implements TrafficSourceHelper {

    public static final String GCLID = "gclid";
    public static final String TYPE = "type";
    public static final String VALUE = "value";
    public static final String CLID = "clid";
    public static final String DIRECT = "direct";
    public static final String PAID_SEARCH = "Paid Search";
    public static final String PAID_SOCIAL = "Paid Social";
    public static final String PAID_SHOPPING = "Paid Shopping";
    public static final String ORGANIC_LOWCASE = "organic";
    public static final String SEARCH = "search";
    public static final String SOCIAL = "social";
    public static final String SHOPPING = "shopping";
    public static final String SCOCIAL = "scocial";
    public static final String VIDEO = "video";
    public static final String CPC = "cpc";
    public static final String DISPLAY = "display";
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
    public static final String TRIPADVISOR = "tripadvisor";
    public static final String ANGIESLIST = "angieslist";
    public static final String NEXTDOOR = "nextdoor";
    private static final DefaultTrafficSourceHelper INSTANCE = new DefaultTrafficSourceHelper();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private DefaultTrafficSourceHelper() {
    }

    public static DefaultTrafficSourceHelper getInstance() {
        return INSTANCE;
    }

    public static String getCategory(final String utmSource) {
        Map<String, String> sourceToCategoryMap = getSourceToCategoryMap();
        return sourceToCategoryMap.get(utmSource);
    }

    private static Map<String, String> getClidTypeValueMap(final String gclid, final Map<String, List<String>> params) {
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

        log.info("clidMap: {}", clidMap);
        return clidMap;
    }

    private static Map<String, String> convertToStringMap(final Map<String, List<String>> params) {
        Map<String, String> stringMap = new HashMap<>();
        for (Map.Entry<String, List<String>> entry : params.entrySet()) {
            stringMap.put(entry.getKey(), String.join(",", entry.getValue()));
        }
        return stringMap;
    }

    public static String getChannelGroup(final String utmSource, final String utmCampaign, final String utmMedium) {
        List<String> paidSearchSites = getPaidSearchSites();
        List<String> paidSocialSites = getPaidSocialSites();
        List<String> paidShoppingSites = getPaidShoppingSites();

        log.info("getChannelGroup - utmSource: {}, utmCampaign: {}, utmMedium: {}", utmSource, utmCampaign, utmMedium);

        // 'cpc', 'ppc', 'retargeting', 'paid'
        List<String> mediumList = Arrays.asList("cpc", "ppc", "retargeting", "paid");

        String utmMediumLowercase = utmMedium;
        if (utmMedium != null) {
            utmMediumLowercase = utmMedium.toLowerCase();
        }

        String channelGroup = null;
        if (paidShoppingSites.contains(utmSource)
                || (utmCampaign != null && utmCampaign.toLowerCase().contains("shop")
                && mediumList.contains(utmMediumLowercase))) {
            channelGroup = PAID_SHOPPING;
        } else if (paidSearchSites.contains(utmSource) && mediumList.contains(utmMediumLowercase)) {
            channelGroup = PAID_SEARCH;
        } else if (paidSocialSites.contains(utmSource) && mediumList.contains(utmMediumLowercase)) {
            channelGroup = PAID_SOCIAL;
        }
        return channelGroup;
    }


    private static String getFirst(final List<String> list) {
        return list != null && !list.isEmpty() ? list.get(0) : null;
    }

    private static Map<String, SourceMedium> getClidTypeToSourceMediumMap() {
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

    private static Map<String, SourceMedium> getHostSuffixToSourceMediumMap() {
        Map<String, SourceMedium> hostToSourceMediumMap = new HashMap<>();
        hostToSourceMediumMap.put("google.com", new SourceMedium(GOOGLE, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("facebook.com", new SourceMedium(FACEBOOK, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("microsoft.com", new SourceMedium(MICROSOFT, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("twitter.com", new SourceMedium(TWITTER, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("pinterest.com", new SourceMedium(PINTEREST, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("linkedin.com", new SourceMedium(LINKEDIN, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("youtube.com", new SourceMedium(YOUTUBE, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("tiktok.com", new SourceMedium(TIKTOK, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("bing.com", new SourceMedium(BING, ORGANIC_LOWCASE));
        hostToSourceMediumMap.put("baidu.com", new SourceMedium(BAIDU, ORGANIC_LOWCASE));
        return hostToSourceMediumMap;
    }

    private static Map<String, String> getSourceToCategoryMap() {
        Map<String, String> sourceToCategoryMap = new HashMap<>();
        sourceToCategoryMap.put(GOOGLE, SEARCH);
        sourceToCategoryMap.put(BING, SEARCH);
        sourceToCategoryMap.put("yahoo", SEARCH);
        sourceToCategoryMap.put(BAIDU, SEARCH);
        sourceToCategoryMap.put("yandex", SEARCH);
        sourceToCategoryMap.put("naver", SEARCH);
        sourceToCategoryMap.put("daum", SEARCH);
        sourceToCategoryMap.put("sogou", SEARCH);
        sourceToCategoryMap.put("duckduckgo", SEARCH);
        sourceToCategoryMap.put("ecosia", SEARCH);
        sourceToCategoryMap.put("aol", SEARCH);
        sourceToCategoryMap.put("ask", SEARCH);
        sourceToCategoryMap.put(FACEBOOK, SOCIAL);
        sourceToCategoryMap.put("instagram", SOCIAL);
        sourceToCategoryMap.put(TWITTER, SOCIAL);
        sourceToCategoryMap.put(LINKEDIN, SOCIAL);
        sourceToCategoryMap.put(PINTEREST, SOCIAL);
        sourceToCategoryMap.put(TIKTOK, SOCIAL);
        sourceToCategoryMap.put("snapchat", SOCIAL);
        sourceToCategoryMap.put(YOUTUBE, SOCIAL);
        sourceToCategoryMap.put("vimeo", SOCIAL);
        sourceToCategoryMap.put("flickr", SOCIAL);
        sourceToCategoryMap.put("tumblr", SOCIAL);
        sourceToCategoryMap.put("reddit", SOCIAL);
        sourceToCategoryMap.put("quora", SOCIAL);
        sourceToCategoryMap.put("digg", SOCIAL);
        sourceToCategoryMap.put("delicious", SOCIAL);
        sourceToCategoryMap.put("stumbleupon", SOCIAL);
        sourceToCategoryMap.put("myspace", SOCIAL);
        sourceToCategoryMap.put("hi5", SOCIAL);
        sourceToCategoryMap.put("tagged", SOCIAL);
        sourceToCategoryMap.put("meetup", SOCIAL);
        sourceToCategoryMap.put("meetme", SOCIAL);
        sourceToCategoryMap.put("vk", SOCIAL);
        sourceToCategoryMap.put("weibo", SOCIAL);
        sourceToCategoryMap.put("wechat", SOCIAL);
        sourceToCategoryMap.put("qq", SOCIAL);
        sourceToCategoryMap.put("renren", SOCIAL);
        sourceToCategoryMap.put("kaixin", SOCIAL);
        sourceToCategoryMap.put("douban", SOCIAL);
        sourceToCategoryMap.put("mixi", SOCIAL);
        sourceToCategoryMap.put("cyworld", SOCIAL);
        sourceToCategoryMap.put("orkut", SOCIAL);
        sourceToCategoryMap.put("bebo", SOCIAL);
        sourceToCategoryMap.put("friendster", SOCIAL);
        sourceToCategoryMap.put("xanga", SOCIAL);
        sourceToCategoryMap.put("livejournal", SOCIAL);
        sourceToCategoryMap.put("plurk", SOCIAL);
        sourceToCategoryMap.put("foursquare", SOCIAL);
        sourceToCategoryMap.put("yelp", SOCIAL);
        sourceToCategoryMap.put(TRIPADVISOR, SOCIAL);
        sourceToCategoryMap.put(ANGIESLIST, SOCIAL);
        sourceToCategoryMap.put(NEXTDOOR, SOCIAL);
        sourceToCategoryMap.put("amazon", SHOPPING);
        sourceToCategoryMap.put("ebay", SHOPPING);
        sourceToCategoryMap.put("etsy", SHOPPING);
        sourceToCategoryMap.put("aliexpress", SHOPPING);
        sourceToCategoryMap.put("walmart", SHOPPING);
        sourceToCategoryMap.put("bestbuy", SHOPPING);
        sourceToCategoryMap.put("target", SHOPPING);
        sourceToCategoryMap.put("overstock", SHOPPING);
        sourceToCategoryMap.put("wayfair", SHOPPING);
        sourceToCategoryMap.put("homedepot", SHOPPING);
        return sourceToCategoryMap;

    }

    public static List<String> getPaidShoppingSites() {
        return Arrays.asList("amazon", "ebay", "etsy", "aliexpress", "walmart", "bestbuy", "target", "overstock", "wayfair", "homedepot", "lowes", "costco",
                "sears", "kmart", "macys", "nordstrom");
    }

    public static List<String> getPaidSearchSites() {
        return Arrays.asList(GOOGLE, BING, "yahoo", BAIDU, "yandex", "naver", "daum", "sogou", "duckduckgo", "ecosia", "aol", "ask", "dogpile",
                "excite", "lycos", "webcrawler", "info",
                "infospace", SEARCH, "searchlock", "searchencrypt", "searchy");
    }

    public static List<String> getPaidSocialSites() {
        return Arrays.asList(FACEBOOK, "instagram", TWITTER, LINKEDIN, PINTEREST, TIKTOK, "snapchat", YOUTUBE, "vimeo", "flickr", "tumblr", "reddit", "quora",
                "digg", "delicious", "stumbleupon", "myspace", "hi5", "tagged", "meetup", "meetme", "vk", "weibo", "wechat", "qq", "renren", "kaixin", "douban", "mixi",
                "cyworld", "orkut", "bebo", "friendster", "xanga", "livejournal", "plurk", "foursquare", "yelp", TRIPADVISOR, ANGIESLIST, NEXTDOOR,
                "yelp", TRIPADVISOR, ANGIESLIST, NEXTDOOR);
    }

    private static UriInfo getUriInfo(final URI uri, final Map<String, List<String>> params) {
        String host = uri.getHost();
        String path = uri.getPath();
        String query = uri.getQuery();
        String protocol = uri.getScheme();

        log.info("params: {}", params);

        UriInfo uriInfo = new UriInfo();
        uriInfo.setProtocol(protocol);
        uriInfo.setHost(host);
        if (path != null && !path.isEmpty() && !path.equals("/")) {
            uriInfo.setPath(path);
        }
        uriInfo.setQuery(query);
        if (!params.isEmpty()) {
            uriInfo.setParameters(convertToStringMap(params));
        }
        return uriInfo;
    }

    @Override
    public CategoryTrafficSource getCategoryTrafficSource(final TrafficSource trafficSource) {
        if (trafficSource == null || trafficSource.getSource() == null) {
            return null;
        }
        String category = getCategory(trafficSource.getSource());
        String channelGroup = getChannelGroup(trafficSource.getSource(), trafficSource.getCampaign(), trafficSource.getMedium());
        return new CategoryTrafficSource(trafficSource, channelGroup, category);
    }

    @Override
    public TrafficSourceParserResult parse(final String inputUrl, final String referrer) {
        String url = inputUrl;
        if (url == null) {
            url = "";
        }

        if (!url.isEmpty() && !url.substring(0, Math.min(10, url.length())).contains("://")) {
            url = "http://" + url;
        }

        URI uri = null;
        try {
            uri = new URI(url);
        } catch (URISyntaxException e) {
            log.error("cannot parse url: " + url + ERROR_LOG + e.getMessage());
        }

        UriInfo uriInfo = null;
        TrafficSource trafficSource = new TrafficSource();

        if (uri != null) {
            Map<String, List<String>> params = getUriParams(uri);
            uriInfo = getUriInfo(uri, params);
            // Extract the UTM parameters from the params map
            trafficSource = getTrafficSourceFromUri(params);
        }

        if (trafficSource.getSource() == null && referrer != null) {
            trafficSource = getTrafficSourceFromReferrer(referrer);
        }

        if (trafficSource.getSource() == null) {
            trafficSource.setSource(DIRECT);
            trafficSource.setCampaign(DIRECT);
        }

        CategoryTrafficSource categoryTrafficSource = getCategoryTrafficSource(trafficSource);

        log.info("trafficSource: {}", trafficSource);
        log.info("uriInfo: {}", uriInfo);

        return new TrafficSourceParserResult(categoryTrafficSource, uriInfo);
    }

    private TrafficSource getTrafficSourceFromUri(final Map<String, List<String>> params) {
        TrafficSource trafficSource = new TrafficSource();

        String utmId = getFirst(params.get("utm_id"));
        String utmSource = getFirst(params.get("utm_source"));
        String utmMedium = getFirst(params.get("utm_medium"));
        String utmContent = getFirst(params.get("utm_content"));
        String utmTerm = getFirst(params.get("utm_term"));
        String gclid = getFirst(params.get(GCLID));
        String utmCampaign = getFirst(params.get("utm_campaign"));
        String utmSourcePlatform = getFirst(params.get("utm_source_platform"));
        String queryQ = null;
        if (params.containsKey("q")) {
            queryQ = String.join(",", params.get("q"));
        }
        log.info("utmSource: {}, utmMedium: {}, utmContent: {}, utmTerm: {}, utmCampaign: {}, utmId: {}, utmSourcePlatform: {}, queryQ: {}, gclid: {}",
                utmSource, utmMedium, utmContent, utmTerm, utmCampaign, utmId, utmSourcePlatform, queryQ, gclid);


        Map<String, String> clidMap = getClidTypeValueMap(gclid, params);

        String clidType = clidMap.get(TYPE);
        Map<String, SourceMedium> clidToMediumMap = getClidTypeToSourceMediumMap();


        if (utmSource == null && clidType != null && clidToMediumMap.containsKey(clidType)) {
            utmSource = clidToMediumMap.get(clidType).getSource();
            utmMedium = clidToMediumMap.get(clidType).getMedium();
        }

        if (utmSource != null && utmTerm == null) {
            utmTerm = queryQ;
        }

        trafficSource.setSource(utmSource);
        trafficSource.setMedium(utmMedium);
        trafficSource.setCampaign(utmCampaign);
        trafficSource.setContent(utmContent);
        trafficSource.setTerm(utmTerm);
        trafficSource.setCampaignId(utmId);
        trafficSource.setClidPlatform(utmSourcePlatform);
        if (!clidMap.isEmpty()) {
            try {
                trafficSource.setClid(OBJECT_MAPPER.writeValueAsString(clidMap));
            } catch (JsonProcessingException e) {
                log.error("Error converting clidMap to string", e);
            }
        }
        return trafficSource;
    }

    private TrafficSource getTrafficSourceFromReferrer(final String referrer) {
        TrafficSource trafficSource = new TrafficSource();
        String utmSource = null;
        String utmMedium = null;
        String utmContent = null;

        Map<String, SourceMedium> hostSuffixToMediumMap = getHostSuffixToSourceMediumMap();
        URI referrerUri = null;
        try {
            referrerUri = new URI(referrer);
        } catch (URISyntaxException e) {
            log.error("cannot parse referrer: " + referrer + ERROR_LOG + e.getMessage());
            return trafficSource;
        }
        String referrerHost = referrerUri.getHost();
        if (referrerHost != null) {
            for (Map.Entry<String, SourceMedium> entry : hostSuffixToMediumMap.entrySet()) {
                String hostSuffix = entry.getKey();
                if (referrerHost.contains(hostSuffix)) {
                    utmSource = hostSuffixToMediumMap.get(hostSuffix).getSource();
                    utmMedium = hostSuffixToMediumMap.get(hostSuffix).getMedium();
                    break;
                }
            }
            if (utmSource == null) {
                utmSource = referrerHost;
                utmMedium = "referral";
                utmContent = referrer;
            }
        }

        trafficSource.setSource(utmSource);
        trafficSource.setMedium(utmMedium);
        trafficSource.setContent(utmContent);

        return trafficSource;

    }

}
