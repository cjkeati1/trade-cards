import {Card} from "../card";
import {CardCondition} from "@ckcards/common/build";
import request from "supertest";
import {app} from "../../app";

it('implements optimistic concurrency control', async () => {
    const title = 'Borrelsword Dragon';
    const condition = CardCondition.Mint;
    const description = 'Maximum Gold - Singles';
    const price = 4;

    const card = Card.build({
        userId: '123',
        title,
        condition,
        description,
        price
    });

    // Save card to db
    await card.save();

    // fetch the card twice
    const firstInstance = await Card.findById(card.id);
    const secondInstance = await Card.findById(card.id);

    // make two separate changes to the tickets we fetched
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});

    // save the first fetched card
    await firstInstance!.save();

    // save the second fetched card and expect an error
    try {
        await secondInstance!.save();
    } catch (e) {
        return;
    }

    throw new Error('Should not reach this point');
});
