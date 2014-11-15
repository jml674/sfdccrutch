
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");
Components.utils.import("resource://sfdccrutch/sfdccrutch.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.HTTP"];

SFDCCRUTCH.HTTP = {};

SFDCCRUTCH.HTTP.registered = false;

function LOG(text)
{
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage(text);
}

var httpRequestObserver =
{
  observe: function(subject, topic, data)
  {  subject.QueryInterface(Components.interfaces.nsIHttpChannel);
     SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"httpRequestObserver.httpRequestObserver - entering topic="+topic+" subject="+subject.URI.spec);
    
    if (topic == "http-on-modify-request") {
      //LOG("----------------------------> (" + subject.URI.spec; + ") mod request ");
      subject.QueryInterface(Components.interfaces.nsIHttpChannel);

      // Get the request headers
      var visitor = new HeaderInfoVisitor(subject);
      var requestHeaders = visitor.visitRequest();
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"observe JML--> topic: "+topic+"   host="+requestHeaders["Host"]);
      
      var regexp = new RegExp(requestHeaders["Host"]);
      var matches = regexp.exec(this.domain);
      if (matches != null)
      {
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"httpRequestObserver JML--> found: "+requestHeaders["Cookie"]);  
          subject.cancel(Components.results.NS_BINDING_ABORTED);
      }
    }
  },
 
  get observerService() {
    return Components.classes["@mozilla.org/observer-service;1"]
                     .getService(Components.interfaces.nsIObserverService);
  },
 
  register: function()
  {
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"httpRequestObserver entering register function");
    this.observerService.addObserver(this, "http-on-modify-request", false);
  },

  registerForDomain: function(domain,cb)
  {
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"registerForDomain entering "+domain);  
    this.observerService.addObserver(this, "http-on-modify-request", false);
    this.callback = cb;
    this.domain = domain;
  },

 
  unregister: function()
  {
    this.observerService.removeObserver(this, "http-on-modify-request");
  }
};

SFDCCRUTCH.HTTP.registerForDomain = function(domain,cb){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.HTTP.registerForDomain entering "+domain);
  if (SFDCCRUTCH.HTTP.registered)
    httpRequestObserver.unregister();
  
  SFDCCRUTCH.HTTP.registered = true;
  
  httpRequestObserver.registerForDomain(domain,cb);
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.HTTP.registerForDomain exiting ");
  
}

SFDCCRUTCH.HTTP.unregister = function(){
  httpRequestObserver.unregister();
  SFDCCRUTCH.HTTP.registered = false;

}


function HeaderInfoVisitor (oHttp) {
  this.oHttp = oHttp;
  this.headers = new Array();
}

