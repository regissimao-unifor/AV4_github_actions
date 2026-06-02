const express = require('express');
const { createApp } = require('../app');
const { createMockSupabase } = require('./mockSupabase');

const PORT = process.env.TEST_PORT ? Number(process.env.TEST_PORT) : 3001;

const seed = [
    { id: 1, name: 'Mock Keyboard', description: 'A mocked keyboard', price: 100 },
    { id: 2, name: 'Mock Mouse', description: 'A mocked mouse', price: 50 },
];

const supabase = createMockSupabase(seed);
const app = createApp(supabase);

// Test-only endpoints to inspect/reset state from Cypress.
const control = express();
control.use(express.json());
control.use(app);

control.post('/__test__/reset', (req, res) => {
    supabase._reset(req.body && req.body.seed ? req.body.seed : seed);
    res.send({ ok: true });
});

control.get('/__test__/state', (req, res) => {
    res.send({ products: supabase._getProducts() });
});

const server = control.listen(PORT, () => {
    console.log(`> Test server (mock supabase) ready on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
