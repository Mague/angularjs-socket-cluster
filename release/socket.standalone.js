/**
 * AngularJS SocketCluster Interface
 * @author Ryan Page <ryanpager@gmail.com>
 * @version v1.1.9
 * @see https://github.com/ryanpager/angularjs-socket-cluster#readme
 * @license MIT
 */
(function() { 'use strict'; 
/*
>> Class Declaration
 */
var Socket;

Socket = (function() {
  var connectionOptions, debuggingEnabled, instance;

  Socket.prototype.$inject = [];

  function Socket() {}

  debuggingEnabled = false;

  instance = null;

  connectionOptions = {
    autoReconnect: true,
    protocol: 'http',
    hostname: '127.0.0.1',
    port: 8000
  };

  Socket.prototype.$get = [
    'socketCluster', '$q', '$rootScope', '$log', '$timeout', function(socketCluster, $q, $rootScope, $log, $timeout) {
      var service;
      return service = {
        connect: function(opts) {
          if (opts == null) {
            opts = {};
          }
          return $q(function(resolve, reject) {
            angular.merge(connectionOptions, opts);
            if (debuggingEnabled) {
              $log.info('Socket :: Attempting connection...');
            }
            instance = socketCluster.connect(connectionOptions);
            instance.on('error', function(err) {
              if (err === 'Action was silently blocked by publishIn middleware') {
                return;
              }
              return $log.error("Socket :: Error >> " + err);
            });
            instance.on('subscribeFail', function(err) {
              return $log.error("Socket :: Channel subscription error >> " + err);
            });
            instance.on('disconnect', function(err) {
              if (debuggingEnabled) {
                return $log.info('Socket :: Disconnection successful');
              }
            });
            instance.on('connectAbort', function(err) {
              err = "Socket :: Connection aborted >> " + err;
              $log.error(err);
              return reject(err);
            });
            return instance.on('connect', function() {
              if (debuggingEnabled) {
                $log.info('Socket :: Connection successful');
              }
              return resolve(true);
            });
          });
        },
        disconnect: function() {
          return $q(function(resolve, reject) {
            var err;
            if (debuggingEnabled) {
              $log.info('Socket :: Attempting disconnect...');
            }
            if (instance == null) {
              err = 'Socket :: Error >> no socket connection established.';
              $log.error(err);
              return reject(err);
            }
            instance.disconnect();
            return resolve(true);
          });
        },
        subscribe: function(channel) {
          if (channel == null) {
            channel = null;
          }
          return $q(function(resolve, reject) {
            var err, handleEvent;
            if (channel == null) {
              err = 'Socket :: Error >> no socket channel specified.';
              $log.error(err);
              return reject(err);
            }
            if (instance == null) {
              err = 'Socket :: Error >> no socket connection established.';
              $log.error(err);
              return reject(err);
            }
            if (debuggingEnabled) {
              $log.info("Socket :: Subscribe to channel " + channel);
            }
            handleEvent = function(eventData) {
              if (eventData.$error != null) {
                if (debuggingEnabled) {
                  $log.error('Socket :: Event error >>', eventData);
                }
              }
              if (debuggingEnabled) {
                $log.info('Socket :: Event received >>', eventData);
              }
              return $rootScope.$apply(function() {
                if (debuggingEnabled) {
                  $log.info("Socket :: Rebroadcast event >> " + eventData.$event);
                }
                return $rootScope.$broadcast("socket:" + eventData.$event, eventData);
              });
            };
            instance.watch(channel, handleEvent);
            instance.on('single.publish', handleEvent);
            instance.subscribe(channel);
            return resolve(true);
          });
        },
        unsubscribe: function(channel) {
          if (channel == null) {
            channel = null;
          }
          return $q(function(resolve, reject) {
            var err;
            if (channel == null) {
              err = 'Socket :: Error >> no socket channel specified.';
              $log.error(err);
              return reject(err);
            }
            if (instance == null) {
              err = 'Socket :: Error >> no socket connection established.';
              $log.error(err);
              return reject(err);
            }
            if (debuggingEnabled) {
              $log.info("Socket :: Unsubscribe to channel " + channel);
            }
            instance.unsubscribe(channel);
            instance.unwatch(channel);
            return resolve(true);
          });
        },
        publish: function(channel, eventData) {
          if (channel == null) {
            channel = null;
          }
          if (eventData == null) {
            eventData = {};
          }
          return $q(function(resolve, reject) {
            var err;
            if (channel == null) {
              err = 'Socket :: Error >> no socket channel specified.';
              $log.error(err);
              return reject(err);
            }
            if (instance == null) {
              err = 'Socket :: Error >> no socket connection established.';
              $log.error(err);
              return reject(err);
            }
            if (debuggingEnabled) {
              $log.info("Socket :: Publish to channel " + channel + " >>", eventData);
            }
            return instance.publish(channel, eventData, function(err) {
              if ((err != null) && err !== 'Action was silently blocked by publishIn middleware') {
                return reject(err);
              } else {
                return resolve(true);
              }
            });
          });
        },
        toggleDebugging: function(enabled) {
          if (enabled == null) {
            enabled = false;
          }
          return debuggingEnabled = enabled;
        },
        subscriptions: function() {
          if (instance == null) {
            $log.error('Socket :: Error >> no socket connection established.');
            return;
          }
          return instance.subscriptions();
        },
        isSubscribed: function(channel) {
          if (instance == null) {
            $log.error('Socket :: Error >> no socket connection established.');
            return;
          }
          return instance.isSubscribed(channel);
        }
      };
    }
  ];

  return Socket;

})();


/*
>> Module Declaration
 */

angular.module('sbb.components', []).constant('socketCluster', socketCluster).provider('sbb.components.socket', Socket);
 })();