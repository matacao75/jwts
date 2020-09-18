var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var app = express();

// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
var expiry = "";

httpServer.listen(3001);
httpsServer.listen(3000);
app.use(express.static('public'));

app.get('/form', function (req, res) {
  var html='';
  html +="<body>";
  html += "<form action='/create'  method='post' name='form1'></p>";
  html += "Meeting Name:</p><input type= 'text' name='meetingName' value='reunion_tecnologia'></p>";
  html += "Name:</p><input type= 'text' name='name'></p>";
  html += "Email:</p><input type= 'text' name='email'></p>";
  html += "Avatar URL:</p><input type= 'text' name='avatar' value='https://robohash.org/john-doe'></p>";
  html += "Moderator:</p><select name='moderator'><option value='true'>true</option><option value='false' selected>false</option></select></p>";
  html += "Expira:</p><select name='expira'><option value=15>15</option><option value=30>30</option><option value=60 selected>60</option></select></p>";
  html += "<input type='submit' value='submit'>";
  html += "<INPUT type='reset'  value='reset'>";
  html += "</form>";
  html += "</body>";
  res.send(html);
});


app.get('/form1', function (req, res) {
  var html='';
  html +="<body>";
  html += "<form action='/create1'  method='post' name='form1'></p>";
  html += "Meeting Name:</p><input type= 'text' name='meetingName' value='reunion_tecnologia'></p>";
  html += "Name:</p><input type= 'text' name='name'></p>";
  html += "Email:</p><input type= 'text' name='email'></p>";
  html += "Avatar URL:</p><input type= 'text' name='avatar' value='https://robohash.org/john-doe'></p>";
  html += "Moderator:</p><select name='moderator'><option value='true'>true</option><option value='false' selected>false</option></select></p>";
  html += "Expira:</p><select name='expira'><option value=15>15</option><option value=30>30</option><option value=60 selected>60</option></select></p>";
  html += "<input type='submit' value='submit'>";
  html += "<INPUT type='reset'  value='reset'>";
  html += "</form>";
  html += "</body>";
  res.send(html);
});


app.post('/create', urlencodedParser, (req, res) => {
/*  if (req.headers.authorization !== 'Basic QXp1cmVEaWFtb25kOmh1bnRlcjI=') {
    res.set('WWW-Authenticate', 'Basic realm="401"')
    res.status(401).send('Try user: AzureDiamond, password: hunter2')
    return
  }*/
  var moderator = ""
	if (req.body.moderator == "false" ) { moderator = false } else { moderator = true }
  const jwt = require('njwt')
  const claims = {
  		"context": {
			"user": {
				"avatar": req.body.avatar,
				"name": req.body.name,
				"email": req.body.email
			}
		},
	  	"aud": "hospitalitaliano@jitsi2020",
	  	"iss": "hospitalitaliano@jitsi2020",
	  	"sub": "jitsi.hospitalitaliano.org.ar",
		"room": "*",
		"moderator": moderator
	}
  const token = jwt.create(claims, '058E76D11138E7FE833B6BC9FC05F35A')
  expiry = new Date().getTime() + req.body.expira*1000;
  token.setExpiration(new Date().getTime() + req.body.expira*1000)
  var urlRedirect = 'https://jitsi.hospitalitaliano.org.ar/'+req.body.meetingName+'?jwt='+token.compact()
  res.writeHead(301, {Location: urlRedirect } );
  res.end();
  console.log(`JWT Token generado a las ${expiry}`)
  console.log(`Token : ${token.compact()}`)
  console.log(`Moderator : ${req.body.moderator}`)
});

app.post('/create1', urlencodedParser, (req, res) => {
  var moderator = ""
	if (req.body.moderator == "false" ) { moderator = false } else { moderator = true }
  const jwt = require('njwt')
  const claims = {
  		"context": {
			"user": {
				"avatar": req.body.avatar,
				"name": req.body.username,
				"email": req.body.username+'@hospitalitaliano.org.ar'
			}
		},
	  	"aud": "hospitalitaliano@jitsi2020",
	  	"iss": "hospitalitaliano@jitsi2020",
	  	"sub": "jitsi.hospitalitaliano.org.ar",
		"room": "*",
		"moderator": moderator
	}
  const token = jwt.create(claims, '058E76D11138E7FE833B6BC9FC05F35A')
  expiry = new Date().getTime() + req.body.expira*1000;
  token.setExpiration(new Date().getTime() + req.body.expira*1000)
  if (moderator){
  var urlRedirect = '/adminMeet.html?room='+req.body.room+'&jwt='+token.compact()
  } else {
  var urlRedirect = '/meet.html?room='+req.body.room+'&jwt='+token.compact()
  }
  res.writeHead(301, {Location: urlRedirect } );
  res.end();
  console.log(`JWT1 Token generado a las ${expiry}`)
  console.log(`Token : ${token.compact()}`)
  console.log(`Moderator : ${req.body.moderator}`)
});

app.get('/verify/:token', (req, res) => {
  const jwt = require('njwt')
  const { token } = req.params
  jwt.verify(token, '058E76D11138E7FE833B6BC9FC05F35A', (err, verifiedJwt) => {
    if(err){
      res.send(err.message)
    }else{
      res.send(verifiedJwt)
    }
  })
})

app.get('/', (req, res) => res.send('TODO: use Okta for auth'))

