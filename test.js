
const Datastore = require('nedb');

var db = new Datastore('./gamedata');

db.loadDatabase();

db.remove({userID: '700601536979664946'},{},err => {});