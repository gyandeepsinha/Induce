var mysql = require('mysql');

//local mysql db connection
var connection = mysql.createConnection({
    host		: 'induce.clnavbwtf0ja.us-east-2.rds.amazonaws.com',
  	user		: 'admin',
  	password	: 'rv123456789#',
  	database	: 'induce',
  	charset 	: 'utf8mb4_bin'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;