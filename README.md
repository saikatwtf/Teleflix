# Teleflix

A Telegram-powered Movie/Series/Anime Website that connects to a private Telegram channel and displays media content with IMDb metadata, download/streaming buttons, and an organized UI.

## Features

- Telegram Integration: Listen to posts in a private Telegram channel
- IMDb Metadata Fetching: Automatically fetch and display movie/series information
- Smart File Parsing: Parse quality, source, format, episode/season numbers
- Duplicate Version Support: Handle multiple versions of the same content
- Search System: Find content by title, genres, or filename
- Multi Bot Token Download: Load balance between multiple Telegram bot tokens
- Filters & Sorting: Sort by recent/popular/A-Z and filter by genre or quality
- Optional Password Protection: Enable password-based access for private deployments
- Dark/Light Mode UI: Toggleable theme with responsive design

## Setup & Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- MongoDB Atlas account
- Telegram API credentials

### Local Development

1. Clone the repository
   ```
   git clone https://github.com/saikatwtf/Teleflix.git
   cd Teleflix
   ```

2. Set up backend
   ```
   cd backend
   pip install -r requirements.txt
   cp .env.example .env  # Edit with your credentials
   ```

3. Set up frontend
   ```
   cd ../frontend
   npm install
   cp .env.example .env  # Edit with your credentials
   ```

4. Run the application
   ```
   # Terminal 1 (Backend)
   cd backend
   uvicorn main:app --reload
   
   # Terminal 2 (Frontend)
   cd frontend
   npm run dev
   ```

### Deployment

#### Vercel Deployment

1. Fork this repository
2. Import to Vercel
3. Set up environment variables
4. Deploy

#### Cloudflare Pages Deployment

1. Fork this repository
2. Connect to Cloudflare Pages
3. Set up environment variables
4. Deploy

## Environment Variables

Create a `.env` file with the following variables:

```
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
BOT_TOKENS=bot1,bot2,bot3
CHANNEL_ID=
MONGODB_URI=
SITE_PASSWORD=  # optional, leave empty for public
BASE_URL=https://yourdomain.com
```

## Connecting to Telegram

1. Create a Telegram application at https://my.telegram.org/apps
2. Get your API_ID and API_HASH
3. Create one or more Telegram bots using @BotFather
4. Add your bots to your private channel as admins
5. Update the .env file with your credentials

## Password Protection

To enable password protection for your deployment:

1. Set the SITE_PASSWORD environment variable
2. Users will be prompted for this password before accessing the site

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
