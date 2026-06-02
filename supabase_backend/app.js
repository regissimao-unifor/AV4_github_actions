const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};

function createApp(supabase) {
    const app = express();

    app.use(cors(corsOptions));
    app.use(morgan('combined'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.get('/products', async (req, res) => {
        const { data, error } = await supabase.from('products').select();
        if (error) return res.status(500).send(error);
        res.send(data);
    });

    app.get('/products/:id', async (req, res) => {
        const { data, error } = await supabase
            .from('products')
            .select()
            .eq('id', req.params.id);
        if (error) return res.status(500).send(error);
        res.send(data);
    });

    app.post('/products', async (req, res) => {
        const { error } = await supabase
            .from('products')
            .insert({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
            });
        if (error) return res.status(500).send(error);
        res.send('created!!');
    });

    app.put('/products/:id', async (req, res) => {
        const { error } = await supabase
            .from('products')
            .update({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
            })
            .eq('id', req.params.id);
        if (error) return res.status(500).send(error);
        res.send('updated!!');
    });

    app.delete('/products/:id', async (req, res) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);
        if (error) return res.status(500).send(error);
        res.send('deleted!!');
    });

    app.get('/', (req, res) => {
        res.send('Hello I am working my friend Supabase <3');
    });

    return app;
}

module.exports = { createApp };

if (require.main === module) {
    const supabase = supabaseClient.createClient(
        'https://fyuasasgzfdvemckaqku.supabase.co',
        'sb_publishable_6AVaqo266ZuztZAUgGZizg_8QaU0_V8'
    );
    const app = createApp(supabase);
    app.listen(3000, () => {
        console.log('> Ready on http://localhost:3000');
    });
}
