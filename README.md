# Twitter API

## Getting Started
First of all create a Twitter [developer app](https://developer.twitter.com/en/docs/apps/overview). Then, you will need to replace the app consumer key and consumer secret at index.js

```javascript
const twitterConsumerKey = '<YOUR-CONSUMER-KEY>'
const twitterConsumerSecret = '<YOUR-CONSUMER-SECRET>'
```

Then, restore packages
```bash
npm install
```

Finally, run the project
```bash
npm start
```

## Endpoints
### Login
It will begin the OAuth process, will redirect to Twitter login to authenticate.
#### Request
```bash
curl http://localhost:3000/login
```

### Home
The authenticated user will be redirected here, it will display authenticated user name.
#### Request
```bash
curl http://localhost:3000/home
```

### Timeline
It gets the authenticated user timeline.
#### Request
```bash
curl http://localhost:3000/timeline
```

### /post/{message}
This endpoint post a new message to the authenticated user timeline.

### /search/{term}
It searchs in twitter timeline the term.