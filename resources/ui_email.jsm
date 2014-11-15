
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");
Components.utils.import("resource://sfdccrutch/dom.jsm");
Components.utils.import("resource://sfdccrutch/sfdccrutch.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.UIEmail"];

SFDCCRUTCH.UIEmail = {};

SFDCCRUTCH.UIEmail.PopulateEmailPage = function(doc,caseId){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.PopulateEmailPage - entering doc="+doc+" "+caseId);
  
  var subject = SFDCCRUTCH.Dom.FindNode(doc,"id","p6");
  if (subject !=null)
  {
    var email_subject = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.TEMPLATE_EMAIL_SUBJECT, "str", "default");
    email_subject = SFDCCRUTCH.CasePageInformationSet[caseId].replaceKeywords(email_subject);
    SFDCCRUTCH.UI.simulateKeyEvent(doc,subject,email_subject);

  }
  else
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UI.PopulateEmailPage - can't find subject");
  
  var body = SFDCCRUTCH.Dom.FindNode(doc,"id","p7");
  if (body !=null)
  {
    body.textContent =   SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("comment");
  }
  else
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UI.PopulateEmailPage - can't find body");
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.PopulateEmailPage - exiting ");
}