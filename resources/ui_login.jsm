
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");
Components.utils.import("resource://sfdccrutch/dom.jsm");
Components.utils.import("resource://sfdccrutch/sfdccrutch.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.UILogin"];

SFDCCRUTCH.UILogin = {};

SFDCCRUTCH.UILogin.instrument = function(doc,url) {
  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UILogin.instrument - entering ");
  var credentials = SFDCCRUTCH.Util.getUsernameAndPassword();
  var result = false;
  if (credentials.user != "")
  {
    var input_user = SFDCCRUTCH.Dom.FindNode(doc,"id","username");
    if (input_user !=null)
    {
      var input_password = SFDCCRUTCH.Dom.FindNode(doc,"id","password");
      input_user.value = credentials.user;
      if (input_password !=null)
      {
        input_password.value = credentials.password;
        result = true;
      }
      //else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UILogin.instrument - input_password is NULL " );
    }
    //else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UILogin.instrument - input_user is NULL " );
  }
   
  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UILogin.instrument - exiting "+result);
  return result;
}

SFDCCRUTCH.UILogin.save = function(doc) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UILogin.save - entering doc="+doc);
  var button =SFDCCRUTCH.Dom.FindNode(doc,"id","Login");
  if (button != null)
  {
          var evt = doc.createEvent("MouseEvents");  
          evt.initEvent("click", true, false);  
          button.dispatchEvent(evt);
  }
  else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UILogin.save - button is NULL " );
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UILogin.save - exiting");
}

SFDCCRUTCH.UILogin.isLoginPageWithNoError = function(doc,url) {
  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UILogin.isLoginPageWithNoError - entering "+url);
  var result=false;
  var regexp = new RegExp("https://login.salesforce.com/");
  var matches = regexp.exec(url);
  if (matches != null || url=="https://genband.my.salesforce.com/")
  {
    var error_div=SFDCCRUTCH.Dom.FindNode(doc,"id","error");
    if (error_div != null && error_div.textContent.search("Your login attempt has failed. The username or password may be incorrect")!=-1)
    {
      //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UILogin.isLoginPageWithNoError - error was encountered !!");
    }
    else result = true;
  }
  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UILogin.isLoginPageWithNoError - exiting "+result);
  return result;
}