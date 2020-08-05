const express = require('express');
const app = express()
var bodyparser = require('body-parser');
var encoder = bodyparser.urlencoded();
let User = require('./models/usermodel');
let Post = require('./models/postmodel');
const mongoose = require('mongoose');
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
const session = require('express-session');
const { request } = require('express');
app.use(session({secret: 'secretsession',saveUninitialized: true,resave: true}));
const sessio = require('./middleware')
app.use(sessio)

//database connection
mongoose.connect('mongodb+srv://ankit:mypassword@cluster0.ecku3.mongodb.net/tutorial?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.get('/', function(req,res){
    Post.find().then((data) => {
        res.render('Homepage', {data:data})
    })
})

app.get("/register", function (req, res) {
    sess = req.session;
    if(sess.username){
        res.redirect('/newpost')
    }
    else{
        res.render('Register')
    }
})

app.get("/newpost", function (req, res) {
    sess = req.session;
    if(sess.username){
        res.render('Newpost');
    }
    else{
        res.redirect('/login')
    }
})

app.get('/login', function (req, res) {
    sess = req.session;
    if(sess.username){
        res.redirect('/newpost')
    }
    else{
        res.render('Login')
    }
})

//create new post
app.post('/newpost', encoder, function (req, res) {
    // console.log(req.body);
    sess = req.session; 
    if(sess.username) {
        User.findOne({ username: sess.username }).then((data) => {
            var userid = data.id; 
        })
        const data = new Post({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            description: req.body.description,
            authorid: this.userid,
            authorname: sess.username
        })
        data.save().then((result) => {
            res.status(201).json(result);
        })
            .catch((error) => console.warn(error))
    }
    else{
        res.redirect('/login')
    }
})

//register users
app.post('/register', encoder, function (req, res) {
    const data = new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        password: req.body.password,
    })
    data.save().then((result) => {
        res.status(201).json(result);
        console.warn('user registered successfully');
    }).catch((error) => console.warn(error))
})

//login Users and make a session if the username and password are match with the database
app.post('/login', encoder, function (req, res) {
    sess = req.session;
    User.findOne({ username: req.body.username }).then((data) => {
        if (data == null) {
            res.send('You are not registered with us')
        }
        else {
            var decrypted = data.password
            if (decrypted == req.body.password) {
                sess = req.session;
                req.session.cookie.maxAge = 3600000
                sess.username = req.body.username;
                res.redirect('/newpost')
            }
            else{
                res.send('password is incorrect... please try again')
            }
        }
    }).catch((error) => console.warn(error))
})

app.post('/logout', encoder, function (req, res) {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/login')
    });
})

app.listen(4000)