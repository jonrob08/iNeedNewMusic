require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const isLoggedIn = require('./middleware/isLoggedIn');
const db = require('./models');
const methodOverride = require('method-override')


const client_id = process.env.SPOTIFY_API_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
const redirect_uri = 'localhost:3002/'
let buff = new Buffer.from(`${client_id}:${client_secret}`);
let authKey = buff.toString('base64');// changes key to string

// Middleware config file for passport
const passport = require('./config/ppConfig');

const SECRET_SESSION = process.env.SECRET_SESSION;
console.log('ayooo...>>>>', SECRET_SESSION);

app.set('view engine', 'ejs');

// See Routes
app.use(require('morgan')('dev'));
//Take in form data
app.use(express.urlencoded({ extended: false }));
//See anything in public folder ie. CSS
app.use(express.static(__dirname + '/public'));

//ejs is available
app.use(layouts);

app.use(session({
  secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));

app.use(methodOverride('_method'))

// flash middleware
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log('res locals  >>>>>', res.locals);
  res.locals.alerts = req.flash();
  // Get access to current use on any part of the app
  res.locals.currentUser = req.user;
  // Do whatever the next thing is
  next();
});




// app.get('/login', function(req, res) {

//   let state = generateRandomString(16);
//   res.cookie(stateKey, state);

// // your application requests authorization
// const scopes = [
//   "user-read-email",
//   "playlist-read-private",
//   "playlist-read-collaborative",
//   "user-read-email",
//   "streaming",
//   "user-read-private",
//   "user-library-read",
//   "user-top-read",
//   "user-read-playback-state",
//   "user-modify-playback-state",
//   "user-read-currently-playing",
//   "user-read-recently-played",
//   "user-follow-read",
// ].join(',');

//   res.redirect('https://accounts.spotify.com/authorize?' +
//     querystring.stringify({
//       response_type: 'code',
//       client_id: client_id,
//       scope: scopes,
//       redirect_uri: redirect_uri,
//       state: state
//     }));
// });

app.get('/', function(req, res) {
    const logged = "is Logged In"
    const notLogged = "You are not logged in, please create an account"
  res.render('index', {req, logged, notLogged})
})

app.post('/genre', (req, res) => {
  console.log(req.body);
  res.status(201).json({
    message: 'Thing created successfully!'
  });
  res.redirect('/genre/:id')
})

app.get('/genre', async (req, res) => {
  const notLogged = "You are not logged in, please create an account"

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
    // let query = encodeURIComponent(`drake omerta`)

    // Begin api request
    axios.get(`https://api.spotify.com/v1/browse/categories`, config)
    .then((response)=>{
        console.log(response.data)
        let genres = response.data.categories.items
        // tracks = JSON.parse(tracks)
        res.render('genre', { genres, req, notLogged })
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

})

app.get('/playlist', (req, res) => {
  const genre = req.query.genre
  
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
    // let query = encodeURIComponent(`drake omerta`)

    // Begin api request
    axios.get(`https://api.spotify.com/v1/browse/categories/${genre}/playlists`, config)
    .then((response)=>{
        console.log(response.data)
        let playlists = response.data.playlists.items
        // tracks = JSON.parse(tracks)
        res.render('playlist', { playlists, req })
        })
        .catch(err =>{
        console.log(err)
        })
    //use search query in here'
    // console.log(token)
    
    })
});

app.get('/profile', isLoggedIn, (req, res) => {
    const { id, name, email } = req.user.get(); 

    db.myPlaylist.findAll({
        where: { userId: id }
      })
    .then((playlist) => {
      res.render('profile', {  req, id, name, email, playlist: playlist })
    })
    .catch((error) => {
      res.status(400).render('404')
    })
});

app.get('/tracks', (req, res) => {
  const playlist = req.query.playlist
  
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
    // let query = encodeURIComponent(`drake omerta`)

    // Begin api request
    axios.get(`https://api.spotify.com/v1/playlists/${playlist}/tracks`, config)
    .then((response)=>{
        console.log(response.data)
        let tracks = response.data.items
        // tracks = JSON.parse(tracks)
        res.render('tracks', { tracks, req })
        })
        .catch(err =>{
        console.log(err)
        })
    //use search query in here'
    // console.log(token)
    
    })
});

app.get('/track', (req, res) => {
    const track = req.query.track
    
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
      // let query = encodeURIComponent(`drake omerta`)
  
      // Begin api request
      axios.get(`https://api.spotify.com/v1/tracks/${track}`, config)
      .then((response)=>{
          console.log(response.data)
          let track = response.data
          // tracks = JSON.parse(tracks)
          res.render('track-login', { track, req })
          })
          .catch(err =>{
          console.log(err)
          })
      //use search query in here'
      // console.log(token)
      
      })
  });

app.post('/profile-add', isLoggedIn, (req, res) => {
    const { id, name, email } = req.user.get(); 
    const track = req.body.trackTitle
    const artist = req.body.trackArtists

    db.myPlaylist.create({
        trackTitle: track,
        trackArtist: artist,
        userId: id
      })
      .then((post) => {
        res.redirect('/profile')
      })
      .catch((error) => {
        res.status(400).render('404')
      })
  
});


app.put('/profile/:trackid', isLoggedIn, async (req, res) => {
    try {
      await db.myPlaylist.update({
        trackArtist: req.body.newArtist,
        trackTitle: req.body.newTitle
      }, {
        where: {
          id: req.params.trackid
        }
    });

    // redirect back to the profile page
    res.redirect('/profile'); // route
    } catch (error) {
      console.log(error);
    }
});

app.get('/profile/:trackid', (req, res) => {
    db.myPlaylist.destroy({
        where: { id: req.params.trackid }
      }).then(numRowsDeleted=>{
          console.log(numRowsDeleted)
        // do something when done deleting
      });
    //redirect to the GET /dinosaurs route (index)
    res.redirect('/profile');
  });


// access to all of our auth routes
app.use('/auth', require('./controllers/auth'));

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
