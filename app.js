const express = require('express'); 
const url = require('url'); 
const dns = require('dns'); 


const app = express(); 
app.use(express.json()); 

app.post('/api/shorturl',(req,res)=> { 
  const original_url = req.body.url; 
  const hostname = new URL(original_url).hostname; 
  dns.lookup(hostname,(err,address,family) => { 
    console.log(err,address,family); 
    if(err) { 
      res.json({
        error: 'invalid url'
      })
    } else { 
      res.json({
        original_url, 
        short_url: address, 
      })
    }
  })   
})

app.listen(3000, () => { 
  console.log('Listening on port 3000'); 
})