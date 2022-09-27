require('dotenv').config()
const axios = require('axios')
const qs = require('qs');
const client_id = process.env.SPOTIFY_API_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
let buff = new Buffer.from(`${client_id}:${client_secret}`);
let authKey = buff.toString('base64');// changes key to string
console.log()

// Needed for post route
axios.post('https://accounts.spotify.com/api/token',
    qs.stringify({
        grant_type: 'client_credentials',
    }),
    {
        headers: { 
            'Authorization': `Basic ${authKey}`,
            'Content-Type': 'application/x-www-form-urlencoded' 
        }
        
}).then((response)=>{                   
    token = response.data.access_token
    console.log(token)
    const config ={
        headers:{
            Authorization: `Bearer ${token}`
        }
    }
    // let composer = req.query.composer
    // let track = req.query.track
    let query = encodeURIComponent(`drake omerta`)

    // Begin api request
    axios.get(`https://api.spotify.com/v1/search?q=${query}&type=artist,track&offset=0&limit=20`, config)
    .then((response)=>{                   
        console.log(response.data)
        let tracks = response.data.tracks.items
        // res.render('trackResults', {tracks})
        })
        .catch(err =>{
        console.log(err)
        })
    //use search query in here'
    // console.log(token)
    
    })
.catch(err=>{
    console.log("error", err.message)
})
