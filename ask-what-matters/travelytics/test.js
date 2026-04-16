const { overallStars, translateReview } = require('./src/lib/property-helpers.js');
console.log(overallStars('{"overall": 5.0}'));
console.log(overallStars('{"overall": 3.0}'));
