import request from 'supertest';
import {app} from '../../app';
import {Card} from "../../models/card";
import {Order, OrderStatus} from "../../models/order";
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

    // Make request to cancel the order
    await request(app)
        .patch(`/api/orders/invalidId`)
        .set('Cookie', user)
        .send()
        .expect(400);
});

it('returns 401 if a user tries to cancel another user\'s order', async () => {
    const user = global.getAuthCookie();
    const userTwo= global.getAuthCookie();

    const card = await buildCard();

    // Create one order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({cardId: card.id})
        .expect(201);

    // Make request to cancel the order
    await request(app)
        .patch(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);
});

it('returns 404 if the order DNE', async () => {
    const user = global.getAuthCookie();

    // Make request to cancel the order
    await request(app)
        .patch(`/api/orders/${new mongoose.Types.ObjectId().toHexString()}`)
        .set('Cookie', user)
        .send()
        .expect(404);
});
it('Marks an order as cancelled', async () => {
    // Create a card
    const card = await buildCard();

    const user = global.getAuthCookie();

    // Create one order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({cardId: card.id})
        .expect(201);
    
    // Make request to cancel the order
    await request(app)
        .patch(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    // Make sure the order is cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
