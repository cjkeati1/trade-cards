import mongoose from 'mongoose';

interface CardAttrs {
    title: string;
    description: string;
    price: number;
    userId: string;
}

interface CardModel extends mongoose.Model<CardDoc> {
    build(attrs: CardAttrs): CardDoc;
}

interface CardDoc extends mongoose.Document {
    title: string;
    description: string;
    price: number;
    userId: string;
}

const cardSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        userId: {
            type: String,
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
