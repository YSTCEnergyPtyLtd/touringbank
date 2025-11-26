// API Configuration
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Load saved configurations
let currentProvider = localStorage.getItem('llm_provider') || 'gemini';
let GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || '';
let OPENAI_API_KEY = localStorage.getItem('openai_api_key') || '';

// Cache configuration
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_PREFIX = 'concert_cache_';

// State management
let currentConcerts = [];
let currentSort = { key: 'date', direction: 'desc' };
let isTableExpanded = false;
let latestOverviewData = null;
let latestOverviewRegion = null;
let regionStatus = {
    '北美': 'pending',
    '欧洲': 'pending',
    '中国大陆': 'pending',
    '港台': 'pending',
    '日韩': 'pending',
    '东南亚': 'pending',
    '大洋洲': 'pending'
};
let regionCounts = {
    '北美': 0,
    '欧洲': 0,
    '中国大陆': 0,
    '港台': 0,
    '日韩': 0,
    '东南亚': 0,
    '大洋洲': 0
};
let regionVenueCounts = {
    '北美': { stadium: 0, arena: 0, theater: 0, livehouse: 0 },
    '欧洲': { stadium: 0, arena: 0, theater: 0, livehouse: 0 },
    '中国大陆': { stadium: 0, arena: 0, theater: 0, livehouse: 0 },
    '港台': { stadium: 0, arena: 0, theater: 0, livehouse: 0 },
    '日韩': { stadium: 0, arena: 0, theater: 0, livehouse: 0 },
    '东南亚': { stadium: 0, arena: 0, theater: 0, livehouse: 0 },
    '大洋洲': { stadium: 0, arena: 0, theater: 0, livehouse: 0 }
};

const translations = {
    zh: {
        nav: {
            subtitle: '巡演项目详情',
            apiSettings: 'API设置',
            login: '登录',
            myList: '我的清单',
            logout: '退出登录'
        },
        common: {
            loading: '加载中...',
            noData: '暂无数据',
            noConcerts: '暂无演出数据',
            notAvailable: '无',
            fetching: '正在获取数据...',
            loadingTimeline: '正在加载巡演轨迹...',
            timelineEmpty: '暂无演出数据',
            selectRegion: '请选择区域'
        },
        alerts: {
            apiSaved: 'API配置已保存',
            clearCacheConfirm: '确定要清除所有缓存数据吗?',
            cacheCleared: '缓存已清除',
            apiKeyRequired: '需要配置 {provider} API Key 以获取实时数据。是否现在配置?'
        },
        overview: {
            statusDate: '日期确认',
            statusOverview: '概览查询',
            statusOverviewDone: '概览完成',
            statusSummary: '完成',
            isTouring: '是否在巡演',
            currentTheme: '当前巡演主题',
            scale: '巡演规模',
            frequency: '巡演频次',
            themeSpan: '主题跨度',
            targetRegion: '目标区域',
            futureToursSuffix: '未来是否有巡演',
            plannedCities: '计划巡演城市'
        },
        status: {
            regionLoading: '区域数据加载状态'
        },
        rankings: {
            concertTitle: '演出场次排名',
            venueTitle: '场馆类型分布',
            venueHint: '点击地图区域查看',
            venuePlaceholder: '请选择区域',
            capacityTitle: '平均场馆容量排名'
        },
        timeline: {
            title: '巡演轨迹',
            loading: '正在加载巡演轨迹...',
            noData: '暂无演出数据',
            noFuture: '暂无未来演出'
        },
        table: {
            date: '演出日期',
            weekday: '星期',
            theme: '巡演主题',
            region: '地区',
            city: '城市',
            venue: '场馆',
            capacity: '容量',
            priceRange: '票价区间',
            ticketSale: '开票时间',
            soldOut: '售罄时间',
            saleSpeed: '售票速度',
            organizer: '主办方',
            attendance: '上座率',
            status: '状态',
            loadMore: '加载更多',
            noData: '暂无演出数据',
            statusPast: '已完成',
            statusUpcoming: '即将开始',
            statusToday: '进行中'
        },
        modal: {
            title: 'LLM API 配置',
            subtitle: '选择 LLM 提供商并输入对应的 API 密钥',
            providerLabel: 'LLM 提供商',
            providerGemini: 'Gemini (Google Search 支持)',
            providerOpenAI: 'OpenAI (GPT-4)',
            geminiLabel: 'Gemini API Key',
            geminiPlaceholder: '输入 Gemini API Key',
            openaiLabel: 'OpenAI API Key',
            openaiPlaceholder: '输入 OpenAI API Key',
            clearCache: '清除缓存',
            cancel: '取消',
            save: '保存'
        },
        page: {
            titleSuffix: '项目详情'
        },
        main: {
            loadingTitle: '加载中...'
        }
    },
    en: {
        nav: {
            subtitle: 'Touring Project Overview',
            apiSettings: 'API Settings',
            login: 'Log In',
            myList: 'My List',
            logout: 'Sign Out'
        },
        common: {
            loading: 'Loading...',
            noData: 'No data',
            noConcerts: 'No concert data available',
            notAvailable: 'N/A',
            fetching: 'Fetching data...',
            loadingTimeline: 'Loading tour timeline...',
            timelineEmpty: 'No tour data available',
            selectRegion: 'Select a region'
        },
        alerts: {
            apiSaved: 'API configuration saved',
            clearCacheConfirm: 'Clear all cached data?',
            cacheCleared: 'Cache cleared',
            apiKeyRequired: 'You need to configure the {provider} API key to fetch live data. Configure now?'
        },
        overview: {
            statusDate: 'Date verification',
            statusOverview: 'Overview fetch',
            statusOverviewDone: 'Overview ready',
            statusSummary: 'done',
            isTouring: 'Currently touring',
            currentTheme: 'Current tour theme',
            scale: 'Tour scale',
            frequency: 'Tour frequency',
            themeSpan: 'Theme span',
            targetRegion: 'Target region',
            futureToursSuffix: 'future plans',
            plannedCities: 'Planned cities'
        },
        status: {
            regionLoading: 'Regional data status'
        },
        rankings: {
            concertTitle: 'Concert count ranking',
            venueTitle: 'Venue mix',
            venueHint: 'Click a region on the map',
            venuePlaceholder: 'Please select a region',
            capacityTitle: 'Average capacity ranking'
        },
        timeline: {
            title: 'Tour timeline',
            loading: 'Loading timeline...',
            noData: 'No tour data available',
            noFuture: 'No upcoming shows'
        },
        table: {
            date: 'Date',
            weekday: 'Weekday',
            theme: 'Tour theme',
            region: 'Region',
            city: 'City',
            venue: 'Venue',
            capacity: 'Capacity',
            priceRange: 'Price range',
            ticketSale: 'On-sale date',
            soldOut: 'Sell-out date',
            saleSpeed: 'Sale speed',
            organizer: 'Promoter',
            attendance: 'Attendance',
            status: 'Status',
            loadMore: 'Show more',
            noData: 'No concerts to display',
            statusPast: 'Completed',
            statusUpcoming: 'Upcoming',
            statusToday: 'Today'
        },
        modal: {
            title: 'LLM API Settings',
            subtitle: 'Choose a provider and enter the API key',
            providerLabel: 'LLM provider',
            providerGemini: 'Gemini (with Google Search)',
            providerOpenAI: 'OpenAI (GPT-4)',
            geminiLabel: 'Gemini API Key',
            geminiPlaceholder: 'Enter Gemini API Key',
            openaiLabel: 'OpenAI API Key',
            openaiPlaceholder: 'Enter OpenAI API Key',
            clearCache: 'Clear cache',
            cancel: 'Cancel',
            save: 'Save'
        },
        page: {
            titleSuffix: 'Project Details'
        },
        main: {
            loadingTitle: 'Loading...'
        }
    }
};

