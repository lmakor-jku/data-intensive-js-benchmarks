// seedable random implementation found via
// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
// from
// https://github.com/bryc/code/blob/master/jshash/PRNGs.md
// License info from "bryc": "License: Public domain."

// Create xmur3 state:
var seed = xmur3('apples');

// Output one 32-bit hash to provide the seed for mulberry32.
var rand = mulberry32(seed());

function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function randInt(min, max) {
  var count = max - min;
  return parseInt(Math.floor(min + rand() * count));
}

function createRandomObject() {
  return {
    'a': randInt(1, 3),
    'b': randInt(1, 6),
    'c': randInt(1, 6),
    'd': randInt(1, 6),
    'e': randInt(1, 1000)
  };
}

// NOTE: need to work with secs to not exceed int range when generating rand value
// NOTE: we shouldn't use now here as the scripts themselves should be stateless
var dateCreationMaxValSecs  = new Date('2022-07-27 03:54:13') / 1000;
var dateCreationMinValSecs = dateCreationMaxValSecs - 365 * 24 * 60 * 60;

function createRandomDateWithinLastYear(){
  var timeValSecs = randInt(dateCreationMinValSecs, dateCreationMaxValSecs);
  return new Date(timeValSecs * 1000);
}

function initDateDB(size) {
  var db = [];
  for(let i = 0; i < size; i++) {
    let x = createRandomObject();
    x.customDate = createRandomDateWithinLastYear();
    db.push(x);
  }
  return db;
}

function aggregateDate(arr) {
  if (!Array.isArray(arr)) {
    throw "Aggregated construct needs to be an array!"
  }
  let sum = 0;
  const compareVal = new Date();
  compareVal.setDate(compareVal.getDate() - 30);
  const filterTime = compareVal.getTime();
  for(let i = 0; i < arr.length; i++) {
    const o = arr[i];

    // check whether within last 30 days
    if (o.customDate.getTime() > filterTime) {
      sum += o.e;
    }
  }
  return sum;
}

function performBenchmark(loadCount, iterations){
  var db = initDateDB(loadCount);

  var res = {};
  res.db = db;
  res.res = 0;

  for (let i = 0; i < iterations; i++) {
    res.res += aggregateDate(db);
  }
  return res;
}
