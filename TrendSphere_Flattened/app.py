from flask import Flask, jsonify, send_from_directory
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from dotenv import load_dotenv
import time
import requests
from bs4 import BeautifulSoup

# Import route blueprints
from routes.twitter_routes import twitter_bp, twitter_scraper
from routes.youtube_routes import youtube_bp, youtube_scraper
from routes.reddit_routes import reddit_bp, reddit_scraper
from routes.hackernews_routes import hackernews_bp, hackernews_scraper
from routes.google_news_routes import googlenews_bp, googlenews_scraper
from routes.product_hunt_routes import producthunt_bp, producthunt_scraper
from cache import cache, clear_platform_cache, clear_all_cache

load_dotenv()

app = Flask(__name__, 
    static_folder='static',
    template_folder='templates'
)
CORS(app)  # Enable CORS for all routes

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a570c9c0fafaddfdb185686e61591419fabd2883be4708329c9cb32bc2b227b3')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///trendfeeder.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize cache
cache.init_app(app)

# Initialize SocketIO with proper configuration
socketio = SocketIO(app, 
    cors_allowed_origins="*",
    async_mode='threading',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

db = SQLAlchemy(app)

def background_trends_task():
    """Background task to periodically fetch and emit trend updates"""
    while True:
        try:
            # Fetch trends for each platform
            platform_scrapers = {
                'twitter': twitter_scraper,
                'youtube': youtube_scraper,
                'reddit': reddit_scraper,
                'hackernews': hackernews_scraper,
                'googlenews': googlenews_scraper,
                'producthunt': producthunt_scraper
            }
            
            for platform, scraper in platform_scrapers.items():
                try:
                    response = requests.get(scraper.get_trends())
                    response.encoding = 'utf-8'
                    soup = BeautifulSoup(response.text, 'html.parser')
                    trends = get_cached_trends(platform, scraper.get_trends)
                    socketio.emit('trends_update', {
                        'platform': platform,
                        'trends': trends
                    })
                except Exception as e:
                    print(f"Error fetching trends for {platform}: {e}")
        except Exception as e:
            print(f"Error in background task: {e}")
        time.sleep(300)  # Update every 5 minutes

# Start the background task
socketio.start_background_task(background_trends_task)

# Register blueprints with correct prefixes
app.register_blueprint(twitter_bp, url_prefix='/api/twitter')
app.register_blueprint(youtube_bp, url_prefix='/api/youtube')
app.register_blueprint(reddit_bp, url_prefix='/api/reddit')
app.register_blueprint(hackernews_bp, url_prefix='/api/hackernews')
app.register_blueprint(googlenews_bp, url_prefix='/api/googlenews')
app.register_blueprint(producthunt_bp, url_prefix='/api/producthunt')

# Cache keys for each platform
CACHE_KEYS = {
    'twitter': 'twitter_trends',
    'youtube': 'youtube_trends',
    'reddit': 'reddit_trends',
    'hackernews': 'hackernews_trends',
    'googlenews': 'googlenews_trends',
    'producthunt': 'producthunt_trends'
}

def get_cached_trends(platform, fetch_function, *args, **kwargs):
    """Get trends from cache or fetch and cache if not available"""
    cache_key = CACHE_KEYS.get(platform)
    if not cache_key:
        return fetch_function(*args, **kwargs)
    
    # Try to get from cache
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data
    
    # If not in cache, fetch and store
    data = fetch_function(*args, **kwargs)
    cache.set(cache_key, data)
    return data

def clear_platform_cache(platform):
    """Clear cache for a specific platform"""
    cache_key = CACHE_KEYS.get(platform)
    if cache_key:
        cache.delete(cache_key)

def clear_all_cache():
    """Clear all platform caches"""
    for cache_key in CACHE_KEYS.values():
        cache.delete(cache_key)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# Platform-specific routes
@app.route('/twitter')
def twitter():
    return send_from_directory('static/platforms', 'twitter.html')

@app.route('/youtube')
def youtube():
    return send_from_directory('static/platforms', 'youtube.html')

@app.route('/reddit')
def reddit():
    return send_from_directory('static/platforms', 'reddit.html')

@app.route('/hackernews')
def hackernews():
    return send_from_directory('static/platforms', 'hackernews.html')

@app.route('/googlenews')
def googlenews():
    return send_from_directory('static/platforms', 'googlenews.html')

@app.route('/producthunt')
def producthunt():
    return send_from_directory('static/platforms', 'producthunt.html')

@app.route('/reddit/memes')
def reddit_memes():
    return send_from_directory('templates/platforms', 'reddit_memes.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('clear_cache')
def handle_clear_cache(platform=None):
    if platform:
        clear_platform_cache(platform)
        print(f'Cache cleared for {platform}')
    else:
        clear_all_cache()
        print('All caches cleared')

@twitter_bp.route('/api/twitter/trends')
def get_twitter_trends():
    # ...scraper logic...
    return jsonify({...})   

if __name__ == '__main__':
    print("\nServer starting...")
    socketio.run(app, debug=True, port=5000)