const REGION_LABELS = {
    '北美': { zh: '北美', en: 'North America' },
    '欧洲': { zh: '欧洲', en: 'Europe' },
    '中国大陆': { zh: '中国大陆', en: 'Mainland China' },
    '港台': { zh: '港台', en: 'Hong Kong & Taiwan' },
    '日韩': { zh: '日韩', en: 'Japan & Korea' },
    '东南亚': { zh: '东南亚', en: 'Southeast Asia' },
    '大洋洲': { zh: '大洋洲', en: 'Oceania' },
    '全球': { zh: '全球', en: 'Global' }
};

const VENUE_LABELS = {
    stadium: { zh: '体育场', en: 'Stadium' },
    arena: { zh: '体育馆', en: 'Arena' },
    theater: { zh: '剧院', en: 'Theater' },
    livehouse: { zh: 'Live House', en: 'Live House' }
};

let currentLanguage = localStorage.getItem('userpage_lang') || 'zh';

function t(key, fallback) {
    const keys = key.split('.');
    let result = translations[currentLanguage];
    for (const segment of keys) {
        if (result && Object.prototype.hasOwnProperty.call(result, segment)) {
            result = result[segment];
        } else {
            result = undefined;
            break;
        }
    }
    if (result === undefined) {
        result = translations.zh;
        for (const segment of keys) {
            if (result && Object.prototype.hasOwnProperty.call(result, segment)) {
                result = result[segment];
            } else {
                result = undefined;
                break;
            }
        }
    }
    if (result === undefined) {
        return fallback !== undefined ? fallback : key;
    }
    return result;
}

function getRegionLabel(region) {
    if (!region) return t('common.notAvailable');
    const label = REGION_LABELS[region];
    return label ? (currentLanguage === 'en' ? label.en : label.zh) : region;
}

function getVenueLabel(type) {
    const label = VENUE_LABELS[type];
    return label ? (currentLanguage === 'en' ? label.en : label.zh) : type;
}

function getNotAvailableText() {
    return t('common.notAvailable', 'N/A');
}

function applyTranslations() {
    document.documentElement.setAttribute('lang', currentLanguage === 'en' ? 'en' : 'zh');
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (text) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = t(key);
        if (text) el.setAttribute('placeholder', text);
    });
    document.querySelectorAll('[data-region-label]').forEach(el => {
        const original = el.getAttribute('data-region-label');
        el.textContent = getRegionLabel(original);
    });
    const toggleLabel = document.getElementById('languageToggleLabel');
    if (toggleLabel) {
        toggleLabel.textContent = currentLanguage === 'zh' ? '切换英文' : 'Switch to Chinese';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    const toggle = document.getElementById('languageToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
            localStorage.setItem('userpage_lang', currentLanguage);
            location.reload();
        });
    }
});

// UI Elements
const apiKeyBtn = document.getElementById('apiKeyBtn');
const apiKeyModal = document.getElementById('apiKeyModal');
const cancelApiKey = document.getElementById('cancelApiKey');
const saveApiKey = document.getElementById('saveApiKey');
const llmProvider = document.getElementById('llmProvider');
const geminiKeySection = document.getElementById('geminiKeySection');
const openaiKeySection = document.getElementById('openaiKeySection');
const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
const openaiApiKeyInput = document.getElementById('openaiApiKeyInput');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const loadingIndicator = document.getElementById('loadingIndicator');

