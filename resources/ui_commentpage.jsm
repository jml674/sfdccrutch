
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");
Components.utils.import("resource://sfdccrutch/dom.jsm");
Components.utils.import("resource://sfdccrutch/sfdccrutch.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.UICommentPage"];

SFDCCRUTCH.UICommentPage = {};

SFDCCRUTCH.UICommentPage.save = function(button_save,doc,caseId) {
  var nextUpdateDateNew = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDateNew");
  var subStatus = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonSubStatus");
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.save - entering doc="+doc+" "+caseId+" nextUpdateDateNew=["+nextUpdateDateNew+"]");
  
  if (SFDCCRUTCH.Util.checkDateMMDDYYYY(nextUpdateDateNew) || subStatus==SFDCCRUTCH.InDefaultScreeningEdition || subStatus==SFDCCRUTCH.InRequestInfoScreeningEdition)
  {
    SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",SFDCCRUTCH.CommentHasBeenSaved);

    var changed= true;
        
    if (SFDCCRUTCH.Util.FormatZerosDate(SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDate")) == nextUpdateDateNew &&
      SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganization") == SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganizationNew"))
    {
      if ( subStatus== SFDCCRUTCH.InRegularEdition)
        SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",0);
      changed = false;
    }
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.save - SFDCCRUTCH.CasePageInformationSet next update changed "+changed);
      
    if (subStatus == SFDCCRUTCH.InRegularEdition || subStatus == SFDCCRUTCH.EmailToBeSent || subStatus == SFDCCRUTCH.InAssignmentEdition)
    {
        SFDCCRUTCH.alarmManager._addCaseAlarm(caseId,
                SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("caseNumber"),
                "https://genband.my.salesforce.com/"+caseId,
                SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("subject"),
                nextUpdateDateNew,
                SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("severity")); 
      
    }
    // finally call SFDC onclick method
    button_save.onclick = SFDCCRUTCH.CasePageInformationSet[caseId].save_button_onclick;
    button_save.setAttribute("type", "submit");

    button_save.submit();
    //SFDCCRUTCH.Util.getBrowserWindow().setTimeout(function(){ button_save.onclick();},200); 
  } 
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.save - exiting "+subStatus);
  
}

SFDCCRUTCH.UICommentPage.suggestNextUpdateDate = function(severity,explanation,nextupdatedate,inc,inc_we) {

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.suggestNextUpdateDate - entering "+severity+" "+nextupdatedate);
  var new_date = nextupdatedate;
  if (severity=="Major") inc= SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.NEXTUPDATE_DAYS_INC_MAJOR, "int", 1);
  else if (severity=="Business Critical") inc= SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.NEXTUPDATE_DAYS_INC_BC, "int", 1);
  else if (severity=="Minor") inc= SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.NEXTUPDATE_DAYS_INC_MINOR, "int", 1);
    
  var dateTime = new SFDCCRUTCH.DateTime();
  dateTime.add(SFDCCRUTCH.DateTime.DAY, inc);
  var weekdays = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.NEXTUPDATE_DAYS_INC_WEEKDAYS, "str", "M-F");
  var day = dateTime.date.getDay();
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICommentPage.suggestNextUpdateDate - day="+day);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICommentPage.suggestNextUpdateDate - month="+dateTime.date.getMonth());
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICommentPage.suggestNextUpdateDate - date="+dateTime.date.getDate());
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICommentPage.suggestNextUpdateDate - datestr="+dateTime.date);

    // 0 is sunday
  if (day==0 && weekdays=="M-F") inc_we = 1;
  if (day==6 && weekdays=="M-F") inc_we = 2;
  if (day==6 && weekdays=="S-T") inc_we = 1;
  if (day==5 && weekdays=="S-T") inc_we = 2;
  dateTime.add(SFDCCRUTCH.DateTime.DAY, inc_we);
  explanation[0]="("+severity+"/+"+inc+"days)";
  if (inc_we!=0) explanation[0]+="(+"+inc_we+"days/we)";
    new_date = dateTime;
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.suggestNextUpdateDate - exiting nupdd="+new_date+" "+inc+" "+inc_we+" "+explanation[0]);
  return new_date;
}


