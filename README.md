# Royalty Shield

**The B2B "Immune System" for Independent Record Labels.**

Royalty Shield detects and helps dispute artificial streaming activity before it results in withheld royalties or distributor strikes. In an era where a single bot-farm incident can bankrupt a label, Royalty Shield provides the transparency and legal trail needed to protect your catalog.

## Features
- **Real-Time Growth Monitoring**: Alerts for sudden spikes in streaming activity.
- **Forensic Audit Engine**: Analyzes behavioral signatures (skip rates, playlist sources) to detect bots.
- **Automated Dispute Packages**: Generates professional PDF dispute packages ready for distribution.
- **Multi-Source Data**: Aggregates metrics from Soundcharts and Spotify for Artists.

## How it Works: The "Non-Human" Logic

Our audit engine doesn't just look at high numbers; it searches for specific "behavioral fingerprints":
- **The 31-Second Signature**: Identifies tracks where a significant portion of listeners drop off immediately after the payout threshold.
- **The "High-Risk" Source**: Detects traffic originating from known low-intent playlist farms.
- **Growth Analysis**: Compares current growth against historical trends to identify inorganic spikes.

## Setup & Configuration

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/smithmau5/RoyaltyShield.git
cd RoyaltyShield

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Variables
Create a `.env` file in the `server` directory using the provided template:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your API credentials:

| Variable | Description | Source |
|----------|-------------|--------|
| `PORT` | Backend server port (Default: 5000) | - |
| `SOUNDCHARTS_APP_ID` | Your Soundcharts App ID | [Soundcharts App](https://app.soundcharts.com/) |
| `SOUNDCHARTS_API_KEY` | Your Soundcharts API Key | [Soundcharts App](https://app.soundcharts.com/) |
| `SPOTIFY_CLIENT_ID` | Spotify Developer Client ID | [Spotify Dashboard](https://developer.spotify.com/dashboard) |
| `SPOTIFY_CLIENT_SECRET` | Spotify Developer Secret | [Spotify Dashboard](https://developer.spotify.com/dashboard) |
| `SUPABASE_URL` | Your Supabase Project URL | [Supabase Project](https://supabase.com/) |
| `SUPABASE_ANON_KEY` | Your Supabase Anon/Public Key | [Supabase Project](https://supabase.com/) |

### 4. Running the Project

**Start the Backend:**
```bash
cd server
npm start
```

**Start the Frontend:**
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:3000`.

## Architecture
- **Frontend**: React, Vite, Lucide-React, jsPDF.
- **Backend**: Node.js, Express, Axios.
- **Data Engine**:
  - `soundcharts.js`: Fetches market data and ISRC metadata.
  - `spotify.js`: Fetches listener behavioral analytics.
  - `apiService.js`: Core logic for anomaly detection and risk scoring.
  - `supabase.js`: Handles persistent audit logs.

## Contributing
Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

## Donations
If Royalty Shield has helped protect your royalties, please consider supporting the project:

### Venmo
You can make a direct donation via Venmo to: **@hereistheocean**

### GitHub Sponsors
Support us through [GitHub Sponsors](https://github.com/sponsors/smithmau5) (Coming soon!).

## License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Royalty Shield is built to keep the independent music ecosystem fair and transparent.*
