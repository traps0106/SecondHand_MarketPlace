
import React, { useState } from 'react';

export default function ListingModeration() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All statuses');
    const [rejectionReason, setRejectionReason] = useState(
        'Add clear photos of the mirror and connector'
    );

    const listings = [
        {
            id: 'L-203',
            name: 'BMW E90 side mirror · right',
            year: '2005–2011',
            seller: 'UserName',
            status: 'In review',
            selected: true,
        },
        {
            id: 'L-201',
            name: 'Toyota Corolla alternator',
            year: '2014–2018',
            seller: 'UserName',
            status: 'Active',
        },
    ];

    const filteredListings = listings.filter((listing) => {
        const matchesSearch =
            listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.seller.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'All statuses' ||
            listing.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <div className="page-heading">
                <h2>Listing moderation</h2>
            </div>

            <div className="filter-toolbar moderation-toolbar">
                <div className="filter-search">
                    <label htmlFor="moderation-search">Search listings</label>
                    <input
                        id="moderation-search"
                        name="moderation-search"
                        type="text"
                        placeholder="Part, listing ID or seller"
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-status">
                    <label htmlFor="moderation-status">Status</label>
                    <select
                        id="moderation-status"
                        name="moderation-status"
                        className="form-input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All statuses">All statuses</option>
                        <option value="In review">In review</option>
                        <option value="Active">Active</option>
                    </select>
                </div>

                <button className="btn-secondary" type="button">
                    Search
                </button>
            </div>

            <div className="moderation-grid">
                <div className="card moderation-table-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th scope="col">Listing / seller</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredListings.length > 0 ? (
                                filteredListings.map((listing) => (
                                    <tr
                                        key={listing.id}
                                        className={
                                            listing.selected
                                                ? 'selected-listing-row'
                                                : ''
                                        }
                                    >
                                        <td>
                                            <strong>{listing.name}</strong>
                                            <div className="listing-meta">
                                                {listing.year} · {listing.id}
                                            </div>
                                            {listing.selected && (
                                                <div className="listing-meta">
                                                    Seller: {listing.seller}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="status-badge">
                                                {listing.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="listing-action"
                                                type="button"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3">
                                        No matching listings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div>
                    <div className="card">
                        <h3 className="card-title">
                            Listing preview · L-203
                        </h3>

                        <p className="moderation-preview-title">
                            BMW E90 side mirror · right · 2005–2011
                        </p>

                        <p className="moderation-meta">
                            Seller: UserName · ActualName | Phone number | email
                        </p>

                        <p className="moderation-meta moderation-spacing">
                            Used · BHD18.000 · Stock: 1 · In review
                        </p>

                        <p className="moderation-meta moderation-description">
                            Description: Used right-side mirror; housing intact.
                        </p>

                        <div className="moderation-actions">
                            <button className="btn-primary" type="button">
                                Approve listing
                            </button>
                            <button className="btn-secondary" type="button">
                                Reject listing
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title">Reject listing?</h3>

                        <div className="form-group">
                            <label htmlFor="rejection-reason">
                                Reason *
                            </label>
                            <input
                                id="rejection-reason"
                                name="rejection-reason"
                                type="text"
                                className="form-input"
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                            />
                        </div>

                        <p className="moderation-meta moderation-description">
                            L-203 will not be published. This reason will be
                            shown to UserName.
                        </p>

                        <div className="moderation-actions">
                            <button className="btn-primary" type="button">
                                Confirm rejection
                            </button>
                            <button className="btn-secondary" type="button">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