// Event Listeners for API Settings
if (apiKeyBtn) apiKeyBtn.addEventListener('click', () => apiKeyModal.classList.remove('hidden'));
if (cancelApiKey) cancelApiKey.addEventListener('click', () => apiKeyModal.classList.add('hidden'));

if (llmProvider) {
    llmProvider.value = currentProvider;
    updateProviderUI();
    llmProvider.addEventListener('change', () => {
        currentProvider = llmProvider.value;
        updateProviderUI();
    });
}

if (geminiApiKeyInput) geminiApiKeyInput.value = GEMINI_API_KEY;
if (openaiApiKeyInput) openaiApiKeyInput.value = OPENAI_API_KEY;

function updateProviderUI() {
    if (currentProvider === 'gemini') {
        geminiKeySection.classList.remove('hidden');
        openaiKeySection.classList.add('hidden');
    } else {
        geminiKeySection.classList.add('hidden');
        openaiKeySection.classList.remove('hidden');
    }
}

if (saveApiKey) {
    saveApiKey.addEventListener('click', () => {
        GEMINI_API_KEY = geminiApiKeyInput.value.trim();
        OPENAI_API_KEY = openaiApiKeyInput.value.trim();

        localStorage.setItem('llm_provider', currentProvider);
        localStorage.setItem('gemini_api_key', GEMINI_API_KEY);
        localStorage.setItem('openai_api_key', OPENAI_API_KEY);

        apiKeyModal.classList.add('hidden');
        alert(t('alerts.apiSaved'));
        location.reload();
    });
}

if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
        if (confirm(t('alerts.clearCacheConfirm'))) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            alert(t('alerts.cacheCleared'));
            location.reload();
        }
    });
}

// API Functions
async function callLLMAPI(prompt) {
    const apiKey = currentProvider === 'gemini' ? GEMINI_API_KEY : OPENAI_API_KEY;
    if (!apiKey) {
        console.error('No API Key provided');
        return null;
    }

    if (currentProvider === 'gemini') {
        try {
            const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ google_search: {} }]
                })
            });
            const data = await response.json();
            if (data.error) {
                console.error('Gemini API Error:', data.error);
                return null;
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Request Failed:', error);
            return null;
        }
    } else {
        try {
            const response = await fetch(OPENAI_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            const data = await response.json();
            if (data.error) {
                console.error('OpenAI API Error:', data.error);
                return null;
            }
            return data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API Request Failed:', error);
            return null;
        }
    }
}

async function fetchWikipediaData(artist) {
    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(artist)}&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.query || !searchData.query.search.length) return null;

        const title = searchData.query.search[0].title;
        const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&explaintext&pithumbsize=500&titles=${encodeURIComponent(title)}&format=json&origin=*`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        const page = Object.values(detailsData.query.pages)[0];
        return {
            name: page.title,
            bio: page.extract,
            image: page.thumbnail ? page.thumbnail.source : null
        };
    } catch (error) {
        console.error('Wikipedia API Error:', error);
        return null;
    }
}

function updatePageWithWikipediaData(data) {
    if (!data) return;

    const nameEl = document.getElementById('artistName');
    if (nameEl) nameEl.textContent = data.name;

    const bioEl = document.getElementById('artistBio');
    if (bioEl) bioEl.textContent = data.bio ? data.bio.substring(0, 200) + '...' : '';

    const imgEl = document.querySelector('img[alt="Project Cover"]');
    if (imgEl && data.image) imgEl.src = data.image;
}

async function fetchTourOverview(artist, region, concerts) {
    const prompt = `【关键指令】请根据以下提供的${artist}在${region}地区的巡演数据(JSON格式)进行分析总结。
    
    巡演数据:
    ${JSON.stringify(concerts)}

    请分析以上数据并返回JSON格式(只返回JSON,不要其他文字):
    {
        "isTouringNow": "是/否 (判断逻辑: 查看整体是否有正在进行的演出，即日期在当前日期之后的)",
        "tourTheme": "当前巡演主题 (从数据中提取)",
        "hasFutureToursInRegion": "有/无 (判断逻辑: 查看该原则的区域是否有正在进行的，没有的写无)",
        "plannedCities": ["城市1", "城市2"] (判断逻辑: 对应计划巡演城市，如果没有未来演出则写'无'或空数组),
        "tourScale": "大/中/小 (根据跨越区域数量、场馆体量、场次数量综合判断，并注明横跨几个区域，不需要具体区域名称)",
        "tourFrequency": "巡演频次 (查询不同巡演主题的间隔时间)",
        "tourThemeSpan": "当前主题巡演横跨年份(例如: 2023-2024)"
    }`;

    try {
        const text = await callLLMAPI(prompt);
        if (!text) return null;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('Overview API Error:', error);
    }
    return null;
}

async function fetchRegionalTourData(artist, regionName, retryCount = 0) {
    const apiKey = currentProvider === 'gemini' ? GEMINI_API_KEY : OPENAI_API_KEY;
    if (!apiKey) return { region: regionName, concerts: [], totalCount: 0 };

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const threeYearsAgo = new Date(today);
    threeYearsAgo.setFullYear(today.getFullYear() - 3);
    const threeYearsAgoStr = `${threeYearsAgo.getFullYear()}-${String(threeYearsAgo.getMonth() + 1).padStart(2, '0')}-${String(threeYearsAgo.getDate()).padStart(2, '0')}`;

    const prompt = `【关键指令】你必须先使用Google Search查询"今天是几月几号"或"current date"来获取真实的当前日期。
不要使用你的知识库日期!必须通过Google Search获取实时日期!

