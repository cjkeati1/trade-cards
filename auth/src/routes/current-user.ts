import express from 'express';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
    res.send('your name is connor')
});

export {router as currentUserRouter};
