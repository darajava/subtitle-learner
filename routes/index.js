var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var zipFolder = require('zip-folder');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.post('/upload', function(req, res, next) {
  var basedir = "/tmp/" + req.files.file.name + "/";

  if (!fs.existsSync(basedir)){
    fs.mkdirSync(basedir);
  }

  var filename = basedir + 'original.' + req.files.file.name;
  
  fs.writeFile(filename, req.files.file.data, function(err) {
    if(err) {
      return console.log(err);
    }

    var text = fs.readFileSync(filename, 'utf8')
    
    blankWords(text, req);


  });

  var blankWords = function(text, req) {
    text = text.toString('utf8')
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(path.join(__dirname, '../public', 'wordlist'))
    });

    var count = 1;
    var words = 10000;
    var levels = [words / 128, words / 64, words / 32, words / 16, words / 8, words / 4, words / 2, words];


    lineReader.on('line', (line) => {
      var replace = '([ \\?\\.,!\\n])(' + line + ')([ \\?\\.,!])';
      var re = new RegExp(replace, "ig");
      text = text.replace(re, function(repl, one, two, three) {
        console.log(one);
        console.log(two);
        console.log(three);
        return one + times('_', two.length) + three
      });

      count++;

      for (var i = 0; i < levels.length; i++) {
        if (Math.round(levels[i]) === count) {
          fs.writeFile(basedir + "level" + (i + 1) + '.' + req.files.file.name, text, 'utf8', (err) => {
            if(err) {
              return console.log(err);
            }

          }); 
        }
      }
    });

    lineReader.on('close', function () {
      zipFolder(basedir, basedir + '../' + req.files.file.name + '.zip', function(err) {
        if(err) {
          console.log('oh no!', err);
        } else {
          console.log('EXCELLENT');
        }
        res.download(basedir + '../' + req.files.file.name + '.zip')
      });
    });
  }
});



var times = function(char, length) {
  text = "";
  for (var i = 0; i < length; i++) {
    text += char;
  }

  return text;
}

module.exports = router;
