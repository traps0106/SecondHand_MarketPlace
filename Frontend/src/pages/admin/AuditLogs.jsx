import React from 'react';

export default function AuditLogs() {
    const logs = [
        { time: '04 Nov 2026 · 09:42', actor: 'AdminName', action: 'Listing approved', target: 'L-201', outcome: 'Success' },
        { time: '04 Nov 2026 · 09:36', actor: 'AdminName', action: 'Listing rejected', target: 'L-198', outcome: 'Success' },
        { time: '04 Nov 2026 · 09:20', actor: 'AdminName', action: 'User suspended', target: 'U-018', outcome: 'Success' },
        { time: '03 Nov 2026 · 16:05', actor: 'UserName', action: 'Admin access attempted', target: 'Moderation', outcome: 'Denied' },
    ];

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Audit logs</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Read-only history of account and listing actions · All times Bahrain (UTC+3).</p>
            </div>

            <div className="card">
                <h3 className="card-title">Event history</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date / time</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>Outcome</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, idx) => (
                            <tr key={idx}>
                                <td style={{ fontSize: '0.75rem', color: '#6b7280' }}>{log.time}</td>
                                <td><strong>{log.actor}</strong></td>
                                <td>{log.action}</td>
                                <td>{log.target}</td>
                                <td>{log.outcome}</td>
                                <td><button style={{ border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}>View</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 'bold' }}>Event EV-208 · Details</h4>
                    <span className="status-badge">Success</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>04 Nov 2026 · 09:42:18 UTC+3 · Actor: AdminName (Admin)</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: '0.25rem 0' }}>Listing approved · L-201 · Toyota Corolla alternator · Seller: UserName</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Change: In review → Active · Seller notified. Recorded by system after approval.</p>
            </div>
        </div>
    );
}