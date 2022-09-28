/**
 * Global Package Requirements
 */

require("dotenv").config();
const axios = require("axios");
const qs = require("qs");
const express = require("express");
const layouts = require("express-ejs-layouts");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const isLoggedIn = require("./middleware/isLoggedIn");
const db = require("./models");
const methodOverride = require("method-override");

/**
 * Global Variables
 */

const client_id = process.env.SPOTIFY_API_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
const redirect_uri = "localhost:3002/";
let buff = new Buffer.from(`${client_id}:${client_secret}`);
let authKey = buff.toString("base64"); // changes key to string

// Middleware config file for passport
const passport = require("./config/ppConfig");

// Secret Session Key
const SECRET_SESSION = process.env.SECRET_SESSION;
console.log("ayooo...>>>>", SECRET_SESSION);

// Tell our app to use EJS
app.set("view engine", "ejs");
// See Routes
app.use(require("morgan")("dev"));
// Take in form data
app.use(express.urlencoded({ extended: false }));
// See anything in public folder ie. CSS
app.use(express.static(__dirname + "/public"));
// need layouts for ejs to be available
app.use(layouts);
// Utilize method overrides in routes
app.use(methodOverride("_method"));
// flash middleware
app.use(flash());

// Use the secret session in our app
app.use(
  session({
    secret: SECRET_SESSION, // What we actually will be giving the user on our site as a session cookie
    resave: false, // Save the session even if it's modified, make this false
    saveUninitialized: true, // If we have a new session, we save it, therefore making that true
  })
);


// Initialize passport and start a session
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log("res locals  >>>>>", res.locals);
  res.locals.alerts = req.flash();
  // Get access to current user on any part of the app
  res.locals.currentUser = req.user;
  // Do whatever the next thing is
  next();
});
/**
 * ROUTES
 */

// Home Page Route
app.get("/", function (req, res) {
  res.render("index", { req });
});

// Genre Selection Route
app.get("/genre", async (req, res) => {
  axios
    .post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          Authorization: `Basic ${authKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      token = response.data.access_token;
      console.log(token);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Begin api request
      axios
        .get(`https://api.spotify.com/v1/browse/categories`, config)
        .then((response) => {
          console.log(response.data);
          let genres = response.data.categories.items;
          res.render("genre", { genres, req});
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log("error", err.message);
    });
});

// Playlist Selection Route
app.get("/playlist", (req, res) => {
  const genre = req.query.genre;

  axios
    .post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          Authorization: `Basic ${authKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      token = response.data.access_token;
      console.log(token);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Begin api request
      axios
        .get(
          `https://api.spotify.com/v1/browse/categories/${genre}/playlists`,
          config
        )
        .then((response) => {
          console.log(response.data);
          let playlists = response.data.playlists.items;
          res.render("playlist", { playlists, req });
        })
        .catch((err) => {
          console.log(err);
        });
    });
});

app.get("/profile", isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get();

  db.myPlaylist
    .findAll({
      where: { userId: id },
      include: [ db.myReview ]
    })
    .then((playlist) => {
      res.render("profile", { req, id, name, email, playlist: playlist });
    })
    .catch((error) => {
      console.log(error)
      res.status(400).render("404");
    });
});

app.get("/tracks", (req, res) => {
  const playlist = req.query.playlist;

  axios
    .post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          Authorization: `Basic ${authKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      token = response.data.access_token;
      console.log(token);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Begin api request
      axios
        .get(`https://api.spotify.com/v1/playlists/${playlist}/tracks`, config)
        .then((response) => {
          console.log(response.data);
          let tracks = response.data.items;
          res.render("tracks", { tracks, req });
        })
        .catch((err) => {
          console.log(err);
        });
    });
});

app.get("/track", (req, res) => {
  const track = req.query.track;

  axios
    .post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          Authorization: `Basic ${authKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      token = response.data.access_token;
      console.log(token);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Begin api request
      axios
        .get(`https://api.spotify.com/v1/tracks/${track}`, config)
        .then((response) => {
          console.log(response.data);
          let track = response.data;
          res.render("track-login", { track, req });
        })
        .catch((err) => {
          console.log(err);
        });
    });
});

app.post("/profile-add", isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get();
  const track = req.body.trackTitle;
  const trackId = req.body.trackId;
  const artist = req.body.trackArtists;
 
  db.myPlaylist
    .create({
      trackTitle: track,
      trackArtist: artist,
      userId: id,
    })
    .then((post) => {
      res.redirect("/profile");
    })
    .catch((error) => {
      res.status(400).render("404");
    });
});

app.put("/profile/:trackid", isLoggedIn, async (req, res) => {
  try {
    await db.myPlaylist.update(
      {
        trackArtist: req.body.newArtist,
        trackTitle: req.body.newTitle,
      },
      {
        where: {
          id: req.params.trackid,
        },
      }
    );

    // redirect back to the profile page
    res.redirect("/profile"); // route
  } catch (error) {
    console.log(error);
  }
});

app.get("/profile/:trackid", (req, res) => {
  db.myPlaylist
    .destroy({
      where: { id: req.params.trackid }
    })
    .then((numRowsDeleted) => {
      console.log(numRowsDeleted);
    });
  //redirect to user profile
  res.redirect("/profile");
});

app.get("/reviews/new", (req, res) => {
  db.myPlaylist
    .findOne({
      where: { id: req.query.playlistId },
      
    })
    .then((track) => {
      res.render("reviews", {track, req})
    });
  //redirect to user profile
});

app.post("/reviews", (req, res) => {

  db.myReview
    .create(req.body)
    .then((review) => {
      
      res.redirect("/profile")
      //res.render("reviews", {track, req})
    });
  })

// access to all of our auth routes
app.use("/auth", require("./controllers/auth"));

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
