/**
 * Module dependencies.
 */

var program = require('commander'),
    pkg = require('../package.json'),
    Dockship = require('../index.js'),
    Table = require('cli-table');

program
  .usage('command [options]')
  .version(pkg.version)
  .option('')
  .option('status', 'Status of running applications')
  .option('list', 'List deployed applications')
  .option('push   <appname>', 'Push a new application')
  .option('start  <appname>', 'Start the application')
  .option('stop   <appname>', 'Stop the application, also takes --all')
  .option('purge  <appname>', 'Purge application')
  .option('log    <instanceid>', 'Print logs from instance')
  .option('-p, --port <port>', 'Optional host port, defaults to 4243')
  .option('-h, --host <host>', 'Optional host address, defaults to http://127.0.0.1')
  .parse(process.argv);

var dockship = new Dockship({
  host: program.host,
  port: program.port
});

if(program.status) {

  // STATUS
  dockship.listAppInstances(function(err, appInstances) {
    if(err) return console.error(err);
    console.log(createTableAppInstances(appInstances));
  });

} else if(program.push) {

  // PUSH
  dockship.deployApp(program.push, streamHandler);

} else if(program.start) {

  // START
  dockship.listApps(program.start, function(err, ids) {
    if(err) return console.error(err);
    ids.forEach(function(app) {
      dockship.startApp(app.id, function(err, containerId) {
        if(err) {
          console.error('Error: ' + err);
        } else {
          console.log('Started: ' + containerId.shortId());
        }
      });
    });
  });

} else if(program.list) {

  // LIST
  dockship.listApps(null, function(err, apps) {
    if(err) return console.error(err);
    console.log(createTableApps(apps));
  });

} else if(program.stop) {

  // STOP
  dockship.findAppIds(program.stop, function(err, ids) {
    if(err) return console.error(err);
    ids.forEach(function(id) {
      dockship.stopApp(id, function(err, result) {
        if(err) {
          console.error('Error: ' + err);
        } else {
          console.log('Stopped: ' + id.shortId());
        }
      });
    });
  });

} else if(program.log) {

  // LOG

  dockship.getInstanceLogs(program.log, process.stdout, process.stderr, function(err) {
    if(err) {
      console.error('Error: ' + err);
    }
  });

} else if(program.purge) {

  // DELETE
  dockship.deleteApp(program.purge, defaultHandler);

} else if(program.log) {

  // LOG

} else {
  program.help();
}

function defaultHandler(err, data) {
  if(err) return console.error(err);
  console.log(data);
}

function streamHandler(err, stream) {
  if(err) return console.error(err);
  stream.setEncoding('utf8');
  stream.on('data', function(data) {
    process.stdout.write(JSON.parse(data).stream || '');
  });
}

function createTableApps(apps) {
  var table = new Table({
    head: ['id', 'name'],
    colWidths: [14, 40]
  })
  apps.forEach(function(app) {
    table.push([app.id.substr(0,12), app.name]);
  });
  return(table.toString());
}

function createTableAppInstances(appInstances) {
  var table = new Table({
    head: ['instance', 'app', 'status', 'name'],
  })
  appInstances.forEach(function(appInstance) {
    table.push([
      appInstance.Id.shortId(),
      appInstance.Image,
      appInstance.Status,
      appInstance.Names[0]
    ]);
  });
  return(table.toString());
}

// Helpers

String.prototype.shortId = function() {
  return this.substr(0, 12);
};
