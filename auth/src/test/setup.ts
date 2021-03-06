import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from "supertest";
import {app} from "../app";

let mongo: any;

declare global {
    namespace NodeJS {
        interface Global {
            getAuthCookie(): Promise<string[]>
        }
    }
}

beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasdf';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    // Clear db before each test
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

// Signs up a user and returns their cookie
global.getAuthCookie = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email, password
        })
        .expect(201);

    return response.get('Set-Cookie');
};
