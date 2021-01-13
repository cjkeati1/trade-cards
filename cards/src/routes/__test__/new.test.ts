import request from 'supertest';
import {app} from '../../app';
import {CardCondition} from "@ckcards/common/build";
import {Card} from "../../models/card";

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
    const title = 'Borrelsword Dragon';
    const condition = CardCondition.Mint;
    const description = 'Maximum Gold - Singles';
    const price = 4;

    await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title,
            condition,
            description,
            price
        })
        .expect(201);

    const cards = await Card.find({});
    expect(cards.length).toEqual(1);
    expect(cards[0].price).toEqual(price);
    expect(cards[0].title).toEqual(title);
    expect(cards[0].condition).toEqual(condition);
    expect(cards[0].description).toEqual(description);

});
