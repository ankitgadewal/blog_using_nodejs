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
app.use(session({ secret: 'secretsession', saveUninitialized: true, resave: true }));
const sessio = require('./middleware')
app.use(sessio)
var crypto = require('crypto');
var key = 'password';
var algo = 'aes256';

//database connection
mongoose.connect('mongodb+srv://ankit:mypassword@cluster0.ecku3.mongodb.net/tutorial?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.get('/', function (req, res) {
    Post.find().then((data) => {
        res.render('Homepage', { data: data })
    })
})

app.get("/register", function (req, res) {
    sess = req.session;
    if (sess.username) {
        res.redirect('/newpost')
    }
    else {
        res.render('Register')
    }
})

app.get("/newpost", function (req, res) {
    sess = req.session;
    if (sess.username) {
        res.render('Newpost');
    }
    else {
        res.redirect('/login')
    }
})

app.get('/login', function (req, res) {
    sess = req.session;
    if (sess.username) {
        res.redirect('/newpost')
    }
    else {
        res.render('Login')
    }
})

app.get('/readmore/:id', function (req, res) {
    Post.findOne({ _id: req.params.id }).then((data) => {
        res.render('PostDetail', { data: data })
    })
})

//create new post
app.post('/newpost', encoder, function (req, res) {
    // console.log(req.body);
    sess = req.session;
    if (sess.username) {
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
            res.redirect('/')
        })
            .catch((error) => console.warn(error));
    }
    else {
        res.redirect('/login');
    }
})

//register users
app.post('/register', encoder, function (req, res) {
    var cipher = crypto.createCipher(algo, key);
    var encrypted = cipher.update(req.body.password, 'utf8', 'hex')
        + cipher.final('hex');
    const data = new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        password: encrypted,
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
            var decipher = crypto.createDecipher(algo, key);
            var decrypted = decipher.update(data.password, 'hex', 'utf8') + decipher.final('utf8');
            if (decrypted == req.body.password) {
                sess = req.session;
                req.session.cookie.maxAge = 3600000
                sess.username = req.body.username;
                res.redirect('/')
            }
            else {
                res.send('user not exists')
            }
        }
    }).catch((error) => console.warn(error))
})

//logout a user
app.post('/logout', encoder, function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/login')
    });
})


//delete a post from frontend
app.post('/deletepost/:id', encoder, function (req, res) {
    Post.deleteOne({ _id: req.params.id }).then((result) => {
        res.redirect('/');
    }).catch((err) => { console.warn(err) })
})

//post update api
app.post('/updatepost/:id', encoder, function (req, res) {
    Post.updateOne({
        _id: req.params.id
    },
        {
            $set: {
                title: req.body.title,
                description: req.body.description,
            }
        }
    ).then((result) => {
        res.redirect(`/readmore/${req.params.id}`)
    }).catch((err) => { console.warn(err) })
})

app.get("/search", function(req, res){
    var regex = new RegExp(req.query.query, 'i');
    Post.find({title:regex}).then((data)=>{
        res.render('Search', {data:data})
    })
})

app.listen(4000);