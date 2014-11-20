/*
  To start the action from icon click:
    * send a message to content script 
    * mutate a variable in contentscript that triggers the functions
    * or, put all code in a function, instead of dom ready 
*/

var dataIds;
var resCount = 0;
var first = 0;
var idCount;
var posts = '';

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "knockknock");
  port.onMessage.addListener(function(msg) {
    // set all ids
    if (first == 0){
      dataIds = msg.Ids;
      first = 1;
      idCount = dataIds.length;
    }
    else{
      if(msg.message === undefined){
        // reload the page and ask for posts again
      }else{
        posts = posts + msg.message + '\n --------------' + resCount + '\n';
        resCount++;
        if(resCount < idCount){
          chrome.tabs.update({
            url: "https://courses.edx.org/courses/OECx/PH241x/3T2014/discussion/forum/7f639fd35182462dbcf13ea1adb6df27/threads/"},    
            function(tab){
            }
          );
        }
        else{
          return;
        }
      }
    }
  }); 


  chrome.browserAction.onClicked.addListener(function(tab) {
    //alert("Starting post collection");
    port.postMessage({embark: 'start'});
    alert("Posts collection started");
  });

});