第一步:使用Google Search查询当前真实日期
第二步:使用查询到的真实日期,然后查询${artist}在${regionName}地区的演出信息

时间范围限制:只查询近3年内(${threeYearsAgoStr}到真实当前日期之间)的数据。

请使用Google搜索,深入查找${artist}在${regionName}地区近3年内的演出信息。

第三步:在近3年内搜索所有演出,并统计总数
第四步:从搜索结果中,选择距离真实当前日期最近的5场演出(包括刚过去的和即将到来的)
第五步:统计该地区近3年内所有演出的场馆类型数量,分为4类:
- Stadium (体育场/大型露天场地,容量通常>25000)
- Arena (体育馆/大型室内场馆,容量通常5000-25000)
- Theater (剧院/中型场馆,容量通常500-5000)
- Live House (小型场地,容量通常<500)

重要:
1. 返回的5场演出应该是距离真实当前日期最近的,不是按时间顺序的前5场
2. 必须返回该地区在近3年内的总演出数量(totalCount)
3. 必须返回场馆类型的统计数据(venueCounts)

按照以下JSON格式返回(只返回JSON,不要其他文字):
{
  "totalCount": 该地区近3年内的总演出数量(数字),
  "venueCounts": {
    "stadium": 数字,
    "arena": 数字,
    "theater": 数字,
    "livehouse": 数字
  },
  "concerts": [
    {
      "date": "YYYY-MM-DD",
      "weekday": "星期几",
      "region": "地区(北美/欧洲/中国大陆/港台/日韩/东南亚/大洋洲)",
      "country": "国家名",
      "city": "城市名",
      "venue": "场馆名",
      "capacity": 数字,
      "priceRange": "最低价-最高价",
      "ticketSaleDate": "开票日期 YYYY-MM-DD",
      "soldOutDate": "售罄日期 YYYY-MM-DD(如未售罄填null)",
      "saleSpeed": "售票速度",
      "organizer": "主办方名称",
      "attendance": "上座率百分比",
      "tourTheme": "巡演主题"
    }
  ]
}

如果没有数据,返回:{"totalCount": 0, "venueCounts": {"stadium": 0, "arena": 0, "theater": 0, "livehouse": 0}, "concerts": []}

