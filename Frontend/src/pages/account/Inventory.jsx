
import React, { useState } from 'react';

export default function Inventory() {
    const [inventory, setInventory] = useState([
        { id: 'L-201', name: 'Toyota Corolla alternator', year: '2014-2018', savedStock: 3, newStock: '3', avail: 'Available', status: 'Active' },
        { id: 'L-202', name: 'Honda Civic headlamp left', year: '2016-2020', savedStock: 2, newStock: '2', avail: 'Available', status: 'Active' },
        { id: 'L-203', name: 'BMW E90 side mirror right', year: '2005-2011', savedStock: 1, newStock: '1', avail: 'Hidden in review', status: 'In review' },
    ]);

    const [feedback, setFeedback] = useState(null);

    const handleInputChange = (id, val) => {
        setInventory(prev =>
            prev.map(item =>
                item.id === id ? { ...item, newStock: val } : item
            )
        );
    };

    const handleSave = () => {
        let hasInvalid = false;

        inventory.forEach(item => {
            const num = Number(item.newStock);

            if (
                item.newStock.trim() === '' ||
                !Number.isInteger(num) ||
                num < 0
            ) {
                hasInvalid = true;
            }
        });

        if (hasInvalid) {
            setFeedback({
                type: 'error',
                text: 'Enter a whole number of 0 or more. Changes were not saved.'
            });
        } else {
            const updatedInventory = inventory.map(item => ({
                ...item,
                savedStock: Number(item.newStock)
            }));

            const changedItems = updatedInventory.filter((item, index) =>
                item.savedStock !== inventory[index].savedStock
            );

            setInventory(updatedInventory);

            setFeedback({
                type: 'success',
                text: changedItems.length > 0
                    ? `Stock saved successfully. ${changedItems.map(item =>
                        `${item.name}: ${item.savedStock} units`
                    ).join(', ')} saved.`
                    : 'No stock changes were made.'
            });
        }
    };

    const handleCancel = () => {
        setInventory(prev =>
            prev.map(item => ({
                ...item,
                newStock: item.savedStock.toString()
            }))
        );

        setFeedback(null);
    };

    return (
        <div className="card">
            <h2 className="card-title">Inventory</h2>

            <p className="card-subtitle">
                Manage stock quantities for your own listings. Enter whole numbers, zero or above.
            </p>

            {feedback && (
                <div
                    className={`inventory-feedback ${feedback.type}`}
                    role="status"
                    aria-live="polite"
                >
                    {feedback.text}
                </div>
            )}

            <table className="data-table inventory-table">
                <thead>
                    <tr>
                        <th scope="col">Part/vehicle</th>
                        <th scope="col">Saved stock</th>
                        <th scope="col">New stock</th>
                        <th scope="col">Availability</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>

                <tbody>
                    {inventory.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <strong>{item.name}</strong>
                                <div className="inventory-meta">
                                    {item.year} · {item.id}
                                </div>
                            </td>

                            <td>{item.savedStock}</td>

                            <td>
                                <label
                                    className="sr-only"
                                    htmlFor={`stock-${item.id}`}
                                >
                                    New stock quantity for {item.name}
                                </label>

                                <input
                                    id={`stock-${item.id}`}
                                    name={`stock-${item.id}`}
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="form-input stock-input"
                                    value={item.newStock}
                                    onChange={(e) =>
                                        handleInputChange(item.id, e.target.value)
                                    }
                                />
                            </td>

                            <td>{item.avail}</td>

                            <td>
                                <span className="status-badge">
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="inventory-actions">
                <button
                    onClick={handleSave}
                    className="btn-primary"
                    type="button"
                >
                    Save changes
                </button>

                <button
                    onClick={handleCancel}
                    className="btn-secondary"
                    type="button"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
