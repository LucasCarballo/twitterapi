const express = require('express')
const session = require('express-session')
const oauth = require('oauth')
const util = require('util')

const app = express()
const port = 3000

const twitterConsumerKey = '<YOUR-CONSUMER-KEY>'
const twitterConsumerSecret = '<YOUR-CONSUMER-SECRET>'

let twitterService = new oauth.OAuth(
  'https://twitter.com/oauth/request_token',
  'https://twitter.com/oauth/access_token',
  twitterConsumerKey,
  twitterConsumerSecret,
  '1.0A',
  `http://localhost:${port}/auth/twitter/redirect`,
  'HMAC-SHA1'
)

app.set('trust proxy', 1)
app.use(session({
  secret: 'myapisecret',
  name: 'sessionId',
  resave: false,
  saveUninitialized: true
}))

app.use((req, res, next) => {
  res.locals.session = req.session
  next()
})

app.get('/login', (req, res) => {
  twitterService.getOAuthRequestToken((err, oauthToken, oauthTokenSecret, results) => {
    if (err) {
      res.status(500).send(`Error getting request token: ${util.inspect(err)}`)
    } else {
      req.session.oauthRequestToken = oauthToken
      req.session.oauthRequestTokenSecret = oauthTokenSecret
      res.redirect(`https://twitter.com/oauth/authorize?oauth_token=${req.session.oauthRequestToken}`)
    }
  })
})

app.get('/auth/twitter/redirect', (req, res) => {
  twitterService.getOAuthAccessToken(
    req.session.oauthRequestToken,
    req.session.oauthRequestTokenSecret,
    req.query.oauth_verifier,
    (err, oauthAccessToken, oauthAccessTokenSecret, results) => {
      if (err) {
        res.status(500).send(`Error getting access token: ${util.inspect(err)}[${oauthAccessToken}][${oauthAccessTokenSecret}][${util.inspect(results)}]`)
      } else {
        req.session.oauthAccessToken = oauthAccessToken
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret

        res.redirect('/home')
      }
    })
})

app.get('/home', (req, res) => {
  twitterService.get(
    'https://api.twitter.com/1.1/account/verify_credentials.json',
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    (err, data, response) => {
      if (err) {
        res.redirect('/login');
      } else {
        let parsedData = JSON.parse(data)

        req.session.screen_name = parsedData.screen_name

        res.send(`You are signed in: ${parsedData.screen_name}`)
      }
    })
})

app.get('/search/:term', (req, res) => {
  twitterService.get(
    `https://api.twitter.com/1.1/search/tweets.json?q=${req.params.term}`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    (err, data, response) => {
      if (err) {
        res.redirect('/login');
      } else {
        let parsedData = JSON.parse(data)

        res.send({parsedData})
      }
    })  
})

app.get('/post/:message', (req, res) => {
  twitterService.post(
    `https://api.twitter.com/1.1/statuses/update.json?status=${req.params.message}`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    '',
    '',
    (err, data, response) => {
      if (err) {
        res.redirect('/login');
      } else {
        let parsedData = JSON.parse(data)

        res.send({parsedData})
      }
    })  
})

app.get('/timeline', (req, res) => {
  twitterService.get(
    'https://api.twitter.com/1.1/statuses/user_timeline.json',
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    (err, data, response) => {
      if (err) {
        res.redirect('/login');
      } else {
        let parsedData = JSON.parse(data)

        res.send({parsedData})
      }
    })  
})

app.listen(port, () => {
  console.log(`Server listening in http://localhost:${port}`)
})