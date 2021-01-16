import request from 'supertest';
import {app} from '../../app';
import {Card} from "../../models/card";
import {CardCondition} from "@ckcards/common";

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

