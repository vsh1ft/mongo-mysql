var async = require('async');
var faker = require('Faker');
const { Client } = require('pg')

var self = {};


self.insert = function(dataSize,done){

	var run = [];
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'test',
        password: 'docker',
        port: 5432,
    })
	run.push(function(callback){
        client.connect(function(err, client, done) {
                callback();
        });
	})

	run.push(function(callback){
		client.query('DROP TABLE IF EXISTS AA')
            .then(x => callback())
            .catch(y => console.log(y))
	});

	run.push(function(callback){
		client.query('DROP TABLE IF EXISTS team',function(data,err){
			callback();
		});
	});
    run.push(function(callback){
        client.query('CREATE TABLE IF NOT EXISTS team ('+
            'id SERIAL,'+
            'name character(40) NOT NULL,'+
            'country character(32) NOT NULL,'+
            'city character(32) NOT NULL,'+
            'PRIMARY KEY (id)'+
            ')',function(data,err){
            callback();
        });
    });
	run.push(function(callback){
		client.query('CREATE TABLE IF NOT EXISTS AA ('+
			'id SERIAL,'+
			'player character(40) NOT NULL,'+
			'score integer NOT NULL,'+
			'email character(64) NOT NULL,'+
			'team integer NOT NULL,'+
			'PRIMARY KEY (id)'+

		')')
            .then(x => callback())
            .catch(y => console.log(y))
	});

	for(var i=0;i<dataSize;i++){
		run.push(function(callback){
			client.query("INSERT INTO AA(player, email, team, score)VALUES($1, $2, $3, $4)",[faker.Name.findName(), faker.Internet.email(), Math.floor(Math.random()*dataSize), Math.floor(Math.random()*1000)])
                .then(x => { callback() })
                .catch(y => console.log(y))
		});
        run.push(function(callback){
            client.query("INSERT INTO team(city, country, name)VALUES($1, $2, $3)", [faker.Address.city(), faker.Address.ukCountry(), faker.Company.companyName().split(" ")[0].split(",")[0]])
            .then(x => { callback() })
                    .catch(y => console.log(y))
        });
    }

	console.time('postgres insert')
	async.series(run,function(err,data){
		console.timeEnd('postgres insert');
		client.end();
		if(done) done();
	});
}

self.find = function(dataSize,done){
	const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'test',
        password: 'docker',
        port: 5432,
    });

	var run = [];

	run.push(function(callback){
		client.connect()
        callback()
	});

	run.push(function(callback){
        const query = {
            // give the query a unique name
            name: 'fetch-user',
            text: 'SELECT * FROM AA as t1, team as t2  WHERE t2.id=t1.team',
            values: [1],
        }
        client.query(
            'SELECT * FROM AA as t1, team as t2  WHERE t2.id=t1.team')
            .then(x => callback())
            .catch(x => console.log(x))
	});

	console.time('postgres select')
	async.series(run,function(err,data){
		console.timeEnd('postgres select');
        client.end();
		if(done) done();
	});
}

module.exports = function(type,dataSize,done){
	return self[type](dataSize,done);
}
