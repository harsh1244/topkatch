var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var db

MongoClient.connect('mongodb://api:cs252lab6@ds119618.mlab.com:19618/vendez-vous-users', (err, client) => {
  if (err) return console.log(err)
  db = client.db('vendez-vous-users')
  console.log('connected to mongodb')
  app.listen(3702, () => {
    console.log('listening on 3702')
  })
})

app.get('/', function(req, res) {
  res.send('vendez-vous api')
});

app.post('/user-login', (req, res) => {
  console.log(req.body);
  var user = {
    "_id": req.body.id,
    "user_name": req.body.name,
    "link": req.body.link,
    "email": req.body.email,
    "picture": req.body.picture /*.data.url*/ ,
    "location": {},
    "bio": "",
    "interests": "",
    "matches": []
  };
  // check if exists
  db.collection('users').findOne({
    "_id": user._id
  }, function(err, result) {
    if (err) console.log(err);
    else {
      if (result) {
        // res.send("user exists!");
        console.log("user exists in the database");
      } else {
        // add to database
        db.collection('users').save(user, (err, result) => {
          if (err) console.log(err);
          else {
            console.log('saved to database');
            // res.send("user logged in!");
          }
        });
      }
    }
  });
});


app.post('/update-profile', (req, res) => {
  var user = {
    "_id": req.body.id,
    "bio": req.body.bio,
    "interests": req.body.interests
  };
  // check if exists
  db.collection('users').findOne({
    "_id": user._id
  }, function(err, result) {
    if (err) console.log(err);
    else {
      if (result) {
        // update database
        db.collection('users').update({
          "_id": req.body.id
        }, {
          $set: {
            "bio": user.bio,
            "interests": user.interests
          }
        }, {
          w: 1
        }, (err, result) => {
          if (err) console.log(err);
          else {
            console.log('updated database');
            // res.send("user profile updated");
          }
        });
      } else {
        // res.send("user does not exist!");
        console.log("user does not exist in the database");
      }
    }
  });
});


app.get('/get-profile', (req, res) => {
  var user = {
    "_id": req.headers.id
  };
  // check if exists
  db.collection('users').findOne({
    "_id": user._id
  }, function(err, result) {
    if (err) console.log(err);
    else {
      if (result) {
        var toSend = {
          "_id": result._id,
          "bio": result.bio,
          "interests": result.interests
        }
        res.send(toSend);
      } else {
        // res.send("user does not exist!");
        console.log("user does not exist in the database");
      }
    }
  });
});



app.post('/send-location', (req, res) => {
  // console.log(req.body);
  var user = {
    "_id": req.body.id,
    "location": {
      "latitude": req.body.latitude,
      "longitude": req.body.longitude
    }
  };
  // check if exists
  db.collection('users').findOne({
    "_id": user._id
  }, function(err, result) {
    if (err) console.log(err);
    else {
      if (result) {
        // update database
        db.collection('users').update({
          "_id": user._id
        }, {
          $set: {
            "location": user.location
          }
        }, {
          w: 1
        }, (err, result) => {
          if (err) console.log(err);
          else {
            console.log('updated database');
            // res.send("user location updated");
          }
        });
      } else {
        // res.send("user does not exist!");
        console.log("user does not exist in the database");
      }
    }
  });
});


app.post('/like', (req, res) => {
  var user = {
    "_id": req.body.id,
    "other_user": req.body.other
  };
  // check if exists
  db.collection('users').findOne({
    "_id": user.other_user
  }, function(err, result) {
    if (err) console.log(err);
    else {
      if (result) {
        // update database
        var matches_copy = result.matches.slice()
        if (!matches_copy.includes(user._id)) {
          matches_copy.push(user._id);
        }
        db.collection('users').update({
          "_id": user.other_user
        }, {
          $set: {
            // TODO append to the array of matches:
            "matches": matches_copy
          }
        }, {
          w: 1
        }, (err, result) => {
          if (err) console.log(err);
          else {
            console.log('updated database');
            // res.send("liked! ;)");
          }
        });
      } else {
        // res.send("this user does not exist!");
        console.log("user does not exist in the database");
      }
    }
  });
});



















