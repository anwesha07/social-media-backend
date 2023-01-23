const router = require('express').Router();
const authRouter = require('./auth');
const userRouter = require('./user');


router.get('/', (req, res)=>{
    res.json("main route checked");
})

router.use('/auth', authRouter);
router.use('/user', userRouter);


module.exports = router;
