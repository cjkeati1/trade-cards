import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../../app';
import {Card} from "../../models/card";
import {natsWrapper} from "../../nats-wrapper";
import {Order} from "../../models/order";
import {CardCondition, OrderStatus} from "@ckcards/common";

it('returns an error if the card does not exist', async () => {
    const cardId = mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.getAuthCookie())
        .send({cardId})
        .expect(404);
});

it('returns an error if the card is already reserved', async () => {
    const title = 'Borrelsword Dragon';
    const condition = CardCondition.Mint;
    const description = 'Maximum Gold - Singles';
    const price = 4;

    const card = Card.build({
        title,
        condition,
        description,
        price,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await card.save();

    const order = Order.build({
        card,
        userId: 'lasksfjksdfla',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.getAuthCookie())
        .send({cardId: card.id})
        .expect(400);
});

it('reserves a card', async () => {
    const title = 'Borrelsword Dragon';
    const condition = CardCondition.Mint;
    const description = 'Maximum Gold - Singles';
    const price = 4;

    const card = Card.build({
        title,
        condition,
        description,
        price,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await card.save();


    await request(app)
        .post('/api/orders')
        .set('Cookie', global.getAuthCookie())
        .send({cardId: card.id})
        .expect(201);
});

it('emits an order created event', async () => {
    const title = 'Borrelsword Dragon';
    const condition = CardCondition.Mint;
    const description = 'Maximum Gold - Singles';
    const price = 4;

    const card = Card.build({
        title,
        condition,
        description,
        price,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await card.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.getAuthCookie())
        .send({cardId: card.id})
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

