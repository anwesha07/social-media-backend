const router = require('express').Router();
const authRouter = require('./auth.route');
const userRouter = require('./user.route');


router.get('/', (req, res)=>{
    res.json("main route checked");
})

router.use('/auth', authRouter);
router.use('/user', userRouter);


module.exports = router;
