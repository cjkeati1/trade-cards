import request from 'supertest';
import {app} from "../../app";
import {CardCondition} from "@ckcards/common/build";

const createCard = () => {
    const title = 'Borrelsword Dragon';
    const condition = CardCondition.Mint;
    const description = 'Maximum Gold - Singles';
    const price = 4;

    return request(app)
        .post('/api/cards')
        .set('Cookie', global.getAuthCookie())
        .send({
            title,
            condition,
            description,
            price
        })
        .expect(201);
};

it('can fetch a list of cards', async () => {
    await createCard();
    await createCard();

    const cardResponse = await request(app)
        .get('/api/cards')
        .send()
        .expect(200);

    expect(cardResponse.body.length).toEqual(2);
});