重要提醒:
1. 必须先通过Google Search获取真实当前日期
2. 只查询近3年内的演出(${threeYearsAgoStr}到真实当前日期)
3. totalCount是该地区近3年内的所有演出总数
4. concerts数组只包含距离当前日期最近的5场
5. venueCounts必须统计该地区近3年内的所有演出
6. 所有信息必须真实可查,来自Google搜索结果`;

    try {
        const text = await callLLMAPI(prompt);
        console.log(`${regionName} API Response:`, text);
        if (!text) return { region: regionName, concerts: [], totalCount: 0, venueCounts: { stadium: 0, arena: 0, theater: 0, livehouse: 0 } };

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error(`Invalid JSON for ${regionName}`);
            return { region: regionName, concerts: [], totalCount: 0, venueCounts: { stadium: 0, arena: 0, theater: 0, livehouse: 0 } };
        }

        const result = JSON.parse(jsonMatch[0]);
        return {
            region: regionName,
            concerts: result.concerts || [],
            totalCount: result.totalCount || 0,
            venueCounts: result.venueCounts || { stadium: 0, arena: 0, theater: 0, livehouse: 0 }
        };
    } catch (error) {
        console.error(`Error fetching ${regionName}:`, error);
        return { region: regionName, concerts: [], totalCount: 0, venueCounts: { stadium: 0, arena: 0, theater: 0, livehouse: 0 } };
    }
}

function updateRegionStatus(region, status) {
    regionStatus[region] = status;
    const statusEl = document.getElementById(`status-${region}`);
    if (!statusEl) return;

    const iconEl = statusEl.querySelector('i');

    if (status === 'loading') {
        iconEl.className = 'fas fa-circle-notch fa-spin text-blue-500 text-lg mb-1';
        statusEl.className = 'flex flex-col items-center p-2 bg-blue-50 rounded-lg shadow-sm transition-all';
    } else if (status === 'complete') {
        iconEl.className = 'fas fa-check-circle text-green-500 text-lg mb-1';
        statusEl.className = 'flex flex-col items-center p-2 bg-green-50 rounded-lg shadow-sm transition-all';
    } else if (status === 'none') {
        iconEl.className = 'fas fa-minus-circle text-gray-400 text-lg mb-1';
        statusEl.className = 'flex flex-col items-center p-2 bg-gray-50 rounded-lg shadow-sm transition-all';
    } else if (status === 'error') {
        iconEl.className = 'fas fa-exclamation-circle text-red-500 text-lg mb-1';
        statusEl.className = 'flex flex-col items-center p-2 bg-red-50 rounded-lg shadow-sm transition-all';
    }

    const completed = Object.values(regionStatus).filter(s => s === 'complete' || s === 'none').length;
    const total = Object.keys(regionStatus).length;
    const summaryEl = document.getElementById('statusSummary');
    if (summaryEl) {
        const suffix = t('overview.statusSummary', '完成');
        summaryEl.textContent = `${completed}/${total} ${suffix}`;
    }
}

function updateRegionalMap() {
    const rankings = Object.entries(regionCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([region, count]) => ({ region, count }));

    const rankingsContainer = document.getElementById('regional-rankings');
    if (rankingsContainer) {
        if (rankings.length === 0) {
            rankingsContainer.innerHTML = `<div class="text-center text-gray-400 text-xs py-4">${t('common.noData')}</div>`;
        } else {
            rankingsContainer.innerHTML = rankings.map((item, index) => `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100" onclick="updateVenueChart('${item.region}')">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-400">${index + 1}</span>
                        <span class="text-gray-600">${getRegionLabel(item.region)}</span>
                    </div>
                    <span class="font-bold text-gray-900">${item.count}</span>
                </div>
            `).join('');
        }
    }

    // Update Map Markers
    Object.entries(regionCounts).forEach(([region, count]) => {
        const marker = document.getElementById(`marker-${region}`);
        if (marker) {
            const countEl = marker.querySelector('.marker-count');
            if (countEl) countEl.textContent = count;

            if (count > 0) {
                marker.classList.remove('hidden');
            } else {
                marker.classList.add('hidden');
            }
        }
    });

    const totalEl = document.getElementById('total-concerts');
    if (totalEl) {
        const total = Object.values(regionCounts).reduce((sum, count) => sum + count, 0);
        totalEl.textContent = total;
    }

    updateAverageCapacityRanking();
}

function updateAverageCapacityRanking() {
    if (!currentConcerts || currentConcerts.length === 0) return;

    const regionCapacities = {};
    const regionCounts = {};

    currentConcerts.forEach(concert => {
        if (!concert.region || !concert.capacity) return;

        let capacity = 0;
        const capStr = String(concert.capacity).replace(/,/g, '');

        if (capStr.includes('-')) {
            const parts = capStr.split('-').map(p => parseInt(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                capacity = (parts[0] + parts[1]) / 2;
            }
        } else {
            capacity = parseInt(capStr);
        }

        if (!isNaN(capacity) && capacity > 0) {
            if (!regionCapacities[concert.region]) {
                regionCapacities[concert.region] = 0;
                regionCounts[concert.region] = 0;
            }
            regionCapacities[concert.region] += capacity;
            regionCounts[concert.region]++;
        }
    });

    const avgCapacities = Object.keys(regionCapacities).map(region => ({
        region,
        avg: Math.round(regionCapacities[region] / regionCounts[region])
    })).sort((a, b) => b.avg - a.avg);

    const container = document.getElementById('average-capacity-rankings');
    if (container) {
        if (avgCapacities.length === 0) {
            container.innerHTML = `<div class="text-center text-gray-400 text-xs py-4">${t('common.noData')}</div>`;
        } else {
            container.innerHTML = avgCapacities.map((item, index) => `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100" onclick="updateVenueChart('${item.region}')">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-400">${index + 1}</span>
                        <span class="text-gray-600">${getRegionLabel(item.region)}</span>
                    </div>
                    <span class="font-bold text-gray-900">${item.avg.toLocaleString()}</span>
                </div>
            `).join('');
        }
    }
}

function updateVenueChart(region) {
    const chartContainer = document.getElementById('venue-chart');
    const regionNameEl = document.getElementById('chart-region-name');
    if (!chartContainer || !regionNameEl) return;

    regionNameEl.textContent = getRegionLabel(region);

    const counts = regionVenueCounts[region];
    if (!counts) {
        chartContainer.innerHTML = `<div class="text-center text-gray-400 text-xs py-8">${t('common.noData')}</div>`;
        return;
    }

    const maxCount = Math.max(...Object.values(counts), 1);

    const colors = {
        'stadium': 'bg-blue-500',
        'arena': 'bg-indigo-500',
        'theater': 'bg-purple-500',
        'livehouse': 'bg-pink-500'
    };

    chartContainer.innerHTML = Object.entries(counts).map(([type, count]) => {
        const percentage = (count / maxCount) * 100;
        return `
            <div class="space-y-1">
                <div class="flex justify-between text-xs">
                    <span class="text-gray-600">${getVenueLabel(type)}</span>
                    <span class="font-bold text-gray-900">${count}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="${colors[type]} h-2 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}
window.updateVenueChart = updateVenueChart;

