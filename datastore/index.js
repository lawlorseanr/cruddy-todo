const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

// var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  counter.getNextUniqueId((err, id) => {
    var todoFile = path.join(exports.dataDir, `${id}.txt`);
    fs.writeFile(todoFile, text, (err, fileData) => {
      if (err) {
        return console.error(`Error writing ${id}.txt`);
      }
      callback(null, { id, text });
    });
  });

};

exports.readAll = (callback) => {

  fs.promises.readdir(exports.dataDir)
    .then( files => {
      return _.map(files, file => {
        var todoPath = path.join(exports.dataDir, `${file}`);
        return fs.promises.readFile(todoPath)
          .then( rawData => {
            var id = file.split('.')[0];
            var text = rawData.toString();
            return {id, text};
          })
          .catch( err => {
            throw new Error(`Error reading ${file}`);
          });
      });
    })
    .then( promises => {
      Promise.all(promises)
        .then( todos => callback(null, todos));
    })
    .catch( err => {
      callback(err);
    });

};

exports.readOne = (id, callback) => {

  var todoDir = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(todoDir, (err, rawText) => {
    if (err) {
      return callback(new Error(`No item with id: ${id}`));
    }
    var text = rawText.toString();
    callback(null, {id, text});
  });

};

exports.update = (id, text, callback) => {

  var todoDir = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(todoDir, (err, rawText) => {
    if (err) {
      return callback(new Error(`No item with id: ${id}`));
    }
    fs.writeFile(todoDir, text, (err) => {
      if (err) {
        return callback(new Error(`Error updating id: ${id}`));
      }
      callback(err, {id, text} );
    });
  });

};

exports.delete = (id, callback) => {

  var todoDir = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(todoDir, (err) => {
    if (err) {
      return callback(err);
    }
    callback();
  });

};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
