const router = require('express').Router();
const userRouter = require('./user');

router.get('/', (req, res)=>{
    res.send("route checked");
})

router.use('/user', userRouter);

module.exports = router;
