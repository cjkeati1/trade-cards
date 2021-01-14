import request from 'supertest';
import {app} from '../../app';
import {CardCondition} from "@ckcards/common";
import mongoose from "mongoose";


it('returns a 404 if the card is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/cards/${id}`)
        .send()
        .expect(404);
});

it('returns the card if the card is found', async () => {
    const title = 'Borrelsword Dragon';
    const condition = CardCondition.Mint;
    const description = 'Maximum Gold - Singles';
    const price = 4;

    const response = await request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title,
            condition,
            description,
            price,
        })
        .expect(201);


    const cardResponse = await request(app)
        .get(`/api/cards/${response.body.id}`)
        .send()
        .expect(200);

    expect(cardResponse.body.title).toEqual(title);
    expect(cardResponse.body.condition).toEqual(condition);
    expect(cardResponse.body.description).toEqual(description);
    expect(cardResponse.body.price).toEqual(price);
});
