var Rsync = require('rsync');
var dotenv = require('dotenv')
const result = dotenv.config()

// Build the command
var rsync = new Rsync()
  .shell('ssh -p 27130')
  .flags('az')
  .source('./build/')
  .destination(process.env.SERVER + ':/var/www/pomometer');
 
// Execute the command
rsync.execute(function(error, code, cmd) {
    // we're done
    if (error === null){
        console.log("success")
    }else{
        console.log("error", error,code, cmd )
    }
});
