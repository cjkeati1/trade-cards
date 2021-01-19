import mongoose from 'mongoose';
import {CardCondition} from "@ckcards/common";
import {Order, OrderStatus} from "./order";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

interface CardAttrs {
    id: string;
    title: string;
    condition: CardCondition;
    description: string;
    price: number;
}

interface CardModel extends mongoose.Model<CardDoc> {
    build(attrs: CardAttrs): CardDoc;

    findByEvent(event: { id: string, version: number }): Promise<CardDoc> | null;
}

export interface CardDoc extends mongoose.Document {
    title: string;
    condition: CardCondition;
    description: string;
    price: number;
    version: number;

    isReserved(): Promise<boolean>
}

const cardSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        condition: {
            type: CardCondition,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        price: {
            type: Number,
            required: true
        },
    },
    {
        // Serialize the response
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    });

cardSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Card.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

cardSchema.statics.build = (attrs: CardAttrs) => {
    return new Card({
        _id: attrs.id,
        title: attrs.title,
        condition: attrs.condition,
        description: attrs.description,
        price: attrs.price
    });
};

cardSchema.set('versionKey', 'version');
cardSchema.plugin(updateIfCurrentPlugin);


cardSchema.methods.isReserved = async function () {
    // Make sure that the card is not already reserved or bought
    const existingOrder = await Order.findOne({
        card: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.Complete
            ]
        }
    });


    // Makes sure to return false is it is null
    return existingOrder !== null;
};


const Card = mongoose.model<CardDoc, CardModel>('Card', cardSchema);

export {Card};
