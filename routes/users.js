const express=require('express');
const router = express.Router()
const bcrypt= require('bcryptjs')
const passport=require('passport')

//User model
const User= require('../models/User');
const { request } = require('express');

//login page
router.get('/login',(req,res)=>{
    res.render("login")
})
// register page
router.get('/register',(req,res)=>{
    res.render("register")
})

//Register Handle
router.post('/register',(req,res)=>{

    const { name, email, password, password2} =req.body

    let errors=[]

    //check required field
    if(!name || !email || !password || !password2){
        errors.push({msg: 'please fill in all fields'})
    }

    //check password match
    if(password!==password2){
        errors.push({msg: "please check password"}) 
    }

    //check password length
    if(password.length<6){
        errors.push({msg: 'password should be at least 6 characters'})
    }

    if(errors.length>0){

        res.render('register',{
            errors,
            name,
            email, 
            password,
            password2
        })

    } else{
        // Validation passed
        User.findOne({email:email})
        .then(user=>{
            if(user){
                //User exists
                errors.push({msg: 'Email is already registered'})
                res.render('register',{
                    errors,
                    name,
                    email, 
                    password,
                    password2
                })
            } else{

                const newUser=new User({
                    name,
                    email, 
                    password
                })

               //Hash password
               bcrypt.genSalt(10, (err,salt)=>
               bcrypt.hash(newUser.password,salt,(err, hash)=>{

                if(err) throw err;
                //Set password to hashed
                newUser.password=hash;
                
                // Save user
                newUser.save()
                   .then(user=>{
                       req.flash('success_msg','you are now registered and can login')
                       res.redirect('/users/login')
                   })
                   .catch(err=> console.log(err))

               }))

            }
        })

    }

})
//login handle
router.post('/login',(req,res,next)=>{
   passport.authenticate('local',{
       successRedirect:'/dashboard',
       failureRedirect:'/users/login',
       failureFlash: true
   }) (req, res, next)
})
module.exports=router