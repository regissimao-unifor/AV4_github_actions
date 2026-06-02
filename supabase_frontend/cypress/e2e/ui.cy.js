const API = 'http://54.233.46.177:3000';

describe('Product CRUD UI (backend mocked with cy.intercept)', () => {
    beforeEach(() => {
        cy.intercept('GET', `${API}/products`, { fixture: 'products.json' }).as('listProducts');
        cy.intercept('POST', `${API}/products`, { statusCode: 200, body: 'created!!' }).as('createProduct');
        cy.intercept('PUT', `${API}/products/*`, { statusCode: 200, body: 'updated!!' }).as('updateProduct');
        cy.intercept('DELETE', `${API}/products/*`, { statusCode: 200, body: 'deleted!!' }).as('deleteProduct');

        cy.visit('/');
        cy.wait('@listProducts');
    });

    it('renders the page header and forms', () => {
        cy.contains('h1', 'Product CRUD');
        cy.get('#add-product-form').should('exist');
        cy.get('#update-modal').should('not.have.class', 'open');
    });

    it('lists products returned by the API', () => {
        cy.get('#products li').should('have.length', 2);
        cy.get('#products li').first().should('contain', 'Keyboard').and('contain', '$120');
        cy.get('#products li').last().should('contain', 'Mouse').and('contain', '$60');
    });

    it('adds a product through the form', () => {
        cy.get('#add-product-form input[name="name"]').type('Webcam');
        cy.get('#add-product-form input[name="price"]').type('200');
        cy.get('#add-product-form input[name="description"]').type('1080p webcam');

        // After submission the UI re-fetches products. Add a third product to the fixture.
        cy.intercept('GET', `${API}/products`, {
            body: [
                { id: 1, name: 'Keyboard', description: 'Mechanical keyboard', price: 120 },
                { id: 2, name: 'Mouse', description: 'Wireless mouse', price: 60 },
                { id: 3, name: 'Webcam', description: '1080p webcam', price: 200 },
            ],
        }).as('listProductsAfterAdd');

        cy.get('#add-product-form').submit();

        cy.wait('@createProduct').its('request.body').should('deep.eq', {
            name: 'Webcam',
            price: '200',
            description: '1080p webcam',
        });

        cy.wait('@listProductsAfterAdd');
        cy.get('#products li').should('have.length', 3);
        cy.get('#products li').last().should('contain', 'Webcam').and('contain', '$200');
    });

    it('opens the update modal with the product placeholders', () => {
        cy.get('#products li').first().contains('button', 'Update').click();
        cy.get('#update-modal').should('have.class', 'open');
        cy.get('#update-id').should('have.value', '1');
        cy.get('#update-description').should('have.attr', 'placeholder', 'Mechanical keyboard');
        cy.get('#update-price').should('have.attr', 'placeholder', '120');
    });

    it('cancel button closes the update modal', () => {
        cy.get('#products li').first().contains('button', 'Update').click();
        cy.get('#update-modal').should('have.class', 'open');
        cy.get('#update-cancel').click();
        cy.get('#update-modal').should('not.have.class', 'open');
    });

    it('submits the update modal and PUTs to the API', () => {
        cy.get('#products li').first().contains('button', 'Update').click();
        cy.get('#update-description').type('Brand new description');
        cy.get('#update-price').type('199');

        cy.get('#update-product-form').submit();

        cy.wait('@updateProduct').then(interception => {
            expect(interception.request.url).to.match(/\/products\/1$/);
            expect(interception.request.body).to.deep.eq({
                name: 'Keyboard',
                description: 'Brand new description',
                price: '199',
            });
        });
        cy.get('#update-modal').should('not.have.class', 'open');
    });

    it('keeps existing description/price when update fields are blank', () => {
        cy.get('#products li').first().contains('button', 'Update').click();
        cy.get('#update-product-form').submit();

        cy.wait('@updateProduct').its('request.body').should('deep.eq', {
            name: 'Keyboard',
            description: 'Mechanical keyboard',
            price: 120,
        });
    });

    it('deletes a product via the Delete button', () => {
        cy.intercept('GET', `${API}/products`, {
            body: [{ id: 2, name: 'Mouse', description: 'Wireless mouse', price: 60 }],
        }).as('listProductsAfterDelete');

        cy.get('#products li').first().contains('button', 'Delete').click();

        cy.wait('@deleteProduct').its('request.url').should('match', /\/products\/1$/);
        cy.wait('@listProductsAfterDelete');
        cy.get('#products li').should('have.length', 1).and('contain', 'Mouse');
    });
});
