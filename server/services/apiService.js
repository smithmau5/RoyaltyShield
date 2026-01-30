const soundcharts = require('./soundcharts');
const spotify = require('./spotify');
const supabase = require('../supabase');

// Mock data service for tracks and stats
const tracks = [

    {
        id: '1',
        name: 'Moonlight Serenade',
        artist: 'Luna Ray',
        isrc: 'USRC12345678',
        current_streams: 12500,
        previous_streams: 12000,
        playlist_source: 'Soundcharts Top 100',
        skip_rate: 0.12,
        status: 'Green'
    },
    {
        id: '2',
        name: 'Midnight Pulse',
        artist: 'Neon Shadow',
        isrc: 'USRC87654321',
        current_streams: 45000,
        previous_streams: 20000,
        playlist_source: 'Spotify Bot-Farm Helper',
        skip_rate: 0.55,
        status: 'Red'
    },
    {
        id: '3',
        name: 'Sunset Drift',
        artist: 'Vibe Master',
        isrc: 'USRC11223344',
        current_streams: 8000,
        previous_streams: 7500,
        playlist_source: 'Spotify Chill Vibes',
        skip_rate: 0.18,
        status: 'Green'
    },
    {
        id: '4',
        name: 'Velocity',
        artist: 'Turbo Trax',
        isrc: 'USRC44332211',
        current_streams: 32000,
        previous_streams: 28000,
        playlist_source: 'Apple Music Hype Station',
        skip_rate: 0.22,
        status: 'Yellow'
    }
];

const getTrackStats = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const results = [];
    for (const track of tracks) {
        let streams = track.current_streams;
        let prevStreams = track.previous_streams;

        // Attempt to fetch real data from Soundcharts
        const realData = await soundcharts.getTrackStreamingData(track.isrc);
        if (realData && realData.streams) {
            streams = realData.streams.current;
            prevStreams = realData.streams.previous;
        }

        // Attempt to fetch Spotify analytics
        const spotifyData = await spotify.getSpotifyAnalytics(track.isrc);
        let skipRate = track.skip_rate;
        if (spotifyData) {
            skipRate = spotifyData.skip_rate_31s;
        }

        const growth = (streams - prevStreams) / prevStreams;
        const isHighGrowth = growth > 0.5;

        results.push({
            ...track,
            current_streams: streams,
            previous_streams: prevStreams,
            skip_rate: skipRate,
            growth: (growth * 100).toFixed(1),
            isHighGrowth
        });

    }
    return results;
};


const BLACKLIST_KEYWORDS = ['Real Plays', 'Growth Hub', 'Bot-Farm', 'Promote Only', 'Instant Fans'];
const INDUSTRY_AVG_SKIP_RATE = 0.25;

const analyzeSkipRate = (skipRate) => {
    if (skipRate > INDUSTRY_AVG_SKIP_RATE * 2) {
        return { level: 'High', message: `Critical skip rate detected: ${(skipRate * 100).toFixed(1)}% (Industry avg: 25%)` };
    }
    if (skipRate > INDUSTRY_AVG_SKIP_RATE * 1.5) {
        return { level: 'Medium', message: `Elevated skip rate: ${(skipRate * 100).toFixed(1)}%` };
    }
    return { level: 'Low', message: 'Skip rate within normal range' };
};

const checkPlaylistBlacklist = (playlistName) => {
    const found = BLACKLIST_KEYWORDS.filter(word =>
        playlistName.toLowerCase().includes(word.toLowerCase())
    );
    if (found.length > 0) {
        return { level: 'High', message: `Associated with suspicious playlist keywords: ${found.join(', ')}` };
    }
    return { level: 'Low', message: 'No suspicious playlist signatures found' };
};

const auditTrack = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const track = tracks.find(t => t.id === id);
    if (!track) throw new Error('Track not found');

    const skipAnalysis = analyzeSkipRate(track.skip_rate);
    const playlistAnalysis = checkPlaylistBlacklist(track.playlist_source);

    const findings = [];
    let riskScore = 0;

    if (skipAnalysis.level === 'High') { findings.push(skipAnalysis.message); riskScore += 50; }
    else if (skipAnalysis.level === 'Medium') { findings.push(skipAnalysis.message); riskScore += 20; }

    if (playlistAnalysis.level === 'High') { findings.push(playlistAnalysis.message); riskScore += 50; }

    const status = riskScore >= 50 ? 'Red' : (riskScore >= 20 ? 'Yellow' : 'Green');

    const result = {
        trackId: id,
        timestamp: new Date().toISOString(),
        riskLevel: status,
        findings: findings.length > 0 ? findings : ['No anomalies detected based on current behavioral signatures']
    };

    // Log to Supabase if configured
    await supabase.saveAuditLog(result);

    return result;
};



const generateDisputeDraft = async (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) throw new Error('Track not found');

    const audit = await auditTrack(trackId);

    // Mocking an LLM-style draft generation
    const date = new Date().toLocaleDateString();

    return {
        subject: `URGENT: Dispute of Suspicious Streaming Activity - ISRC ${track.isrc}`,
        body: `
To the Compliance Team,

I am writing to formally dispute and report suspicious streaming activity detected on our track "${track.name}" (${track.isrc}) by "${track.artist}".

Our internal monitoring system, Royalty Shield, flagged a sudden spike on ${date} originating from a suspicious source: "${track.playlist_source}".

Forensic Findings:
${audit.findings.map(f => `• ${f}`).join('\n')}

We did not authorize any inorganic promotion for this track. We request that you protect our account standing and exclude these suspicious metrics from our royalty calculations to prevent any DSP penalties.

Regards,
Label Manager
Royalty Shield Verified
        `.trim()
    };
};

module.exports = {
    getTrackStats,
    auditTrack,
    generateDisputeDraft
};

