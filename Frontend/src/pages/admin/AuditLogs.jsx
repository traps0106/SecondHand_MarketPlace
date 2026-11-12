
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
            <div className="page-heading">
                <h2>Audit logs</h2>
                <p>
                    Read-only history of account and listing actions · All times Bahrain (UTC+3).
                </p>
            </div>

            <div className="card">
                <h3 className="card-title">Event history</h3>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Date / time</th>
                            <th scope="col">Actor</th>
                            <th scope="col">Action</th>
                            <th scope="col">Target</th>
                            <th scope="col">Outcome</th>
                            <th scope="col">Details</th>
                        </tr>
                    </thead>

                    <tbody>
                        {logs.map((log, idx) => (
                            <tr key={idx}>
                                <td className="audit-time">{log.time}</td>
                                <td><strong>{log.actor}</strong></td>
                                <td>{log.action}</td>
                                <td>{log.target}</td>
                                <td>
                                    <span className="status-badge">
                                        {log.outcome}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="audit-view-button"
                                        type="button"
                                        aria-label={`View details for ${log.action}, target ${log.target}`}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <div className="audit-detail-heading">
                    <h3 className="card-title">
                        Event EV-208 · Details
                    </h3>
                    <span className="status-badge">Success</span>
                </div>

                <p className="audit-time">
                    04 Nov 2026 · 09:42:18 UTC+3 · Actor: AdminName (Admin)
                </p>

                <p className="audit-event-description">
                    Listing approved · L-201 · Toyota Corolla alternator · Seller: UserName
                </p>

                <p className="audit-change">
                    Change: In review → Active · Seller notified. Recorded by system after approval.
                </p>
            </div>
        </div>
    );
}
