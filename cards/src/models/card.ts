import mongoose from 'mongoose';
import {CardCondition} from "@ckcards/common";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

interface CardAttrs {
    title: string;
    condition: CardCondition;
    description: string;
    price: number;
    userId: string;
}

interface CardModel extends mongoose.Model<CardDoc> {
    build(attrs: CardAttrs): CardDoc;
}

interface CardDoc extends mongoose.Document {
    title: string;
    condition: CardCondition;
    description: string;
    price: number;
    version: number;
    userId: string;
    orderId?: string;
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
        userId: {
            type: String,
            required: true
        },
        orderId: {
            type: String
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

cardSchema.set('versionKey', 'version');
cardSchema.plugin(updateIfCurrentPlugin);

cardSchema.statics.build = (attrs: CardAttrs) => {
    return new Card(attrs);
};

const Card = mongoose.model<CardDoc, CardModel>('Card', cardSchema);

export {Card};
