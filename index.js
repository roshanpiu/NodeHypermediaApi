var express = require('express');
var app = express();
var Datastore = require('nedb');
var db = {};
var responder = require('./httpResponder');

var port = process.argv[2] || 3000;
var root = "http://localhost:" + port;

db.movies = new Datastore({filename: 'db/movies', autoload: true});

//Add an index (if we try to add a duplicate title this will throw an error)
db.movies.ensureIndex({ fieldName: 'title', unique: true});

app.use(express.bodyParser());
app.use(function (req, res, next) {
    res.type('application/json');
    res.locals.respond = responder.setup(res);
    next();
});

app.get('/movies', function (req, res) {
    db.movies.find({}, res.locals.respond);
});

app.post('/movies', function (req, res) {
    if(!req.body.title){
        res.status(400);
        res.json(400, {error: "A title is required tp create a movie"});
        return;
    }
    db.movies.insert({ title: req.body.title }, function (err, created) {
        if(err){
            res.json(500, err);
            return;
        }
        res.set('Location', root + '/movies/' + created._id);
        res.json(201, created)
    });
});

app.get('/movies/:id', function (req, res) {
    db.movies.findOne({ _id: req.params.id }, function (err, result) {
        if(err){
            res.json(500, err);
            return;
        }
        if(!result){
            res.json(404, {erro: "We did not find a movie with id " +req.params.id });
            return;
        }
        res.json(200, result);
    });
});

app.put('/movies/:id', function (req, res) {
    db.movies.update({ _id: req.params.id }, req.body, { upsert: false }, function (err, num, upsert) {
        if (err) {
            res.json(500, { error: err });
            return;
        }
        if (num === 0) {
            res.json(400, { error: { message: "No records were updated." }});
            return;
        }
        //res.send(204);
        res.json(200, { success: { message: "Sucessfully updated movie with ID " + req.params.id }});
    });
});
app.delete('/movies/:id', function (req, res) {
    db.movies.remove({ _id: req.params.id }, function (err, num) {
        if(err){
            res.json(500, err);
            return;
        }
        if(num === 0){
            res.json(404, {erro: "We did not find a movie with id " +req.params.id });
            return;
        }
        res.set('Link', root+'/movies; rel="collection"');
        res.send(204);
    });
})

app.listen(port);