async function fetchDetailedTourData(artist) {
    const apiKey = currentProvider === 'gemini' ? GEMINI_API_KEY : OPENAI_API_KEY;
    if (!apiKey) return;

    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    const apiStatusBar = document.getElementById('apiStatusBar');
    if (apiStatusBar) {
        apiStatusBar.classList.remove('hidden');
    }

    const regions = ['北美', '欧洲', '中国大陆', '港台', '日韩', '东南亚', '大洋洲'];

    regions.forEach(region => {
        regionStatus[region] = 'pending';
        regionCounts[region] = 0;
        regionVenueCounts[region] = { stadium: 0, arena: 0, theater: 0, livehouse: 0 };
    });

    console.log('开始并行搜索7个区域...');

    const promises = regions.map(async (region) => {
        try {
            updateRegionStatus(region, 'loading');
            let result = await fetchRegionalTourData(artist, region, 0);

            if (result && result.concerts && result.concerts.length > 0) {
                currentConcerts.push(...result.concerts);
                regionCounts[region] = result.totalCount || result.concerts.length;
                regionVenueCounts[region] = result.venueCounts || { stadium: 0, arena: 0, theater: 0, livehouse: 0 };

                updateTimeline(currentConcerts);
                populateTable();
                updateRegionalMap();
                console.log(`${region} 数据已加载并显示, 总数: ${regionCounts[region]}`);
                updateRegionStatus(region, 'complete');
            } else {
                console.log(`${region} 第一次查询无数据,重新查询...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                result = await fetchRegionalTourData(artist, region, 1);

                if (result && result.concerts && result.concerts.length > 0) {
                    currentConcerts.push(...result.concerts);
                    regionCounts[region] = result.totalCount || result.concerts.length;
                    regionVenueCounts[region] = result.venueCounts || { stadium: 0, arena: 0, theater: 0, livehouse: 0 };

                    updateTimeline(currentConcerts);
                    populateTable();
                    updateRegionalMap();
                    console.log(`${region} 重新查询成功, 总数: ${regionCounts[region]}`);
                    updateRegionStatus(region, 'complete');
                } else {
                    console.log(`${region} 确实无数据`);
                    regionCounts[region] = 0;
                    regionVenueCounts[region] = { stadium: 0, arena: 0, theater: 0, livehouse: 0 };
                    updateRegionalMap();
                    updateRegionStatus(region, 'none');
                }
            }
        } catch (error) {
            console.error(`Error fetching ${region} data:`, error);
            updateRegionStatus(region, 'error');
        }
    });

    try {
        await Promise.all(promises);
        console.log('所有区域搜索完成');
        updateRegionalMap();
    } catch (error) {
        console.error('Error in multi-region search:', error);
    } finally {
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }
}

function updateSummaryStats(overviewData, region) {
    const regionNameEl = document.getElementById('targetRegionName');
    if (regionNameEl && region) {
        regionNameEl.textContent = getRegionLabel(region);
        latestOverviewRegion = region;
    }

    if (!overviewData) {
        const fallback = getNotAvailableText();
        document.getElementById('touringStatus').textContent = fallback;
        document.getElementById('tourTheme').textContent = fallback;
        document.getElementById('regionFutureTours').textContent = fallback;
        document.getElementById('plannedCities').textContent = fallback;
        document.getElementById('tourScale').textContent = fallback;
        document.getElementById('tourFrequency').textContent = fallback;
        document.getElementById('tourThemeSpan').textContent = fallback;
        latestOverviewData = null;
        return;
    }

    const fallback = getNotAvailableText();
    document.getElementById('touringStatus').textContent = overviewData.isTouringNow || fallback;
    document.getElementById('tourTheme').textContent = overviewData.tourTheme || fallback;
    document.getElementById('regionFutureTours').textContent = overviewData.hasFutureToursInRegion || fallback;

    const cities = overviewData.plannedCities || [];
    const cityJoiner = currentLanguage === 'zh' ? '、' : ', ';
    document.getElementById('plannedCities').textContent = cities.length > 0 ? cities.join(cityJoiner) : fallback;

    document.getElementById('tourScale').textContent = overviewData.tourScale || fallback;
    document.getElementById('tourFrequency').textContent = overviewData.tourFrequency || fallback;
    document.getElementById('tourThemeSpan').textContent = overviewData.tourThemeSpan || fallback;
    latestOverviewData = overviewData;
}

function updateTimeline(concerts) {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    if (!concerts || concerts.length === 0) {
        timeline.innerHTML = `<div class="text-center text-gray-400 text-sm">${t('timeline.noData')}</div>`;
        return;
    }

    const sortedConcerts = [...concerts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const now = new Date();
    const pastConcerts = sortedConcerts.filter(c => new Date(c.date) <= now).slice(-3);
    const futureConcert = sortedConcerts.find(c => new Date(c.date) > now);

    const timelineData = [...pastConcerts];
    if (futureConcert) {
        timelineData.push(futureConcert);
    } else {
        timelineData.push({ city: getNotAvailableText(), date: '', venue: t('timeline.noFuture'), isEmpty: true });
    }

    timeline.innerHTML = `
        <div class="flex items-center justify-between min-w-max gap-4 px-4">
            ${timelineData.map((concert, index) => `
                <div class="flex items-center ${index < timelineData.length - 1 ? 'flex-1' : ''}">
                    <div class="flex flex-col items-center">
                        <div class="w-4 h-4 ${concert.isEmpty ? 'bg-gray-300' : getTimelineColor(concert.date)} rounded-full mb-2 ring-4 ring-white shadow"></div>
                        <div class="text-center min-w-[120px]">
                            <div class="text-sm font-semibold ${concert.isEmpty ? 'text-gray-400' : 'text-gray-900'}">${concert.city}</div>
                            ${concert.date ? `<div class="text-xs text-gray-500">${formatTimelineDate(concert.date)}</div>` : ''}
                            <div class="text-xs text-gray-400 mt-1">${concert.venue}</div>
                        </div>
                    </div>
                    ${index < timelineData.length - 1 ? '<div class="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 mx-4"></div>' : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function getTimelineColor(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) return 'bg-gray-400';
    if (date > now) return 'bg-green-500';
    return 'bg-blue-500';
}

function formatTimelineDate(dateStr) {
    const date = new Date(dateStr);
    if (currentLanguage === 'en') {
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    }
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function handleSort(key) {
    if (currentSort.key === key) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.key = key;
        currentSort.direction = 'asc';
        if (key === 'date' || key === 'ticketSaleDate' || key === 'soldOutDate') {
            currentSort.direction = 'desc';
        }
    }
    populateTable();
}

function getThemeColor(theme) {
    if (!theme || theme === '无' || theme === '-') return 'bg-gray-100 text-gray-600';

    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < theme.length; i++) {
        hash = theme.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        'bg-red-100 text-red-600',
        'bg-orange-100 text-orange-600',
        'bg-amber-100 text-amber-600',
        'bg-yellow-100 text-yellow-600',
        'bg-lime-100 text-lime-600',
        'bg-green-100 text-green-600',
        'bg-emerald-100 text-emerald-600',
        'bg-teal-100 text-teal-600',
        'bg-cyan-100 text-cyan-600',
        'bg-sky-100 text-sky-600',
        'bg-blue-100 text-blue-600',
        'bg-indigo-100 text-indigo-600',
        'bg-violet-100 text-violet-600',
        'bg-purple-100 text-purple-600',
        'bg-fuchsia-100 text-fuchsia-600',
        'bg-pink-100 text-pink-600',
        'bg-rose-100 text-rose-600'
    ];

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

function updateSortIcons() {
    document.querySelectorAll('.sort-icon').forEach(el => el.innerHTML = '');
    const iconEl = document.getElementById(`sort-${currentSort.key}`);
    if (iconEl) {
        iconEl.innerHTML = currentSort.direction === 'asc' ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>';
    }
}

function normalizeAttendanceText(text) {
    if (!text) return '-';
    const clean = text.replace(/\s+/g, '');
    return clean.length <= 5 ? clean : clean.slice(0, 5);
}

async function fetchAttendanceData(concertsToFetch) {
    if (!concertsToFetch || concertsToFetch.length === 0) return;

    const prompt = `【关键指令】请查询以下演出的上座率(Attendance)数据。
    
    演出列表:
    ${JSON.stringify(concertsToFetch.map(c => ({ date: c.date, city: c.city, venue: c.venue })))}

    请返回JSON格式(只返回JSON,不要其他文字)。注意“attendance”字段必须为5个字符以内的中文或百分比描述:
    {
        "attendanceData": [
            {
                "date": "YYYY-MM-DD",
                "city": "城市名",
                "attendance": "上座率 (示例: 95%, 100%, 售罄, 约80% 等，长度≤5个字符)"
            }
        ]
    }`;

    try {
        const text = await callLLMAPI(prompt);
        if (!text) return;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            if (result.attendanceData) {
                result.attendanceData.forEach(item => {
                    const concert = currentConcerts.find(c => c.date === item.date && c.city === item.city);
                    if (concert) {
                        concert.attendance = normalizeAttendanceText(item.attendance);
                        concert.attendanceLoading = false;
                    }
                });
                populateTable(); // Re-render to show new data
            }
        }
    } catch (error) {
        console.error('Attendance API Error:', error);
        concertsToFetch.forEach(c => c.attendanceLoading = false); // Reset loading state on error
    }
}

function populateTable() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    if (!currentConcerts || currentConcerts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" class="py-8 px-4 text-center text-gray-500">${t('table.noData')}</td></tr>`;
        return;
    }

    updateSortIcons();

    const sortedConcerts = [...currentConcerts].sort((a, b) => {
        let valA = a[currentSort.key];
        let valB = b[currentSort.key];

        if (currentSort.key === 'status') {
            valA = getStatusText(a.date);
            valB = getStatusText(b.date);
        }

        if (!valA) return 1;
        if (!valB) return -1;

        if (currentSort.key.includes('date') || currentSort.key === 'Date' || currentSort.key === 'date') {
            return currentSort.direction === 'asc'
                ? new Date(valA) - new Date(valB)
                : new Date(valB) - new Date(valA);
        }

        if (currentSort.key === 'capacity') {
            return currentSort.direction === 'asc' ? valA - valB : valB - valA;
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const displayConcerts = isTableExpanded ? sortedConcerts : sortedConcerts.slice(0, 5);
    const concertsToFetch = [];

    tbody.innerHTML = displayConcerts.map(concert => {
        const statusClass = getStatusClass(concert.date);
        const statusText = getStatusText(concert.date);
        const themeColor = getThemeColor(concert.tourTheme);

        // Check if attendance needs fetching
        if (!concert.attendance && !concert.attendanceLoading) {
            concert.attendanceLoading = true;
            concertsToFetch.push(concert);
        }

        const attendanceDisplay = concert.attendance || (concert.attendanceLoading ? '<i class="fas fa-spinner fa-spin text-gray-400"></i>' : '-');

        return `<tr class="hover:bg-gray-50">
            <td class="py-3 px-3 text-xs">${formatFullDate(concert.date)}</td>
            <td class="py-3 px-3 text-xs">${concert.weekday || '-'}</td>
            <td class="py-3 px-3 text-xs"><span class="${themeColor} px-2 py-1 rounded text-xs">${concert.tourTheme || '-'}</span></td>
            <td class="py-3 px-3 text-xs">${getRegionLabel(concert.region) || '-'}</td>
            <td class="py-3 px-3 text-xs">${concert.city}</td>
            <td class="py-3 px-3 text-xs">${concert.venue}</td>
            <td class="py-3 px-3 text-xs">${concert.capacity ? concert.capacity.toLocaleString() : '-'}</td>
            <td class="py-3 px-3 text-xs">${concert.priceRange}</td>
            <td class="py-3 px-3 text-xs">${formatShortDate(concert.ticketSaleDate) || '-'}</td>
            <td class="py-3 px-3 text-xs">${formatShortDate(concert.soldOutDate) || '-'}</td>
            <td class="py-3 px-3 text-xs">${concert.saleSpeed || '-'}</td>
            <td class="py-3 px-3 text-xs">${concert.organizer || '-'}</td>
            <td class="py-3 px-3 text-xs">${attendanceDisplay}</td>
            <td class="py-3 px-3"><span class="${statusClass} px-2 py-1 rounded text-xs">${statusText}</span></td>
        </tr>`;
    }).join('');

    // Trigger fetch for missing attendance
    if (concertsToFetch.length > 0) {
        fetchAttendanceData(concertsToFetch);
    }

    // Handle Load More Button
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        if (sortedConcerts.length > 5 && !isTableExpanded) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }
}

function formatFullDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatShortDate(dateStr) {
    if (!dateStr || dateStr === 'null' || dateStr === '-') return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getStatusClass(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) return 'bg-gray-100 text-gray-600';
    if (date > now) return 'bg-green-100 text-green-600';
    return 'bg-blue-100 text-blue-600';
}

function getStatusText(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) return t('table.statusPast');
    if (date > now) return t('table.statusUpcoming');
    return t('table.statusToday');
}

function getCacheKey(artist, region) {
    return `${CACHE_PREFIX}${artist}_${region}`;
}

function getCachedData(key) {
    const data = localStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
    }
    return parsed.data;
}

function setCachedData(key, data) {
    localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        data: data
    }));
}

async function fetchAndPopulateData(artist, region) {
    const wikiData = await fetchWikipediaData(artist);
    updatePageWithWikipediaData(wikiData);

    currentConcerts = [];

    // Check cache first
    const cacheKey = getCacheKey(artist, region);
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
        // Use cached data
        console.log('📦 从缓存加载数据');

        if (cachedData.overview) {
            updateSummaryStats(cachedData.overview, region);
        }

        if (cachedData.concerts && cachedData.concerts.length > 0) {
            currentConcerts = cachedData.concerts;
            updateTimeline(currentConcerts);
            populateTable();
        }

        if (cachedData.regionCounts) {
            Object.assign(regionCounts, cachedData.regionCounts);
            updateRegionalMap();
        }

        if (cachedData.regionVenueCounts) {
            Object.assign(regionVenueCounts, cachedData.regionVenueCounts);
        }

        return;
    }

    // No cache, fetch from API
    console.log('🌐 从 API 获取数据');

    const overviewStatusBar = document.getElementById('overviewStatusBar');
    if (overviewStatusBar) overviewStatusBar.classList.remove('hidden');

    const detailedPromise = fetchDetailedTourData(artist);

    await detailedPromise;
    const statusDate = document.getElementById('status-date');
    if (statusDate) {
        statusDate.innerHTML = `<i class="fas fa-check-circle text-green-500 text-sm"></i><span class="text-xs text-gray-500">${t('overview.statusDate')}</span>`;
    }

    // Fetch Overview after detailed data is ready
    const overviewData = await fetchTourOverview(artist, region, currentConcerts);
    if (overviewData) {
        updateSummaryStats(overviewData, region);
        const statusOverview = document.getElementById('status-overview');
        if (statusOverview) {
            statusOverview.innerHTML = `<i class="fas fa-check-circle text-green-500 text-sm"></i><span class="text-xs text-gray-500">${t('overview.statusOverviewDone')}</span>`;
        }
    }

    // Save to cache
    const dataToCache = {
        overview: overviewData,
        concerts: currentConcerts,
        regionCounts: { ...regionCounts },
        regionVenueCounts: { ...regionVenueCounts }
    };
    setCachedData(cacheKey, dataToCache);
}

// Initialize
const params = new URLSearchParams(window.location.search);
const project = params.get('project');
const region = params.get('region');

if (project) {
    let titleText = project;
    if (region && region !== 'Global') {
        titleText += ` (${getRegionLabel(region)})`;
    }
    document.title = `${titleText} - ${t('page.titleSuffix')}`;

    const titleEl = document.getElementById('projectTitle');
    if (titleEl) {
        titleEl.textContent = titleText;
        titleEl.removeAttribute('data-i18n');
    }


    const apiKey = currentProvider === 'gemini' ? GEMINI_API_KEY : OPENAI_API_KEY;
    if (apiKey) {
        fetchAndPopulateData(project, region || '全球');
    } else {
        setTimeout(() => {
            const providerLabel = currentProvider === 'gemini' ? 'Gemini' : 'OpenAI';
            const promptText = t('alerts.apiKeyRequired').replace('{provider}', providerLabel);
            if (confirm(promptText)) {
                apiKeyModal.classList.remove('hidden');
            }
        }, 1000);
    }
}

// Favorites / My List Logic
const addToListBtn = document.getElementById('addToListBtn');

// function getSavedProjects() {
//     const saved = localStorage.getItem('my_saved_projects');
//     return saved ? JSON.parse(saved) : [];
// }

// function isProjectSaved(projectName) {
//     const projects = getSavedProjects();
//     return projects.some(p => p.name === projectName);
// }

async function toggleSaveProject() {
    if (!project) return;
    const icon = addToListBtn.querySelector('i');
    const isSaved = await favoritesManager.isFavorite(project);

    if (!isSaved) {
        // Add to list
        const imgEl = document.querySelector('img[alt="Project Cover"]');
        const imgSrc = imgEl ? imgEl.src : '';

        const success = await favoritesManager.addFavorite({
            name: project,
            region: region || 'Global',
            image: imgSrc,
            score: Math.floor(Math.random() * 10) + 90 // Mock score
        });
        if (success) {
            icon.classList.remove('far');
            icon.classList.add('fas', 'text-red-500');
            addToListBtn.classList.add('text-red-500');
        }
    } else {
        // Remove from list
        const success = await favoritesManager.removeFavorite(project);

        if (success) {
            icon.classList.remove('fas', 'text-red-500');
            icon.classList.add('far');
            addToListBtn.classList.remove('text-red-500');
        }
    }
}

if (addToListBtn && project) {
    // 等待用户登录状态后再检查收藏状态
    firebase.auth().onAuthStateChanged(async function (user) {
        if (user) {
            // 用户已登录，检查是否已收藏
            const isSaved = await favoritesManager.isFavorite(project);
            if (isSaved) {
                const icon = addToListBtn.querySelector('i');
                icon.classList.remove('far');
                icon.classList.add('fas', 'text-red-500');
                addToListBtn.classList.add('text-red-500');
            }
        }
    });

    addToListBtn.addEventListener('click', toggleSaveProject);
}

document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            isTableExpanded = true;
            populateTable();
        });
    }
});
