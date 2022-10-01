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

const client_id = process.env.SPOTIFY_API_ID; 
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; 
const redirect_uri = "localhost:3002/";
let buff = new Buffer.from(`${client_id}:${client_secret}`);
let authKey = buff.toString("base64");

const passport = require("./config/ppConfig");

const SECRET_SESSION = process.env.SECRET_SESSION;
console.log("ayooo...>>>>", SECRET_SESSION);

app.set("view engine", "ejs");
app.use(require("morgan")("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(layouts);
app.use(methodOverride("_method"));
app.use(flash());

app.use(
  session({
    secret: SECRET_SESSION, 
    resave: false, 
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log("res locals  >>>>>", res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});


/**
 * ROUTES
 */

app.get("/", function (req, res) {
  res.render("index", { req });
});

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
      console.log('*******************************************************');
      console.log(error);
      console.log('*******************************************************');
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

    res.redirect("/profile"); 
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
});

app.post("/reviews", (req, res) => {

  db.myReview
    .create(req.body)
    .then((review) => {
      
      res.redirect("/profile")
    });
  })

app.use("/auth", require("./controllers/auth"));

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
