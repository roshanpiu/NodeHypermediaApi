var fortune = require("fortune");

var app = fortune({
    db: "./db/hypermovies",
    baseUrl: "http://localhost:4000"
});

app.resource('movies',{
    title: String,
    rating: Number,
    director: 'director',
    cast: ['actor']
});

app.resource('director',{
    name : String
});

app.resource('actor',{
    name : String
});

app.listen(4000);