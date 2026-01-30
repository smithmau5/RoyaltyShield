import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, AlertCircle, TrendingDown, FileText } from 'lucide-react';

const CsvUploader = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                const mappedData = results.data.map(row => {
                    const streams = row['Streams'] || row['streams'] || 0;
                    const saves = row['Saves'] || row['saves'] || 0;
                    const listeners = row['Listeners'] || row['listeners'] || 0;
                    const date = row['Date'] || row['date'] || 'N/A';

                    const sustainabilityScore = streams > 0 ? (saves / streams) * 100 : 0;

                    return {
                        date,
                        streams,
                        listeners,
                        saves,
                        sustainabilityScore: sustainabilityScore.toFixed(2),
                        isSuspicious: sustainabilityScore < 1.0 && streams > 100 // Threshold for relevance
                    };
                });
                setData(mappedData);
                setError(null);
            },
            error: (err) => {
                setError("Failed to parse CSV file. Please ensure it follows the Spotify for Artists export format.");
                console.error(err);
            }
        });
    };

    return (
        <div className="csv-uploader-container" style={{ margin: '2rem 0', padding: '2rem', background: '#16161a', borderRadius: '12px', border: '1px solid #2a2a30' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <FileText size={24} color="#00ff88" />
                <h2 style={{ fontSize: '1.4rem' }}>Spotify Audience Analytics Deep-Dive</h2>
            </div>

            <div className="upload-zone" style={{ border: '2px dashed #2a2a30', padding: '2rem', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', marginBottom: '2rem' }}>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="csv-upload"
                />
                <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
                    <Upload size={32} color="#888" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#888' }}>Drop Spotify for Artists 'Audience' export here or click to browse</p>
                    <span style={{ fontSize: '0.8rem', color: '#555' }}>Supports Date, Streams, Listeners, Saves columns</span>
                </label>
            </div>

            {error && (
                <div style={{ color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {data.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #2a2a30', color: '#888' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Streams</th>
                                <th style={{ padding: '1rem' }}>Listeners</th>
                                <th style={{ padding: '1rem' }}>Saves</th>
                                <th style={{ padding: '1rem' }}>Sustainability Score</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        borderBottom: '1px solid #2a2a30',
                                        background: row.isSuspicious ? 'rgba(255, 77, 77, 0.1)' : 'transparent',
                                        color: row.isSuspicious ? '#ff4d4d' : 'white'
                                    }}
                                >
                                    <td style={{ padding: '1rem' }}>{row.date}</td>
                                    <td style={{ padding: '1rem' }}>{row.streams.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>{row.listeners.toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>{row.saves.toLocaleString()}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                                        {row.sustainabilityScore}%
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {row.isSuspicious ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                                <TrendingDown size={14} />
                                                SUSPICIOUS ACTIVITY
                                            </div>
                                        ) : (
                                            <span style={{ color: '#00ff88', fontSize: '0.8rem', fontWeight: 600 }}>HEALTHY</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CsvUploader;
