function createMockSupabase(initial = []) {
    let products = initial.map(p => ({ ...p }));
    let nextId = products.reduce((m, p) => Math.max(m, p.id || 0), 0) + 1;

    const api = {
        from(table) {
            if (table !== 'products') {
                throw new Error(`mock supabase only knows the "products" table, got "${table}"`);
            }

            const state = { op: null, payload: null, filter: null };

            function resolveOp() {
                if (state.op === 'select') {
                    let data = products;
                    if (state.filter) {
                        data = data.filter(
                            p => String(p[state.filter.col]) === String(state.filter.val)
                        );
                    }
                    return { data: data.map(p => ({ ...p })), error: null };
                }
                if (state.op === 'insert') {
                    if (!state.payload || !state.payload.name) {
                        return { data: null, error: { message: 'name is required' } };
                    }
                    const row = { id: nextId++, ...state.payload };
                    products.push(row);
                    return { data: [{ ...row }], error: null };
                }
                if (state.op === 'update') {
                    let updated = 0;
                    products = products.map(p => {
                        if (
                            state.filter &&
                            String(p[state.filter.col]) === String(state.filter.val)
                        ) {
                            updated++;
                            return { ...p, ...state.payload };
                        }
                        return p;
                    });
                    if (state.filter && updated === 0) {
                        return { data: null, error: { message: 'not found' } };
                    }
                    return { data: null, error: null };
                }
                if (state.op === 'delete') {
                    const before = products.length;
                    products = products.filter(
                        p =>
                            !(
                                state.filter &&
                                String(p[state.filter.col]) === String(state.filter.val)
                            )
                    );
                    if (state.filter && products.length === before) {
                        return { data: null, error: { message: 'not found' } };
                    }
                    return { data: null, error: null };
                }
                return { data: null, error: null };
            }

            const builder = {
                select() { state.op = 'select'; return builder; },
                insert(row) { state.op = 'insert'; state.payload = row; return builder; },
                update(row) { state.op = 'update'; state.payload = row; return builder; },
                delete() { state.op = 'delete'; return builder; },
                eq(col, val) { state.filter = { col, val }; return builder; },
                then(resolve, reject) {
                    try { resolve(resolveOp()); } catch (e) { reject(e); }
                },
            };
            return builder;
        },
        _reset(seed = []) {
            products = seed.map(p => ({ ...p }));
            nextId = products.reduce((m, p) => Math.max(m, p.id || 0), 0) + 1;
        },
        _getProducts() { return products.map(p => ({ ...p })); },
    };

    return api;
}

module.exports = { createMockSupabase };
