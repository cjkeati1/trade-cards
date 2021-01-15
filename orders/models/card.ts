import mongoose from 'mongoose';
import {CardCondition} from "@ckcards/common";

interface CardAttrs {
    title: string;
    condition: CardCondition;
    description: string;
    price: number;
}

interface CardModel extends mongoose.Model<CardDoc> {
    build(attrs: CardAttrs): CardDoc;
}

export interface CardDoc extends mongoose.Document {
    title: string;
    condition: CardCondition;
    description: string;
    price: number;
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

cardSchema.statics.build = (attrs: CardAttrs) => {
    return new Card(attrs);
};

const Card = mongoose.model<CardDoc, CardModel>('Card', cardSchema);

export {Card};
