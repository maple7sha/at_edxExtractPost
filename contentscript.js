/*
	Read in all discussion posts on a specific site on an Edx course, and output all posts into a .txt on html5_filesystem
  Implementation: 
    0. Start only after triggered by background.js
    1. while 'load more' is present, click it
    2. after loading all pages, start collecting current post and append it to log file at html5 persistent storage
        * after each log, send a message to background script, which will then load the next page 
    3. after everything is done, stop


  Potential Next Steps:
    0. Figure out a way to retrieve pictures
    1. Get all present comments to current post 
*/

// send post only after dom loaded
window.onload = theDomHasLoaded;
// Buffering all comments before entering
var post = '';

// callback for click is very tricky; could not get it work; thus an alternative has been choosen: intervals
function theDomHasLoaded(e) {
  // connect to background
  var port = chrome.runtime.connect({name: "knockknock"});
  port.onMessage.addListener(function(msg) {
    if (typeof msg.embark != 'undefined'){
      console.log("Got message from background page")

  var loop = 1;
  var loadMore;
  // setup call back function all when clicked
  console.log("load start");
  //intVar = setInterval(loadMore, 1000);

  loadMore = document.getElementsByClassName('forum-nav-load-more-link')[0];
  //while (loop) {
  if (loadMore != null){
    //$(".forum-nav-load-more-link")[0].click();
    var delayCount = 0
    var checkLoadMoreExist = setInterval(function() {
      if ($('.forum-nav-load-more-link').length) {
        $(".forum-nav-load-more-link")[0].click();
        delayCount = 0;
      }else{
        delayCount += 1;
        if (delayCount > 3){          
          console.log("Assume the end of Load More");
          clearInterval(checkLoadMoreExist);
          // start getting each post to filesystem storage
          var threadList = document.getElementsByClassName('forum-nav-thread-link');
          threadList[0].click();
          var postCount = 1;
          var checkPostExist = setInterval(function() {
            if($('.post-body').length) {
              post += '\n ### POST NO. ' + postCount + '\n' + $('.post-header-content').find('h1').text() + '\n ' + $('.post-body').text() + '\n\n';
              console.log("New post: \n" + post);
              if(threadList[postCount] != null){
                threadList[postCount].click();
                postCount++;
                console.log("total threads" + threadList.length);
                console.log("current thread" + postCount);
              }
              else{
                clearInterval(checkPostExist);
                navigator.webkitPersistentStorage.requestQuota(1024*1024, function(grantedBytes) {
                  requestFS(grantedBytes);
                }, function(e) {
                  console.log('Error', e);
                });

              }
            }
            else{
            }
            if(postCount > threadList.length){
              clearInterval(checkPostExist);
              navigator.webkitPersistentStorage.requestQuota(1024*1024, function(grantedBytes) {
                requestFS(grantedBytes);
              }, function(e) {
                console.log('Error', e);
              });
            }
          }, 1000)
        }
      }
    }, 1000);
  }
  console.log("load ends");


     }
    else{
      console.log("msg.embark undefined");
    }
  });

}

// Write to file
function onInitFs(fs) {
  fs.root.getFile('log.txt', {create: true}, function(fileEntry) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {
      /*fileWriter.seek(fileWriter.length); // Start write position at EOF.
      // Create a new Blob and write it to log.txt.*/
      fileWriter.onwriteend = function(e) {
        console.log('Write completed.');
      };

      fileWriter.onerror = function(e) {
        console.log('Write failed: ' + e.toString());
      };

      var blob = new Blob([post], {type: 'text/plain'});
      fileWriter.write(blob);
    }, errorHandler);
  }, errorHandler);
}

function requestFS(grantedBytes) {
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
  window.requestFileSystem(window.PERSISTENT, grantedBytes, onInitFs, errorHandler);
}

function errorHandler(e) {
  var msg = '';
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  console.log('Error: ' + msg);
}




// response to each request and send back text accordingly



/*
alert('test');
$(document).ready(function() {
  // Trollface image must be at 'my_extension/images/trollface.jpg'.

  var trollface = chrome.extension.getURL("images/trollface.jpg");
  alert('test');
  $('#content article img').each(function(index, image){
    $(image).attr('src', trollface);
  });
});*/
