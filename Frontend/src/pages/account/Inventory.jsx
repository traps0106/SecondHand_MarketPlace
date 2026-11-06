import React, { useState } from 'react';

export default function Inventory() {
    const [inventory, setInventory] = useState([
        { id: 'L-201', name: 'Toyota Corolla alternator', year: '2014-2018', savedStock: 3, newStock: '3', avail: 'Available', status: 'Active' },
        { id: 'L-202', name: 'Honda Civic headlamp left', year: '2016-2020', savedStock: 2, newStock: '2', avail: 'Available', status: 'Active' },
        { id: 'L-203', name: 'BMW E90 side mirror right', year: '2005-2011', savedStock: 1, newStock: '1', avail: 'Hidden in review', status: 'In review' },
    ]);

    const [feedback, setFeedback] = useState(null);

    const handleInputChange = (id, val) => {
        setInventory(prev => prev.map(item => item.id === id ? { ...item, newStock: val } : item));
    };

    const handleSave = () => {
        let hasInvalid = false;
        inventory.forEach(item => {
            const num = parseInt(item.newStock, 10);
            if (isNaN(num) || num < 0) hasInvalid = true;
        });

        if (hasInvalid) {
            setFeedback({
                type: 'error',
                text: 'Enter a whole number of 0 or more. Changes were not saved; saved stock remains 3.'
            });
        } else {
            const updatedInventory = inventory.map(item => ({
                ...item,
                savedStock: Number(item.newStock)
            }));

            const changedItems = updatedInventory.filter((item, index) =>
                Number(item.newStock) !== inventory[index].savedStock
            );

            setInventory(updatedInventory);

            setFeedback({
                type: 'success',
                text: changedItems.length > 0
                    ? `Stock saved successfully. ${changedItems.map(item => `${item.name}: ${item.savedStock} units`).join(', ')} saved.`
                    : 'No stock changes were made.'
            });
        }
    };

    const handleCancel = () => {
        setInventory(prev => prev.map(item => ({ ...item, newStock: item.savedStock.toString() })));
        setFeedback(null);
    };

    return (
        <div className="card">
            <h2 className="card-title">Inventory</h2>
            <p className="card-subtitle">Manage stock quantities for your own listings. Enter whole numbers, zero or above.</p>

            {feedback && (
                <div style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    backgroundColor: feedback.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                    color: feedback.type === 'error' ? '#991b1b' : '#166534',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                }}>
                    {feedback.text}
                </div>
            )}

            <table className="data-table" style={{ marginBottom: '1.5rem' }}>
                <thead>
                    <tr>
                        <th>Part/vehicle</th>
                        <th>Saved stock</th>
                        <th>New stock</th>
                        <th>Availability</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <strong>{item.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.year}</div>
                            </td>
                            <td>{item.savedStock}</td>
                            <td>
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ width: '60px', textAlign: 'center' }}
                                    value={item.newStock}
                                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                                />
                            </td>
                            <td>{item.avail}</td>
                            <td><span className="status-badge">{item.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSave} className="btn-primary">Save changes</button>
                <button onClick={handleCancel} className="btn-secondary">Cancel</button>
            </div>
        </div>
    );
}