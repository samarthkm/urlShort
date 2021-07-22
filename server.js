require('dotenv').config();
const express = require('express');
const mongoose=require('mongoose');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const shortID = require('shortid');
const vu = require('valid-url');
const mySecret=process.env['DB_URI']
const http = require('http');
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }); //ignores deprecation warnings
const base = 'https://urlshort.samarthkm.repl.co/u/'
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const Schema=mongoose.Schema;
const urlSchema = new Schema({
  urlCode:String,
  longUrl:String,
})
const Shorturl = mongoose.model("shorturl",urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

async function checkIfCreated (lu) {
  return Shorturl.findOne({longUrl:lu});
} 

async function createDocAndgenerateID (lu) {
  var ucode = shortID.generate();
  var newurl = new Shorturl({urlCode:ucode,longUrl:lu});
  newurl.save(function(err){
    if(err)return console.error(err);
  })
  console.log(newurl.urlCode);
  console.log(newurl.longUrl);
  return newurl;
}

async function redirectToLink (code) {
  var c = Shorturl.findOne({urlCode:code});
  return c; 
}

app.post('/api/shorturl', async(req,res) => {
  const lu = 'http://' + req.body.url;
  console.log(lu);
  checkIfCreated(lu).then((value) => {
    if(value===null) {
      createDocAndgenerateID(lu).then((value) => {
        res.json({original_url:value.longUrl,short_url:value.urlCode});
        return;
      })
    }
    else {
      res.json({original_url:value.longUrl,short_url:value.urlCode});
      return;
    }
  })
});

app.get('/u/:secret', async(req,res) => {
  var sec = req.params.secret;
  redirectToLink(sec).then((value) => {
    res.redirect(value.longUrl);
    return;
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});



