import request from 'supertest';
import {app} from '../../app';
import {CardCondition} from "@ckcards/common/build";

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
    await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title: '',
            price: 10
        })
        .expect(400);

    await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            price: 10
        })
        .expect(400);
});

it('returns an error if an invalid condition is provided', async () => {
    await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title: 'Title',
            price: 10,
            condition: 'ffdshdsfh'
        })
        .expect(400);

    await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title: 'Title',
            price: 10
        })
        .expect(400);

});

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title: 'Title',
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title: 'Title'
        })
        .expect(400);
});

it('creates a card with valid inputs', async () => {
    // add in a check to make sure a card was saved
    await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title: 'Title',
            condition: CardCondition.Excellent,
            description: 'Description',
            price: 20
        })
        .expect(201);

});
