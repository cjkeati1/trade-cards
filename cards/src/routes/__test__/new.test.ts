import request from 'supertest';
import {app} from '../../app';

it('has a route handler listening to /api/cards for post requests', async () => {
    const res = await request(app)
        .post('/api/cards')
        .send({});

    expect(res.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/cards')
        .send({})
        .expect(401);
});

it('returns an error if an invalid title is provided', async () => {

});

it('creates a ticket if an invalid price is provided', async () => {

});
