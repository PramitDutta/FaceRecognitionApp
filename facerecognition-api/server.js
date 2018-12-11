const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'your_database_user',
    password : 'your_database_password',
    database : 'myapp_test'
  }
});


const app= express();
app.use(bodyParser.json());
app.use(cors());

const database={
	users:[
		{
			id: '123',
			name: 'Pramit',
			email:'john123@gmail.com',
			password: 'cookies',
			entries: 0,
			joined: new Date()
		},
		{
			id: '124',
			name: 'Sally',
			email:'sally123@gmail.com',
			password: 'bananas',
			entries: 0,
			joined: new Date()
		}
	],
	login:[
		{
			id: '123',
			hash: 'wghhh',
			email: 'john123@gmail.com'
		}
	]
}

app.get('/',(req, res)=>{
	res.json(database.users);
})

app.post('/signin',(req, res)=>{
	// Load hash from your password DB.
bcrypt.compare("mangoes", '$2a$10$2UhppbNksxyRw8wQ/2ebu.kFy0AmI741.IDjTfLSLADYMXBIpfQ5.', function(err, res) {
    // res == true
    console.log('first guess', res);
});
bcrypt.compare("veggies",'$2a$10$2UhppbNksxyRw8wQ/2ebu.kFy0AmI741.IDjTfLSLADYMXBIpfQ5.', function(err, res) {
    // res = false
    console.log('second guess', res);
});
	if(req.body.email===database.users[0].email && req.body.password===database.users[0].password){
		res.json(database.users[0]);
	}else{
		res.json('Error logging in!! ');
	}
	
})

app.post('/register',(req, res)=>{
	const{email, name, password}=req.body;
	database.users.push(
		{
			id: '125',
			name: name,
			email:email,
			entries: 0,
			joined: new Date()
		}
	)
	res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id',(req, res)=>{
	const {id}=req.params;
	let found= false;
	database.users.forEach(user=>{
		if(user.id===id){
			found=true;
			res.json(user);
		}
	})
	if(!found){
		res.status(400).json('not found')
	}
})

app.put('/image',(req, res)=>{
	const {id}=req.body;
	let found= false;
	database.users.forEach(user=>{
		if(user.id===id){
			found=true;
			user.entries++
			return res.json(user.entries);
		}
	})
	if(!found){
		res.status(400).json('not found')
	}
})


app.listen(3001,()=>{
	console.log('app is running')
})