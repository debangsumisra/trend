# TrendSphere - Social Media Trends Hub

TrendSphere is a real-time social media trends aggregator that displays trending content from multiple platforms including Reddit, YouTube, Twitter, Google News, Product Hunt, and Hacker News.

## Features

- Real-time trend updates from multiple social media platforms
- Beautiful and modern UI with interactive elements
- Detailed statistics for each platform
- Responsive design that works on all devices
- Platform-specific analytics and insights

## Technologies Used

- Python/Flask for backend
- Socket.IO for real-time updates
- Three.js for background animations
- Bootstrap for responsive design
- Font Awesome for icons

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trendsphere.git
cd trendsphere
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your API keys:
```
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
SECRET_KEY=your_flask_secret_key
```

5. Run the application:
```bash
python merge.py
```

The application will be available at `http://localhost:5000`

## Project Structure

```
trendsphere/
├── merge.py              # Main application file
├── templates/            # HTML templates
│   └── index.html       # Main template
├── static/              # Static files
├── requirements.txt     # Python dependencies
└── .env                # Environment variables
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 