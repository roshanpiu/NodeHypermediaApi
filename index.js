var express = require('express');
var app = express();
var Datastore = require('nedb');
var db = {};

var setupResponder = function (res) {
    return function (err, results) {
        if(err){
            res.send(JSON.stringify(err));
        }else {
            res.send(JSON.stringify(results));
        }
    };
};


db.movies = new Datastore({filename: 'db/movies', autoload: true});

app.use(express.bodyParser());

//routes
app.get('/',function (req, res) {
    res.end("The API is working");
})
.post('/movies', function (req, res) {
    var body = req.body;
    var respond = setupResponder(res);

    res.set('Content-type', 'application/json');

    switch (body.action) {
        case "viewList":
            db.movies.find({}, respond);
            break;

        case "addNew":
            db.movies.insert({title: body.title}, respond);
            break;

        default:
            respond("No action given");
    }


})
.post('/movies/:id',function (req, res) {
    var body = req.body;
    var respond = setupResponder(res);

    res.set('Content-type', 'application/json');

    switch (body.action) {
        case "rate":
            db.movies.update({ _id: req.params.id}, { $set: {rating: body.rating}}, function (err, num) {
                respond(err, {success: num +" records updated"});
            });
            break;
        case "view":
            db.movies.findOne({_id: req.params.id}, respond);
            break;
        default:
            respond("No action given");
    }

})
.post('/rpc', function (req, res) {
    var body = req.body;

    var respond = function (err, results) {
        if(err){
            res.send(JSON.stringify(err));
        }else {
            res.send(JSON.stringify(results));
        }
    }

    res.set('Content-type', 'application/json');

    switch (body.action) {
        case "getMovies":
            db.movies.find({}, respond);
            break;

        case "addMovie":
            db.movies.insert({title: body.title}, respond);
            break;

        case "rateMovie":
            db.movies.update({title: body.title}, { $set: {rating: body.rating}}, function (err, num) {
                respond(err, {success: num +" records updated"});
            });
            break;

        default:
            respond("No action given");
    }

})
.listen(3000);
