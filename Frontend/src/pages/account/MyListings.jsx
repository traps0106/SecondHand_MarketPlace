
import React from 'react';

export default function MyListings() {
    const listings = [
        { id: 'L-201', name: 'Toyota Corolla alternator', year: '2014–2018', price: '35.000', stock: 3, status: 'Active' },
        { id: 'L-202', name: 'Honda Civic headlamp · left', year: '2016–2020', price: '22.000', stock: 2, status: 'Active' },
        { id: 'L-203', name: 'BMW E90 side mirror · right', year: '2005–2011', price: '18.000', stock: 1, status: 'In review' },
    ];

    return (
        <div>
            <div className="page-heading listings-heading">
                <div>
                    <h2>My listings</h2>
                    <p>Create and manage your secondhand car part listings.</p>
                </div>

                <button className="btn-primary" type="button">
                    Create listing
                </button>
            </div>

            <div className="filter-toolbar">
                <div className="filter-search">
                    <label htmlFor="listing-search">
                        Search my listings
                    </label>
                    <input
                        id="listing-search"
                        type="text"
                        placeholder="Part name or vehicle"
                        className="form-input"
                    />
                </div>

                <div className="filter-status">
                    <label htmlFor="listing-status">
                        Moderation status
                    </label>
                    <select
                        id="listing-status"
                        name="listing-status"
                        className="form-input"
                    >
                        <option value="all">All statuses</option>
                        <option value="Active">Active</option>
                        <option value="In review">In review</option>
                    </select>
                </div>

                <button className="btn-secondary" type="button">
                    Apply filters
                </button>
            </div>

            <div className="card">
                <h3 className="card-title">My listing list</h3>
                <p className="card-subtitle">
                    3 listings · Only your listings are shown · Prices in BHD
                </p>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Part / vehicle</th>
                            <th scope="col">Price (BHD)</th>
                            <th scope="col">Stock</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {listings.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <strong>{item.name}</strong>
                                    <div className="listing-meta">
                                        {item.year} · {item.id}
                                    </div>
                                </td>

                                <td>{item.price}</td>
                                <td>{item.stock}</td>

                                <td>
                                    <span className="status-badge">
                                        {item.status}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        className="listing-action"
                                        type="button"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="listing-delete"
                                        type="button"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h4 className="delete-title">
                    Delete listing?
                </h4>

                <p className="delete-listing-name">
                    BMW E90 side mirror · right · 2005–2011 · L-203
                </p>

                <p className="delete-description">
                    This removes the listing from your account and the marketplace.
                    This cannot be undone.
                </p>

                <div className="delete-actions">
                    <button className="btn-primary" type="button">
                        Confirm delete
                    </button>

                    <button className="btn-secondary" type="button">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