SFDCCRUTCH.UICommentPage.instrument = function(doc,caseId)
{

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.instrument - entering doc="+doc+" "+caseId);
  
  var textarea = SFDCCRUTCH.Dom.FindNode(doc,"id","customCaseCommentPage:caseCommentform:caseCommentBlock:CommentBody");
  textarea = SFDCCRUTCH.Dom.FindNode(doc,"id","CommentBody");

  var input_Updatedate;
  var substatus = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonSubStatus");
  var public_update_button = SFDCCRUTCH.Dom.FindNode(doc,"id","IsPublished");
  
  SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("nextUpdateDateNew",SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDate"));
  SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("ownerOrganizationNew",SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganization"));

  
  if ( substatus == SFDCCRUTCH.InRegularEdition || substatus == SFDCCRUTCH.InAssignmentEdition )
  {
     if (substatus == SFDCCRUTCH.InRegularEdition)
        textarea.value = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.TEMPLATE_ACTION, "str", "default");
     else if (substatus == SFDCCRUTCH.InAssignmentEdition)
        textarea.value = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.TEMPLATE_ASSIGNMENT, "str", "default");

    var currentNextUpdateDateIsInvalid=(SFDCCRUTCH.Util.FormatZerosDate(SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDate"))=="");

     textarea.value = SFDCCRUTCH.CasePageInformationSet[caseId].replaceKeywords(textarea.value);
     
     var div = textarea.parentNode;
     var td  = div.parentNode;
     var tr  = td.parentNode;
     var table = tr.parentNode;
     
     input_Updatedate = doc.createElement("input");
     input_Updatedate.setAttribute("type", "text");

     input_Updatedate.size = "10";

     input_Updatedate.setAttribute("id", "test");     
     input_Updatedate.setAttribute("name", "test");     

     //input.setAttribute("onfocus","DatePicker.pickDate(true, 'test', false);");
      SFDCCRUTCH.UI.addLinkToElement(doc,td,"chrome://sfdccrutch/skin/jquery-ui.css");
  
     SFDCCRUTCH.UICommentPage.createDatePicker(doc,"#test");
  
     var current_nextUpdateDateTime = new SFDCCRUTCH.DateTime();
     var severity = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("severity");
     current_nextUpdateDateTime.setMDYfromString(SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDate"));
  
     var dateTime = new SFDCCRUTCH.DateTime();
     var explanation =  [];
     explanation[0]="(unchanged)";
     var new_date = current_nextUpdateDateTime;
     var inc=1;
     var inc_we=0;
  
     if (current_nextUpdateDateTime.before(dateTime) || currentNextUpdateDateIsInvalid)
     { 
       new_date = SFDCCRUTCH.UICommentPage.suggestNextUpdateDate(severity,explanation,current_nextUpdateDateTime,inc,inc_we);
       textarea.value = SFDCCRUTCH.UICommentPage.replaceNextUpdateDate(textarea,new_date.formatMDY());
       //modif JML 13/10 
       //if (currentNextUpdateDateIsInvalid)
          SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("nextUpdateDateNew",new_date.formatMDY());       
     }
     else SFDCCRUTCH.UICommentPage.replaceNextUpdateDate(textarea,SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDate"));
  
     input_Updatedate.setAttribute("value", new_date.formatMDY());
     input_Updatedate.style.color = "Blue";
     input_Updatedate.style.verticalAlign = "middle"; 
     
     input_Updatedate.addEventListener("keyup", function(){
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.instrument - onkeyup nupd entering");
        SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("nextUpdateDateNew",this.value);
        
        if (SFDCCRUTCH.Util.checkDateMMDDYYYY(this.value))
        {
          input_Updatedate.style.color = "Blue";
          SFDCCRUTCH.UICommentPage.replaceNextUpdateDate(textarea,this.value);

        }
        else input_Updatedate.style.color = "Red";          
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.instrument - onkeyup nupd exiting");

      },false);
 
     input_Updatedate.addEventListener("change", function(){
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.instrument - input nupd entering");
        SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("nextUpdateDateNew",this.value);
        
        if (SFDCCRUTCH.Util.checkDateMMDDYYYY(this.value))
        {
          input_Updatedate.style.color = "Blue";
          SFDCCRUTCH.UICommentPage.replaceNextUpdateDate(textarea,this.value);

        }
        else input_Updatedate.style.color = "Red";          
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.instrument - input nupd exiting");

      },false);

     td_label = doc.createElement("td");
     var bold = doc.createElement("b");
     td_label.textContent="Next Update Date (MM/DD/YYYY)";
     td_label.style.color = "Blue";
     td_label.style.width="20%";
     td_label.align="right";
     td_date = doc.createElement("td");
     td_explanation = doc.createElement("td");
     td_explanation.textContent=explanation[0];
     td_explanation.style.color = "Blue";
     td_explanation.style.verticalAlign = "middle"; 

     button_suggest = doc.createElement("button");
     button_suggest.setAttribute("type","button");
     button_suggest.style.color = "Blue";

     button_suggest.onclick=function(){
       new_date = SFDCCRUTCH.UICommentPage.suggestNextUpdateDate(severity,explanation,current_nextUpdateDateTime,inc,inc_we);
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICommentPage.instrument - explanation="+explanation[0]);
       input_Updatedate.value = new_date.formatMDY();
       SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("nextUpdateDateNew",new_date.formatMDY());
       td_explanation.textContent=explanation[0];
    
       td_explanation.style.color = "Green";
       input_Updatedate.style.color = "Green";
       SFDCCRUTCH.UICommentPage.replaceNextUpdateDate(textarea,new_date.formatMDY());
  
      };
     button_suggest.textContent = "Suggest date";
  
     tr = doc.createElement("tr");
  
     table.appendChild(tr);  
     var tr_help = SFDCCRUTCH.UI.createHelpButton(doc,"suggest","");
     if (tr_help != null) table.appendChild(tr_help);
     else 
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICommentPage.instrument - tr_help is null !");

     bold.appendChild(td_label);
     tr.appendChild(bold);  
     tr.appendChild(td_date);
     tr.appendChild(td_explanation);
     tr.appendChild(button_suggest);
     td_date.appendChild(input_Updatedate);
     SFDCCRUTCH.UI.replaceOwnerOrganizationAndPublicCheckbox(doc,caseId,textarea,public_update_button,SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganization"),false);
 
     // suscribe automatically if customer interface has been set 
     if(SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("gtsCustomerInterfaceMandatory") && SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.DIRECT_SUBSCRIBE_WHEN_GTS_CI_INTERFACE_SET, "bool", true))
     {
        var dateAndTimeText=SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("dateAndTimeText");
        var commentMaker=SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("commentMaker");
        SFDCCRUTCH.watchesManager._addCaseWatch(caseId,
                                              SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("caseNumber"),
                                              "https://genband.my.salesforce.com/"+caseId,
                                              SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("subject"),
                                              dateAndTimeText,
                                              SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("severity"),
                                              commentMaker);
     }
     if (public_update_button != null)
     {
           var subscribe = SFDCCRUTCH.UI.createSubscribeButton(doc,caseId,"input");
           public_update_button.parentNode.insertBefore(subscribe,public_update_button.nextSibling);
           var retvals = SFDCCRUTCH.UI.createSelectOwnerButton(doc,caseId,textarea,public_update_button);
           public_update_button.parentNode.parentNode.appendChild(retvals.top);
     }
     else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICommentPage.instrument - public_update_button is null !");

   }
   else
   {
      if (public_update_button != null)
      {
        // modification 1.2.14
        //public_update_button.checked = true;
        SFDCCRUTCH.UI.simulateClickEvent(doc,public_update_button);
      }
      else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICommentPage.instrument - public_update_button is null !");
      if (SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonSubStatus") == SFDCCRUTCH.InDefaultScreeningEdition)
      {
        textarea.value = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.TEMPLATE_SCREENING_DEFAULT, "str", "default");
      }
      else if (SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonSubStatus") == SFDCCRUTCH.InRequestInfoScreeningEdition)
      {
        textarea.value = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.TEMPLATE_SCREENING_REQUESTINFO, "str", "default");
      }
      textarea.value = SFDCCRUTCH.CasePageInformationSet[caseId].replaceKeywords(textarea.value);

   }

   var button_save_set = SFDCCRUTCH.Dom.FindAllNodes(doc,"value"," Save ");
   for (var i=0;i<button_save_set.length;i++)
   {
      var button_save=button_save_set[i];
      SFDCCRUTCH.CasePageInformationSet[caseId].save_button_onclick = button_save.onclick;
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICommentPage.instrument - input save onclick="+i+" "+button_save.onclick);
      button_save.onclick=function(){return true;};
      // TBC
      button_save.setAttribute("type", "button");
      
      button_save.addEventListener("click", function(){
          SFDCCRUTCH.UICommentPage.save(this,doc,caseId);
        }, false);
    
      button_save.style.color = "Blue";
      var button_save_and_email = doc.createElement("input");
      button_save_and_email.setAttribute("class", "btn");
      button_save_and_email.setAttribute("value", "Save&send email");
      button_save_and_email.setAttribute("type", "button");
      button_save_and_email.style.color = "Blue";
      button_save_and_email.onclick=function(){
          SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonSubStatus",SFDCCRUTCH.EmailToBeSent);
          SFDCCRUTCH.UICommentPage.save(button_save,doc,caseId);
        };

      button_save.parentNode.insertBefore(button_save_and_email,button_save.nextSibling);
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICommentPage.instrument - input final save onclick="+i+" "+button_save.onclick);
   }
  
   var button_cancel_set = SFDCCRUTCH.Dom.FindAllNodes(doc,"value","Cancel");
   for (var i=0;i<button_cancel_set.length;i++)
   {
     var button_cancel=button_cancel_set[i];
     button_cancel.addEventListener("click", function(){
       SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",0);
      }, false);
     button_cancel.style.color = "Blue";
   }
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.instrument - exiting "+button_save_set.length+" "+button_cancel_set.length+" "+textarea);
}

SFDCCRUTCH.UICommentPage.replaceNextUpdateDate=function(textarea,new_date)
{
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.replaceNextUpdateDate - entering ["+textarea.value+"] "+new_date);
   var note = textarea.value.replace(/\[Next Update Date:.*\]/,"[Next Update Date: "+new_date+"]");
   textarea.value = note;
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICommentPage.replaceNextUpdateDate - exiting "+note);
   return note;
}


SFDCCRUTCH.UICommentPage.createDatePicker=function (doc,id) {
  
  var scriptcontent;

  SFDCCRUTCH.UI.addLink(doc,"https://code.jquery.com/ui/1.10.4/themes/ui-lightness/jquery-ui.css");

  scriptcontent="https://code.jquery.com/jquery-1.10.2.js";
  SFDCCRUTCH.UI.addScriptToPage(doc,scriptcontent,"src");
  scriptcontent="https://code.jquery.com/ui/1.10.4/jquery-ui.js";
  SFDCCRUTCH.UI.addScriptToPage(doc,scriptcontent,"src");
 
  var weekdays = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.NEXTUPDATE_DAYS_INC_WEEKDAYS, "str", "M-F"); 
  if (weekdays == "M-F")
    scriptcontent="function CrutchCheckDate(d) { if (d.getDay()==6 || d.getDay()==0) return [false,\"ui-datepicker-week-end\",\"Week-end\"]; else return [true,\"\",\"\"];}\n";
  else if (weekdays == "S-T")
    scriptcontent="function CrutchCheckDate(d) { if (d.getDay()==5 || d.getDay()==6) return [false,\"ui-datepicker-week-end\",\"Week-end\"]; else return [true,\"\",\"\"];}\n";
  else scriptcontent=scriptcontent="function CrutchCheckDate(d) { return [true,\"\",\"\"];}\n";
  
  scriptcontent+="$(function() {"+
            "$('#test').datepicker({ changeMonth: true,changeYear: true, yearRange: \"2014:2016\", beforeShowDay: function(d){return CrutchCheckDate(d);},onSelect: function(dateText,inst) {var evt = document.createEvent(\"HTMLEvents\");evt.initEvent(\"change\", false, true);document.getElementById(\"test\").dispatchEvent(evt); } });\n"+     
          "$('#test').datepicker();});\n";


  SFDCCRUTCH.Util.getBrowserWindow().setTimeout(function(){SFDCCRUTCH.UI.addScriptToPage(doc,scriptcontent,"");},2000);
}