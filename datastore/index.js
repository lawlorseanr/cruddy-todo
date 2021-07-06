const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    var todoFile = path.join(exports.dataDir, `${id}.txt`);
    fs.writeFile(todoFile, text, (err, fileData) => {
      if (err) {
        return console.error(`Error writing ${id}.txt`);
      }
      console.log(`Wrote ${id}.txt contents: "${text}"`);
      callback(null, { id, text });
    });
  });
};

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      return console.log(`Error reading files in ${exports.dataDir}.`);
    }
    var data = _.map(files, (text, id) => {
      fs.readFile(path.join(exports.dataDir, files), (err, rawText) => {
        if (err) {
          return callback(new Error(`Error reading data from ${id}`));
        }
        var text = rawText.toString();
        return { id, text };
      });
    });
    callback(null, data);
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
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
