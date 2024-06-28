
Module = require('module');
const requireOrig = Module.prototype.require;
Module.prototype.require = function (...args) {
  // console.log('Importing ', args);
  change()
  return requireOrig.apply(this, args);
}

function change() {
  process.env.DEV_MODE = 'true'
  process.env.NODE_ENV = 'development'
}


require('react-app-rewired/scripts/build')
