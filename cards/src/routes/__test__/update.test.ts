import request from 'supertest';
import {app} from "../../app";
import mongoose from 'mongoose';
import {CardCondition} from "@ckcards/common";



import {CardUpdatedPublisher} from "../../events/publishers/card-updated-publisher";
import {natsWrapper} from "../../nats-wrapper";
import {Card} from "../../models/card";

const title = 'Borrelsword Dragon';
const condition = CardCondition.Mint;
const description = 'Maximum Gold - Singles';
const price = 4;

it('returns a 404 if the provided id foes not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/cards/${id}`)
        .set('Cookie', global.getAuthCookie())
        .send({
            title,
            condition,
            description,
            price
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/cards/${id}`)
        .send({
            title,
            condition,
            description,
            price
        })
        .expect(401);
});

it('returns a 401 if the user does not own the card', async () => {
    const res = await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title,
            condition,
            description,
            price
        });

    await request(app)
        .put(`/api/cards/${res.body.id}`)
        .set('Cookie', global.getAuthCookie())
        .send({
            title,
            condition,
            description,
            price: 50
        })
        .expect(401);
});

it('returns a 400 if the user provides an invalid title or price or condition', async () => {
    const cookie = global.getAuthCookie();
    const res = await request(app)
        .post('/api/cards')
        .set('Cookie', cookie)
        .send({
            title,
            condition,
            description,
            price,
        });
    await request(app)
        .put(`/api/cards/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            condition,
            description,
            price,
        })
        .expect(400);

    await request(app)
        .put(`/api/cards/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            condition,
            description,
            price: -10
        })
        .expect(400);

    await request(app)
        .put(`/api/cards/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            condition: 'not a valid condition',
            description,
            price
        })
        .expect(400);
});

it('updates the card provided valid inputs', async () => {
    const cookie = global.getAuthCookie();
    const res = await request(app)
        .post('/api/cards')
        .set('Cookie', cookie)
        .send({
            title,
            condition,
            description,
            price,
        });
    await request(app)
        .put(`/api/cards/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            condition,
            description: 'new description',
            price: 7.50,
        })
        .expect(200);

    const updatedCard = await request(app)
        .get(`/api/cards/${res.body.id}`)
        .send();

    expect(updatedCard.body.title).toEqual(title);
    expect(updatedCard.body.condition).toEqual(condition);
    expect(updatedCard.body.description).toEqual('new description');
    expect(updatedCard.body.price).toEqual(7.50);
});

it('publishes an event', async () => {
    const cookie = global.getAuthCookie();
    const res = await request(app)
        .post('/api/cards')
        .set('Cookie', cookie)
        .send({
            title,
            condition,
            description,
            price,
        });
    await request(app)
        .put(`/api/cards/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            condition,
            description: 'new description',
            price: 7.50,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects edit if the card is reserved', async () => {
    const cookie = global.getAuthCookie();
    const res = await request(app)
        .post('/api/cards')
        .set('Cookie', cookie)
        .send({
            title,
            condition,
            description,
            price,
        });

    const card = await Card.findById(res.body.id);

    // Set the Order ID, simulating an order of the card
    card!.set({orderId: mongoose.Types.ObjectId().toHexString()});
    await card!.save();

    await request(app)
        .put(`/api/cards/${res.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'New Title',
            condition,
            description,
            price: 999,
        })
        .expect(400);
});
