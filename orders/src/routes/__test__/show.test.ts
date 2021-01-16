import request from 'supertest';
import {app} from '../../app';
import {Card} from "../../models/card";
import {CardCondition} from "@ckcards/common";
import mongoose from "mongoose";

const buildCard = async () => {
    const title = 'Borrelsword Dragon';
    const condition = CardCondition.Mint;
    const description = 'Maximum Gold - Singles';
    const price = 4;

    const card = Card.build({
        title,
        condition,
        description,
        price
    });

    await card.save();

    return card;
};

it('returns 400 if an invalid order id is supplied', async () => {
    const user = global.getAuthCookie();

    // Make request to fetch the order
    await request(app)
        .get(`/api/orders/invalidId`)
        .set('Cookie', user)
        .send()
        .expect(400);
});

it('returns 401 if a user tries to fetch another user\'s order', async () => {
    const user = global.getAuthCookie();
    const userTwo= global.getAuthCookie();

    const card = await buildCard();

    // Create one order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({cardId: card.id})
        .expect(201);

    // Make request to fetch the order
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);
});

it('returns 404 if the order DNE', async () => {
    const user = global.getAuthCookie();


    // Make request to fetch the order
    await request(app)
        .get(`/api/orders/${new mongoose.Types.ObjectId().toHexString()}`)
        .set('Cookie', user)
        .send()
        .expect(404);
});

it('fetches a user\'s orders', async () => {
    // Create a card
    const card = await buildCard();

    const user = global.getAuthCookie();

    // Create one order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({cardId: card.id})
        .expect(201);

    // Make request to fetch the order
    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