HeaderInfoVisitor.prototype =  {
   extractPostData : function(visitor, oHttp) {
      function postData(stream) {
         // Scriptable Stream Constants
         this.seekablestream = stream;
         this.stream = SFDCCRUTCH.HTTP.createScriptableInputStream(this.seekablestream);
         
         // Check if the stream has headers
         this.hasheaders = false;
         this.body = 0;
         this.isBinary = true;
         if (this.seekablestream instanceof Components.interfaces.nsIMIMEInputStream) {
            this.seekablestream.QueryInterface(Components.interfaces.nsIMIMEInputStream);
            this.hasheaders = true;
            this.body = -1; // Must read header to find body
            this.isBinary = false;
         } else if (this.seekablestream instanceof Components.interfaces.nsIStringInputStream) {
            this.seekablestream.QueryInterface(Components.interfaces.nsIStringInputStream);
            this.hasheaders = true;
            this.body = -1; // Must read header to find body
         }
      }

      postData.prototype = {
         rewind: function() {
            this.seekablestream.seek(0,0);
         },

         tell: function() {
            return this.seekablestream.tell();
         },
   
         readLine: function() {
            var line = "";
            var size = this.stream.available();
            for (var i = 0; i < size; i++) {
               var c = this.stream.read(1);
               if (c == '\r') {
               } else if (c == '\n') {
                  break;
               } else {
                  line += c;
               }
            }
            return line;
         },
   
         // visitor can be null, function has side-effect of setting body
         visitPostHeaders: function(visitor) {
            if (this.hasheaders) {
               this.rewind();
               var line = this.readLine();
               while(line) {
                  if (visitor) {
                     var tmp = line.match(/^([^:]+):\s?(.*)/);
                     // match can return null...
                     if (tmp) {
                        visitor.visitPostHeader(tmp[1], tmp[2]);
                        // if we get a tricky content type, then we are binary
                        // e.g. Content-Type=multipart/form-data; boundary=---------------------------41184676334
                        if (!this.isBinary && tmp[1].toLowerCase() == "content-type" && tmp[2].indexOf("multipart") != "-1") {
                           this.isBinary = true;
                        }
                     } else {
                        visitor.visitPostHeader(line, "");
                     }
                  }
                  line = this.readLine();
               }
               this.body = this.tell();
            }
         },
   
         getPostBody: function(visitor) {
            // Position the stream to the start of the body
            if (this.body < 0 || this.seekablestream.tell() != this.body) {
               this.visitPostHeaders(visitor);
            }
            
            var size = this.stream.available();
            if (size == 0 && this.body != 0) {
               // whoops, there weren't really headers..
               this.rewind();
               visitor.clearPostHeaders();
               this.hasheaders = false;
               this.isBinary   = false;
               size = this.stream.available();
            }
            var postString = "";
            try {
               // This is to avoid 'NS_BASE_STREAM_CLOSED' exception that may occurs
               // See bug #188328.
               for (var i = 0; i < size; i++) {
                  var c = this.stream.read(1);
                  c ? postString += c : postString+='\0';
               }
            } catch (ex) {
               return "" + ex;
            } finally {
               this.rewind();
               // this.stream.close();
            }
            // strip off trailing \r\n's
            while (postString.indexOf("\r\n") == (postString.length - 2)) {
               postString = postString.substring(0, postString.length - 2);
            }
            return postString;
         }
      };
   
      // Get the postData stream from the Http Object 
      try {
         // Must change HttpChannel to UploadChannel to be able to access post data
         oHttp.QueryInterface(Components.interfaces.nsIUploadChannel);
         // Get the post data stream
         if (oHttp.uploadStream) {
            // Must change to SeekableStream to be able to rewind
            oHttp.uploadStream.QueryInterface(Components.interfaces.nsISeekableStream);
            // And return a postData object
            return new postData(oHttp.uploadStream);
         } 
      } catch (e) {
         LOG("Got an exception retrieving the post data: [" + e + "]");
         return "crap";
      }
      return null;
   },
   
   visitHeader : function(name, value) {
      this.headers[name] = value;
      //if (name=="Host") LOG("--> header: "+name+"="+value);
   },

   visitPostHeader : function(name, value) {
      if (!this.postBodyHeaders) {
         this.postBodyHeaders = {};
      }
      this.postBodyHeaders[name] = value;

   },

   clearPostHeaders : function() {
      if (this.postBodyHeaders) {
         delete this.postBodyHeaders;
      }
   },

   visitRequest : function () {
      this.headers = {};
      this.oHttp.visitRequestHeaders(this);
      
      // There may be post data in the request
      var postData = this.extractPostData(this, this.oHttp);
      if (postData) {
         var postBody = postData.getPostBody(this);
         if (postBody !== null) {
            this.postBody = {body : postBody, binary : postData.isBinary};
         }
      }
      return this.headers;
   },

   getPostData : function() {
      return this.postBody ? this.postBody : null;
   },

   getPostBodyHeaders : function() {
      return this.postBodyHeaders ? this.postBodyHeaders : null;
   },
   
   visitResponse : function () {
      this.headers = new Array();
      this.oHttp.visitResponseHeaders(this);
      return this.headers;
   }
};
SFDCCRUTCH.HTTP.createScriptableInputStream = function(inputStream) {
   var stream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
   stream.init(inputStream);
   return stream;
};