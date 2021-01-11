import request from 'supertest';
import {app} from "../../app";

it('responds with details about the current user', async () => {
    const cookie = await global.getAuthCookie();

    const response = await request(app)
        .post('/api/users/currentuser')
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
});
