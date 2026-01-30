import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import CsvUploader from './components/CsvUploader';



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [provider, setProvider] = useState('All'); // 'All' | 'Soundcharts' | 'Spotify'
  const [activeTab, setActiveTab] = useState('monitoring'); // 'monitoring' | 'deep-dive'

  useEffect(() => {
    fetchTracks();
  }, []);


  const fetchTracks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tracks`);
      setTracks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setLoading(false);
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch =
      track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.isrc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvider =
      provider === 'All' ||
      (provider === 'Spotify' && track.playlist_source.includes('Spotify')) ||
      (provider === 'Soundcharts' && !track.playlist_source.includes('Spotify')); // Fallback logic for mock

    return matchesSearch && matchesProvider;
  });


  if (loading) return <div className="dashboard">Loading...</div>;

  return (
    <div className="dashboard">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={32} color="#00ff88" />
          <h1>Royalty Shield <span style={{ color: '#a0a0a0', fontWeight: 400 }}>v1.0</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#16161a', padding: '0.4rem', borderRadius: '12px', border: '1px solid #2a2a30' }}>
          {['All', 'Soundcharts', 'Spotify'].map(p => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: 'none',
                background: provider === p ? '#00ff88' : 'transparent',
                color: provider === p ? '#000' : '#888',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="shield-badge">
          <CheckCircle2 size={16} />
          B2B COMPLIANT ACTIVE
        </div>
      </header>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #2a2a30' }}>
        <button
          onClick={() => setActiveTab('monitoring')}
          style={{
            padding: '1rem 0',
            background: 'none',
            border: 'none',
            color: activeTab === 'monitoring' ? '#00ff88' : '#888',
            borderBottom: activeTab === 'monitoring' ? '2px solid #00ff88' : 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Active Monitoring
        </button>
        <button
          onClick={() => setActiveTab('deep-dive')}
          style={{
            padding: '1rem 0',
            background: 'none',
            border: 'none',
            color: activeTab === 'deep-dive' ? '#00ff88' : '#888',
            borderBottom: activeTab === 'deep-dive' ? '2px solid #00ff88' : 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Manual Deep-Dive (CSV)
        </button>
      </div>

      {activeTab === 'monitoring' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Live Stream Integrity</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="text"
                  placeholder="Search ISRC or Title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', background: '#16161a', border: '1px solid #2a2a30', borderRadius: '8px', color: 'white', width: '250px' }}
                />
              </div>
            </div>
          </div>

          <div className="tracks-grid">
            {filteredTracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
            {filteredTracks.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#a0a0a0' }}>
                No tracks found matching "{searchTerm}"
              </div>
            )}
          </div>
        </>
      ) : (
        <CsvUploader />
      )}
    </div>
  );
}


function TrackCard({ track }) {
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const [generating, setGenerating] = useState(false);

  const runAudit = async () => {
    setAuditing(true);
    try {
      const response = await axios.post(`${API_URL}/tracks/${track.id}/audit`);
      setAuditResult(response.data);
    } catch (error) {
      console.error('Audit failed:', error);
    }
    setAuditing(false);
  };

  const generateDispute = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/tracks/${track.id}/dispute`);

      const draft = response.data;

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Royalty Shield - Dispute Package", 10, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 30);

      doc.setFontSize(12);
      doc.text(`Subject: ${draft.subject}`, 10, 45);

      doc.setFontSize(11);
      const splitBody = doc.splitTextToSize(draft.body, 180);
      doc.text(splitBody, 10, 60);

      doc.save(`Dispute_Package_${track.isrc}.pdf`);
    } catch (error) {
      console.error('Dispute generation failed:', error);
    }
    setGenerating(false);
  };

  const status = auditResult ? auditResult.riskLevel : track.status;


  return (
    <div className={`track-card ${track.isHighGrowth || (auditResult && auditResult.riskLevel === 'Red') ? 'flagged' : ''}`}>
      <div className="card-header">
        <div className="track-info">
          <h3>{track.name}</h3>
          <p>{track.artist}</p>
          <p style={{ fontSize: '0.7rem' }}>ISRC: {track.isrc}</p>
        </div>
        <div className={`status-dot ${status.toLowerCase()}`} title={`Status: ${status}`} />
      </div>

      <div className="metrics">
        <div className="metric">
          <span className="metric-label">DAILY STREAMS</span>
          <span className="metric-value">{track.current_streams.toLocaleString()}</span>
        </div>
        <div className="metric">
          <span className="metric-label">GROWTH (24H)</span>
          <span className={`growth-tag ${parseFloat(track.growth) > 50 ? 'warning' : 'positive'}`}>
            {parseFloat(track.growth) > 0 ? '+' : ''}{track.growth}%
          </span>
        </div>
      </div>

      <div className="metric" style={{ marginBottom: '1rem' }}>
        <span className="metric-label">SOURCE</span>
        <span style={{ fontSize: '0.9rem', color: track.isHighGrowth ? '#ff4d4d' : 'white' }}>
          {track.playlist_source}
        </span>
      </div>

      {(track.isHighGrowth && !auditResult) && (
        <div className="flag-alert">
          <h4><AlertTriangle size={14} /> ANOMALY DETECTED</h4>
          <p>Sudden spike in streams from unverified source. Manual audit recommended.</p>
        </div>
      )}

      {auditResult && (
        <div className="flag-alert" style={{
          background: auditResult.riskLevel === 'Red' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 255, 136, 0.05)',
          borderColor: auditResult.riskLevel === 'Red' ? 'rgba(255, 77, 77, 0.3)' : 'rgba(0, 255, 136, 0.2)'
        }}>
          <h4 style={{ color: auditResult.riskLevel === 'Red' ? '#ff4d4d' : '#00ff88' }}>
            {auditResult.riskLevel === 'Red' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            SHIELD STATUS: {auditResult.riskLevel.toUpperCase()}
          </h4>
          {auditResult.findings.map((finding, i) => (
            <p key={i} style={{ color: '#eee', marginBottom: '0.2rem', fontSize: '0.75rem' }}>• {finding}</p>
          ))}
        </div>
      )}

      <div className="card-footer" style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="audit-btn"
          onClick={runAudit}
          disabled={auditing}
          style={{ background: auditResult ? 'transparent' : '', flex: 1 }}
        >
          {auditing ? 'Analyzing Behavioral Signatures...' : (auditResult ? 'Re-Run Audit' : 'Run Forensic Audit')}
        </button>

        {auditResult && auditResult.riskLevel === 'Red' && (
          <button
            className="audit-btn"
            onClick={generateDispute}
            disabled={generating}
            style={{ background: '#ff4d4d', border: 'none', flex: 1 }}
          >
            {generating ? 'Drafting...' : 'Generate Dispute'}
          </button>
        )}
      </div>

    </div>
  );
}


export default App;
