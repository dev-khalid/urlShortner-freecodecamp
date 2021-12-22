require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const Url = require('url');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

///////////////////Here goes my code ////////////

app.use(express.json());
app.use(express.urlencoded());

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('connected to databases.'));

//Schema section
const urlMappingSchema = new mongoose.Schema({
  original_url: {
    type: 'string',
    unique: true,
  },
  short_url: {
    type: 'string',
    unique: true,
  },
});

//model section
const UrlMapping = mongoose.model('UrlMapping', urlMappingSchema);

//create new url
const createShortUrl = async (original_url, short_url) => {
  try {
    const data = await UrlMapping.create({
      original_url,
      short_url,
    });
    return data;
  } catch (error) {
    console.log('Something went wrong!');
  }
};

//find by short url
const findByShortUrl = async (short_url) => {
  try {
    const data = await UrlMapping.find({ short_url });
    return data;
  } catch (error) {
    console.log('Something went wrong in server side.');
  }
};

//find by original url
const findByOriginalUrl = async (original_url) => {
  try {
    const data = await UrlMapping.find({ original_url });
    return data;
  } catch (error) {
    console.log('Something went wrong in server side.');
  }
};

app.get('/api/shorturl/:short_url', async (req, res) => {
  //jodi short url khuje pai tahole redirect kore dibo nahole not found dekhabo
  const data = await findByShortUrl(req.params.short_url);
  if (data) {
    res.redirect(data.original_url);
  } else {
    res.send('Not Found!');
  }
});

app.post('/api/shorturl', async (req, res) => {
  //first of all amake check korte hobe je eita valid url kina
  const original_url = req.body.url;
  try {
    const hostname = new URL(original_url).hostname;
    dns.lookup(hostname, (err, address) => {
      if (err) {
        res.json({
          error: 'invalid url',
        });
      } else {
        //age dekhte hobe je eita already exist kore kina .
        const alreadyExist = await findByOriginalUrl(original_url);
        if (alreadyExist) {
          //jodi kore tahole khuje ager tai diye dite hobe .
          res.json({
            original_url: alreadyExist.original_url,
            short_url: alreadyExist.short_url,
          });
        } else {
          // na korle notun ta create kore pathay dite hobe .
          const short_url = address.split('.').join('');
          const newData = await createShortUrl(original_url, short_url);
          res.json({
            original_url: newData.original_url,
            short_url: newData.short_url,
          });
        }
      }
    });
  } catch (error) {
    res.json({
      error: 'invalid url',
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});


// {"_id":{"$oid":"61c2f92bf6a6f54369a5be06"},"original_url":"https://boilerplate-project-urlshortener-3.khalidhossain72.repl.co/?v=1640167710177","short_url":"3518624555","__v":{"$numberInt":"0"}}