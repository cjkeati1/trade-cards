import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Card} from "../../models/card";
import {natsWrapper} from "../../nats-wrapper";
import {Order} from "../../models/order";
import {CardCondition, OrderStatus} from "@ckcards/common";

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

it('fetches a user\'s orders', async () => {
    const cardOne = await buildCard();
    const cardTwo = await buildCard();
    const cardThree = await buildCard();

    const userOne = global.getAuthCookie();
    const userTwo = global.getAuthCookie();

    // Create an order as User One
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({cardId: cardOne.id})
        .expect(201);

    // Create two orders as User Two
    const {body: orderOne} = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({cardId: cardTwo.id})
        .expect(201);

    const {body: orderTwo} = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({cardId: cardThree.id})
        .expect(201);

    // Make request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    // Make sure we only got the orders for User #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].card.id).toEqual(cardTwo.id);
    expect(response.body[1].card.id).toEqual(cardThree.id);

});

