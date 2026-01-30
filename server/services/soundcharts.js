const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const SOUNDCHARTS_BASE_URL = 'https://customer.api.soundcharts.com/api/v2/track';

const getClient = () => {
    const appId = process.env.SOUNDCHARTS_APP_ID;
    const apiKey = process.env.SOUNDCHARTS_API_KEY;

    if (!appId || !apiKey) {
        return null;
    }

    return axios.create({
        baseURL: SOUNDCHARTS_BASE_URL,
        headers: {
            'x-app-id': appId,
            'x-api-key': apiKey
        }
    });
};

/**
 * Fetch daily stream counts and sources for a track by ISRC
 */
const getTrackStreamingData = async (isrc) => {
    const client = getClient();
    if (!client) {
        console.warn('Soundcharts keys missing. Falling back to mock data.');
        return null;
    }

    try {
        // Example: Soundcharts endpoint for track audience by ISRC
        // Note: Actual endpoints may vary based on Soundcharts API version
        const response = await client.get(`/by-isrc/${isrc}/audience/streaming`);
        return response.data;
    } catch (error) {
        console.error(`Soundcharts API Error for ISRC ${isrc}:`, error.message);
        return null;
    }
};

/**
 * Fetch track metadata (Artist, Title) by ISRC
 */
const getTrackMetadata = async (isrc) => {
    const client = getClient();
    if (!client) return null;

    try {
        const response = await client.get(`/by-isrc/${isrc}`);
        return response.data;
    } catch (error) {
        console.error(`Soundcharts API Error for ISRC ${isrc}:`, error.message);
        return null;
    }
};

module.exports = {
    getTrackStreamingData,
    getTrackMetadata
};
