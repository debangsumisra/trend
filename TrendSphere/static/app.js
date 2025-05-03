document.addEventListener('DOMContentLoaded', () => {
    const trendsContainer = document.getElementById('trendContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const platformButtons = document.querySelectorAll('.platform-btn');
    let allTrends = [];

    // Platform endpoints
    const endpoints = {
        twitter: '/api/twitter/trends',
        youtube: '/api/youtube/trends',
        reddit: '/api/reddit/trends',
        hackernews: '/api/hackernews/trends',
        googlenews: '/api/googlenews/trends',
        producthunt: '/api/producthunt/trends'
    };

    // Platform icons
    const platformIcons = {
        twitter: 'fab fa-twitter',
        youtube: 'fab fa-youtube',
        reddit: 'fab fa-reddit',
        google_news: 'fas fa-newspaper',
        product_hunt: 'fas fa-rocket',
        hackernews: 'fab fa-hacker-news'
    };

    // Helper functions
    function truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function formatNumber(num) {
        if (!num) return 'N/A';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    function formatPlatformName(platform) {
        const names = {
            twitter: 'Twitter',
            youtube: 'YouTube',
            reddit: 'Reddit',
            hackernews: 'Hacker News',
            googlenews: 'Google News',
            producthunt: 'Product Hunt'
        };
        return names[platform.toLowerCase()] || platform;
    }

    function getPlatformIcon(platform) {
        return platformIcons[platform.toLowerCase()] || 'fas fa-external-link-alt';
    }

    function getTrendStats(trend) {
        switch (trend.platform) {
            case 'youtube':
                return `
                    <span class="trend-stat">
                        <i class="fas fa-eye"></i>
                        ${formatNumber(trend.views)} views
                    </span>
                    <span class="trend-stat">
                        <i class="fas fa-thumbs-up"></i>
                        ${formatNumber(trend.likes)}
                    </span>
                `;
            case 'twitter':
                return `<span class="trend-stat">
                    <i class="fas fa-retweet"></i>
                    ${formatNumber(trend.tweet_volume || 0)} tweets
                </span>`;
            case 'reddit':
                return `<span class="trend-stat">
                    <i class="fas fa-arrow-up"></i>
                    ${formatNumber(trend.score || 0)} points
                </span>`;
            case 'hackernews':
                return `<span class="trend-stat">
                    <i class="fas fa-arrow-up"></i>
                    ${formatNumber(trend.points || 0)} points
                </span>`;
            default:
                return '';
        }
    }

    function displayTrends(trends) {
        if (!trends || trends.length === 0) {
            trendsContainer.innerHTML = '<div class="col-12 text-center"><p class="error">No trends available.</p></div>';
            return;
        }

        trendsContainer.innerHTML = trends.map(trend => `
            <div class="col-md-4 mb-4">
                <div class="trend-card">
                    <div class="trend-header d-flex justify-content-between align-items-center">
                        <span class="trend-rank">#${trend.rank}</span>
                        <span class="platform-tag">
                            <i class="${platformIcons[trend.platform] || 'fas fa-hashtag'}"></i>
                        </span>
                    </div>
                    ${trend.platform === 'youtube' && trend.thumbnail ? `
                        <a href="${trend.url}" target="_blank" class="youtube-thumbnail mb-3">
                            <img src="${trend.thumbnail}" alt="${truncateText(trend.title, 60)}" class="img-fluid rounded">
                            <div class="play-button">
                                <i class="fas fa-play"></i>
                            </div>
                        </a>
                    ` : ''}
                    <h3 class="trend-title">${truncateText(trend.title, 60)}</h3>
                    ${trend.platform === 'youtube' ? `
                        <div class="channel-info mb-2">
                            <i class="fas fa-user"></i>
                            ${trend.channel_title}
                        </div>
                    ` : ''}
                    ${trend.description ? `<p class="trend-description">${truncateText(trend.description, 100)}</p>` : ''}
                    <div class="trend-meta">
                        ${getTrendStats(trend)}
                    </div>
                    <div class="trend-actions">
                        <a href="${trend.url || trend.tweet_url}" target="_blank" class="trend-btn">
                            <i class="${getPlatformIcon(trend.platform)}"></i>
                            View on ${formatPlatformName(trend.platform)}
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function showLoading() {
        loadingSpinner.classList.remove('d-none');
        trendsContainer.style.opacity = '0.5';
    }

    function hideLoading() {
        loadingSpinner.classList.add('d-none');
        trendsContainer.style.opacity = '1';
    }

    // Fetch trends from all platforms
    async function fetchAllTrends() {
        showLoading();
        try {
            const promises = Object.entries(endpoints).map(async ([platform, endpoint]) => {
                try {
                    console.log(`Fetching from ${endpoint}...`);
                    const response = await fetch(endpoint);
                    if (!response.ok) {
                        console.error(`Error fetching from ${endpoint}: ${response.status}`);
                        return [];
                    }
                    const data = await response.json();
                    console.log(`Data from ${endpoint}:`, data);
                    return Array.isArray(data.data) ? data.data.map(trend => ({...trend, platform})) : [];
                } catch (error) {
                    console.error(`Error fetching from ${endpoint}:`, error);
                    return [];
                }
            });

            const results = await Promise.all(promises);
            allTrends = results.flat().filter(trend => trend && trend.title);
            if (allTrends.length === 0) {
                trendsContainer.innerHTML = '<div class="col-12 text-center"><p class="error">No trends available at the moment. Please try again later.</p></div>';
            } else {
                displayTrends(allTrends);
            }
        } catch (error) {
            console.error('Error fetching trends:', error);
            trendsContainer.innerHTML = '<div class="col-12 text-center"><p class="error">Error loading trends. Please try again later.</p></div>';
        } finally {
            hideLoading();
        }
    }

    // Filter trends by platform
    function filterTrends(platform) {
        const filteredTrends = platform === 'all' 
            ? allTrends 
            : allTrends.filter(trend => trend.platform === platform);
        displayTrends(filteredTrends);
    }

    // Event listeners
    platformButtons.forEach(button => {
        button.addEventListener('click', () => {
            platformButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterTrends(button.dataset.platform);
        });
    });

    // Initial load
    fetchAllTrends();
    
    // Refresh every 5 minutes
    setInterval(fetchAllTrends, 5 * 60 * 1000);
}); 