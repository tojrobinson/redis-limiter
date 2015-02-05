#RedisLimiter
A simple and efficient Node.js + redis based rate limiter.

## Examples
#### Express app request limiter

```js
var redis = require('redis');
var client = redis.createClient();
var RedisLimiter = require('redis-limiter');
var limiter = new RedisLimiter({
   client: client,
   prefix: 'lim'
});

// 5 requests per second
limiter.add('/api/actionOne', {
   limit: 5,
   interval: 1
});

// 7 requests every 10 seconds
limiter.add('/api/actionTwo', {
   limit: 7,
   interval: 10
});

app.get('/api/*', function(req, res, next) {
   limiter.limit(req.path, req.ip, function(err, result) {
      if (err || !result) {
         return next();
      }

      if (result.exceeded) {
         return res.sendStatus(429);
      }

      next();
   });
});

```

## API
#### Constructor(opt): RedisLimiter
`opt.client` The redis client object.<br>
`opt.prefix` The key prefix for entries into your redis store (default: 'lim').<br>
`opt.limits` Initialise all limits with a single object that maps `name` -> `opt`. This is an alternative to calling the `add` method for each limit.

#### add(name, opt): undefined
Add a single limit object with name `name`, having `interval` and `limit` properties defined within `opt`.

#### remove(name): undefined
Remove a limit object.

#### hasLimit(name): Boolean
Test if a limit object exists.

#### limit(name, user, cb): undefined
Increment a particular user's usage count for a limit object on the current interval. If the current interval does not exist or has expired, a new one is created.

The callback function receives an error object and a result object as arguments. The result object will contain the fields: `exceeded:Boolean` and `count:Number` indicating whether or not the action's limit was exceeded and the count for the current interval respectively.
