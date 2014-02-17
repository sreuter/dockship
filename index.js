var Docker = require('dockerode'),
    dockgen = require('dockgen'),
    temp = require('temp'),
    fs = require('fs'),
    spawn = require('child_process').spawn;

temp.track();

var Dockship = function(opts) {

  this.opts = opts || {};

  this.opts.image_prefix = opts.image_prefix || 'dockship_';

  this.docker = new Docker({
    host: this.opts.host || 'http://127.0.0.1',
    port: this.opts.port || 4243,
  });

}

// Image stuff

Dockship.prototype.listApps = function(appName, cb) {
  var self = this;
  this.docker.listImages(function(err, data) {
    if(err) return cb(err);
    cb(null, data.map(function(app) {
      // Check if image starts with predefined prefix
      if(app.RepoTags[0].indexOf(self.opts.image_prefix) === 0) {
        // If appName is set, only return images matching that
        if(! appName || self.opts.image_prefix + appName + ':latest' === app.RepoTags[0]) {
          return {
            name: self.getAppName(app.RepoTags[0]),
            id: app.Id
          };
        }
      }
    }).clean());
  });
};

Dockship.prototype.deleteApp = function(appId, cb) {
  var self = this;
  var app = this.docker.getImage(self.opts.image_prefix + appId + ':latest');
  app.remove(cb);
};

Dockship.prototype.deployApp = function(appName, cb) {
  var self = this;
  temp.mkdir('dockship', function(err, dir) {
    if(err) return cb(err);
    fs.writeFileSync(dir + '/Dockerfile', dockgen(process.cwd()));
    var tar_stream = spawn('tar', [
      'cv', './',
      '-C', dir, 'Dockerfile'
    ]);
    tar_stream.stderr.pipe(process.stderr);
    self.docker.buildImage(tar_stream.stdout, {t: self.opts.image_prefix + appName}, cb);
  });
};


// Container stuff

Dockship.prototype.listAppInstances = function(cb) {
  var self = this;
  this.docker.listContainers({all: false}, function(err, instances) {
    if(err) return cb(err);

    instances = instances.map(function(instance) {
      // Check if image starts with predefined prefix
      if(instance.Image.indexOf(self.opts.image_prefix) === 0) {
        // If appName is set, only return images matching that
        instance.Image = self.getAppName(instance.Image);
        return instance;
      }
    }).clean();

    cb(null, instances);

  });
};

Dockship.prototype.getAppIds = function(appName, cb) {
  this.listAppInstances(function(err, data) {
    if(err) return cb(err);
    cb(null, data.map(function(container) {
      return(container.Id);
    }).clean());
  });
};

Dockship.prototype.findAppIds = function(appName, cb) {
  var self = this;
  this.listAppInstances(function(err, data) {
    if(err) return cb(err);
    cb(null, data.map(function(container) {
      if(container.Image === appName || appName === '--all') {
        return(container.Id);
      }
    }).clean());
  });
};

Dockship.prototype.getInstanceLogs = function(instanceId, stdout_stream, stderr_stream, cb) {
  var container = this.docker.getContainer(instanceId);
  container.attach({stdout: true, stderr: true, stream: true, logs: true, tty: false}, function(err, stream) {
    if(err) {
      cb(err);
    } else {
      //stream.pipe(process.stdout);
      container.modem.demuxStream(stream, process.stdout, process.stdout);
      cb();
    }
  });
}

Dockship.prototype.startApp = function(appId, cb) {
  this.docker.createContainer({
    Image: appId,
    AttachStdout: true,
    AttachStderr: true,
  }, function(err, container) {
    if(err) return cb(err);

    container.inspect(function(err, containerDetails) {
      if(err) return cb(err);

      var cfg = {
        PortBindings: {}
      }

      var exposedPorts = containerDetails.Config.ExposedPorts;
      for(var i in exposedPorts) {
        cfg.PortBindings[i] = [
          {
            HostIp: '0.0.0.0',
            HostPort: i.split('/')[0]
          }
        ]
      }

      container.start(cfg, function(err) {
        if(err) return cb(err);
        cb(null, container.id);
      });

    });

  });
};

Dockship.prototype.getAppName = function(instanceName) {
  return instanceName
    .replace(new RegExp('^' + this.opts.image_prefix), '')
    .replace(/:latest$/, '');
};

Dockship.prototype.getInstanceName = function(appName) {
  return this.opts.image_prefix + appName + ':latest';
}

Dockship.prototype.stopApp = function(appId, cb) {
  var container = this.docker.getContainer(appId);
  container.stop(function(err) {
    if(err) return cb(err);
    container.remove(cb);
  });
};

module.exports = Dockship;

// Helpers

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};