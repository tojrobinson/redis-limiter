'use strict';

var limits = {

};

function RedisLimiter(opt) {
   if (!opt.client) {
      throw new Error('[RedisLimiter] Must supply redis client');
   }

   this.redis = opt.client;
   this.prefix = opt.prefix || 'lim';
 
   if (opt.limits) {
      limits = opt.limits;
   }
}

module.exports = RedisLimiter;

RedisLimiter.prototype.add = function(lim, opt) {
   if (typeof lim !== 'string' || typeof opt !== 'object') {
      throw new Error('[RedisLimiter] invalid limit');
   }

   limits[lim] = opt;
}

RedisLimiter.prototype.remove = function(lim) {
   if (limits.hasOwnProperty(lim)) {
      delete limits[lim];
   }
}

RedisLimiter.prototype.hasLimit = function(lim) {
   return limits.hasOwnProperty(lim);
}

RedisLimiter.prototype.limit = function(lim, user, cb) {
   if (!limits.hasOwnProperty(lim)) {
      return process.nextTick(function() {
         cb(null, null);
      });
   }

   var redis = this.redis;
   var action = limits[lim];
   var key = [this.prefix, lim, user].join(':');

   redis.incr(key, function(err, count) {
      if (count === 1) {
         redis.expire(key, action.interval, function(err) {
            return cb(err, {
               exceeded: false,
               count: 1
            });
         });
      } else {
         return cb(null, {
            exceeded: count > action.limit,
            count: count
         });
      }
   });
}
