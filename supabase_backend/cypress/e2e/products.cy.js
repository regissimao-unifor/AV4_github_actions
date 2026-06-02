describe('Products API (mocked Supabase)', () => {
    beforeEach(() => {
        cy.request('POST', '/__test__/reset');
    });

    it('GET / responds with greeting', () => {
        cy.request('/').then(res => {
            expect(res.status).to.eq(200);
            expect(res.body).to.contain('Supabase');
        });
    });

    it('GET /products returns the seeded products', () => {
        cy.request('/products').then(res => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an('array').with.length(2);
            expect(res.body[0]).to.include({ name: 'Mock Keyboard' });
            expect(res.body[1]).to.include({ name: 'Mock Mouse' });
        });
    });

    it('GET /products/:id returns a single product', () => {
        cy.request('/products/1').then(res => {
            expect(res.status).to.eq(200);
            expect(res.body).to.have.length(1);
            expect(res.body[0]).to.include({ id: 1, name: 'Mock Keyboard' });
        });
    });

    it('GET /products/:id returns empty array for unknown id', () => {
        cy.request('/products/999').then(res => {
            expect(res.status).to.eq(200);
            expect(res.body).to.deep.eq([]);
        });
    });

    it('POST /products creates a new product', () => {
        cy.request('POST', '/products', {
            name: 'Webcam',
            description: '1080p webcam',
            price: 200,
        }).then(res => {
            expect(res.status).to.eq(200);
            expect(res.body).to.eq('created!!');
        });

        cy.request('/products').then(res => {
            expect(res.body).to.have.length(3);
            const created = res.body.find(p => p.name === 'Webcam');
            expect(created).to.include({ description: '1080p webcam', price: 200 });
        });
    });

    it('POST /products with missing name returns an error from supabase', () => {
        cy.request({
            method: 'POST',
            url: '/products',
            failOnStatusCode: false,
            body: { description: 'no name', price: 1 },
        }).then(res => {
            expect(res.status).to.eq(500);
            expect(res.body).to.have.property('message', 'name is required');
        });
    });

    it('PUT /products/:id updates an existing product', () => {
        cy.request('PUT', '/products/1', {
            name: 'Mock Keyboard',
            description: 'Updated description',
            price: 150,
        }).then(res => {
            expect(res.status).to.eq(200);
            expect(res.body).to.eq('updated!!');
        });

        cy.request('/products/1').then(res => {
            expect(res.body[0]).to.include({
                description: 'Updated description',
                price: 150,
            });
        });
    });

    it('DELETE /products/:id removes a product', () => {
        cy.request('DELETE', '/products/2').then(res => {
            expect(res.status).to.eq(200);
            expect(res.body).to.eq('deleted!!');
        });

        cy.request('/products').then(res => {
            expect(res.body).to.have.length(1);
            expect(res.body[0].id).to.eq(1);
        });
    });

    it('full CRUD round trip stays consistent', () => {
        cy.request('POST', '/products', {
            name: 'Monitor',
            description: '4K Monitor',
            price: 999,
        });
        cy.request('/__test__/state').then(res => {
            expect(res.body.products).to.have.length(3);
        });

        cy.request('/products').then(res => {
            const monitor = res.body.find(p => p.name === 'Monitor');
            expect(monitor).to.exist;

            cy.request('DELETE', `/products/${monitor.id}`);
            cy.request('/products').then(after => {
                expect(after.body.map(p => p.name)).to.not.include('Monitor');
            });
        });
    });
});
