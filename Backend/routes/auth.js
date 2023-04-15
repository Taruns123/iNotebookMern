const express = require('express');
const User = require('../models/User');
const router = express.Router()
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Tarun';

// Create a User using: POST "/api/auth/createUser". No login required
router.post('/createUser',[
    body('email','enter a valid email').isEmail(),
    body('name', 'enter a valid name').isLength({min:3}),
    body('password','invalid password').isLength({min:4}),
], async (req,res)=>{
    
    let success = false;
    //if errors return bad request and the errors
    try {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors: errors.array()});
    }
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({success,error: "sorry the email already exists"});
    }

        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
            
        })
   
    const data ={
        user:{
            id: user.id
        }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    console.log(authToken);
    
    success = true;
    res.json({success,authToken});
    } catch (error) {
        console.error(error);
    
    }
})


// Authenticate a user POST "api/auth/login"
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','password cannot be blank').exists(),
], async(req,res)=>{
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors: errors.array()});
    }

    const {email, password} = req.body;

    try{
        let user = await User.findOne({email});

        if(!user){
            return res.status(400).json({success,error: "sorry the user doesn't exists"});

        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            return res.status(400).json({success,error: "invalid credentials"});

        }

        const data ={
            user:{
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success,authToken});
    }catch(err){
        console.log(err);
        res.status(500).send(success,"error occured");
    }
});


// ROUTE 3: get user detail using : POST "/api/auth/getUser" , Login required
router.post('/getUser',fetchuser, async(req,res)=>{
        try {
            let userId = req.user.id;
            const user = await User.findById(userId).select("password");
            res.send(user);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal server error");
        }
});

module.exports = router;