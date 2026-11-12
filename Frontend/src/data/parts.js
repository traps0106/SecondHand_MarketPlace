// Sample data used until the backend is connected.
export const CATEGORIES = [
    'Electrical & ignition',
    'Lighting',
    'Body panels & bumpers',
    'Mirrors & glass',
    'Brakes & suspension',
    'Engine & cooling',
];

export const PARTS = [
    { id: 'L-201', name: 'Toyota Corolla alternator', make: 'Toyota', model: 'Corolla', yearFrom: 2014, yearTo: 2018, category: 'Electrical & ignition', condition: 'Used', price: 35, stock: 3, seller: 'Auto Spares', listed: '02 Nov 2026', description: 'Tested alternator, removed from a 2016 Corolla. No visible damage.' },
    { id: 'L-202', name: 'Honda Civic headlamp · left', make: 'Honda', model: 'Civic', yearFrom: 2016, yearTo: 2020, category: 'Lighting', condition: 'Used', price: 22, stock: 3, seller: 'Hassan Auto Spares', listed: '02 Nov 2026', description: 'Left headlamp assembly, lens clear.' },
    { id: 'L-204', name: 'Nissan Altima starter motor', make: 'Nissan', model: 'Altima', yearFrom: 2013, yearTo: 2018, category: 'Electrical & ignition', condition: 'Used', price: 28, stock: 3, seller: 'Gulf Car Parts', listed: '02 Nov 2026', description: 'Starter motor in working order.' },
    { id: 'L-205', name: 'Ford Focus radiator', make: 'Ford', model: 'Focus', yearFrom: 2012, yearTo: 2018, category: 'Engine & cooling', condition: 'Used', price: 30, stock: 3, seller: 'Auto Spares', listed: '02 Nov 2026', description: 'Radiator, pressure tested.' },
    { id: 'L-206', name: 'Toyota Camry brake caliper', make: 'Toyota', model: 'Camry', yearFrom: 2012, yearTo: 2017, category: 'Brakes & suspension', condition: 'Used', price: 24, stock: 3, seller: 'Gulf Car Parts', listed: '02 Nov 2026', description: 'Front brake caliper, no leaks.' },
];

export const formatBHD = (n) => `BHD ${Number(n).toFixed(3)}`;
export const yearRange = (p) => `${p.yearFrom}–${p.yearTo}`;
