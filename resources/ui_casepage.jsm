
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");
Components.utils.import("resource://sfdccrutch/dom.jsm");
Components.utils.import("resource://sfdccrutch/sfdccrutch.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.UICasePage"];

SFDCCRUTCH.UICasePage = {};



SFDCCRUTCH.UICasePage.getCaseComments = function(doc,caseId){
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.getCaseComments - entering "+caseId);
   var commentSet= new Array();
   var div_comments = SFDCCRUTCH.Dom.FindNode(doc,"id",caseId+"_RelatedCommentsList_body");
   var tables = div_comments.getElementsByTagName("table");
   var trs= tables[0].getElementsByTagName("tr");
   for (var i=1;i<trs.length;i++)
   {
      var td_datacell = SFDCCRUTCH.Dom.FindNode(trs[i],"class"," dataCell  ");
      var bs = td_datacell.getElementsByTagName("b");
      var regexp = new RegExp("\([0-9]*\/[0-9]*\/[0-9]* [0-9]*:[0-9]* (PM)?\)");
      var matches = regexp.exec(bs[0].textContent);
      var comment = new SFDCCRUTCH.Comment(trs[i],matches[0]);
      commentSet.push(comment);
      //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.getCaseComments "+comment.date.date);

   }     

   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.getCaseComments - exiting "+commentSet.length);
   return commentSet;
}

SFDCCRUTCH.UICasePage.CreateTrForAttachmentBefore = function(doc,attachment,parent,tr_before){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.UICasePage.CreateTrForAttachmentBefore - entering "+attachment.date+" "+tr_before);

  var tr = doc.createElement("tr");
  parent.insertBefore(tr, tr_before);
  var td1 = doc.createElement("td");
  td1.setAttribute("class","actionColumn");
  tr.appendChild(td1);
  var th = doc.createElement("th");
  //td1.setAttribute("class","actionColumn");
  tr.appendChild(th);
  
  var td2 = doc.createElement("td");
  td2.setAttribute("class"," dataCell  ");
  tr.appendChild(td2);
  
  var b = doc.createElement("b");  
  
  b.textContent = "Attached By:"+attachment.author+" ("+attachment.date.formatMDYandTime()+")";
  b.style.color = "Blue";
  td2.appendChild(b);
  var br = doc.createElement("br");
  td2.appendChild(br);
  var tx1 = doc.createTextNode("File:")
  td2.appendChild(tx1);
  var a = doc.createElement("a");
  a.textContent = attachment.filename;
  a.setAttribute("href","#");
  a.onclick = attachment.onclick;
  td2.appendChild(a);
  var tx2 = doc.createTextNode("  ["+attachment.size+"]")
  td2.appendChild(tx2);
  br = doc.createElement("br");
  td2.appendChild(br);
  var tx1 = doc.createTextNode("Description:"+attachment.description); 
  td2.appendChild(tx1);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.UICasePage.CreateTrForAttachmentBefore - exiting");
  return tr;
}


SFDCCRUTCH.UICasePage.instrumentAttachments = function(doc,caseId){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - entering "+caseId);
  
  var max_attachments = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.MAX_ATTACHMENTS, "int",0);
  var parent = null;
  if (max_attachments !=0)
  {
    var attachmentSet = SFDCCRUTCH.UICasePage.getAttachments(doc,caseId,max_attachments);
    var last_tr = null;
    if (attachmentSet.length != 0)
    {
      var commentSet = SFDCCRUTCH.UICasePage.getCaseComments(doc,caseId);
      var first_tr;
      var comment = null;
      if (commentSet.length != 0)
      {
        first_tr = commentSet[0].tr;
        parent = commentSet[0].tr.parentNode;
        comment = commentSet.shift();
      }
      else
      {
        var div_comments = SFDCCRUTCH.Dom.FindNode(doc,"id",caseId+"_RelatedCommentsList_body");
        parent = div_comments.getElementsByTagName("table")[0];
      }
     
      var commentHasChanged=true;
      if (comment != null) {
        last_tr = comment.tr;
        //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - skipping  "+comment.date.formatMDYandTime());
        //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - skipping  "+comment.date.date);

      }
      while(attachmentSet.length != 0)
      {
        var attachment = attachmentSet.shift();
        //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - processing  "+attachment.date.formatMDYandTime());
        //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - processing  "+attachment.date.date);
        //if (comment != null)
        //   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - "+attachment.isOlder(comment.date));
        
        while(comment != null && attachment.isOlder(comment.date))
        {
           comment = commentSet.shift();
           if (comment != null)
           {
              //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - skipping  "+comment.date.formatMDYandTime());
              //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - skipping  "+comment.date.date);

              commentHasChanged=true;
              last_tr = comment.tr;
           }
        }
        if (comment == null)
        {
           if (last_tr == null)
           {
             last_tr = first_tr;
             last_tr = SFDCCRUTCH.UICasePage.CreateTrForAttachmentBefore(doc,attachment,parent,last_tr);
           }
           else
           {
             last_tr = SFDCCRUTCH.UICasePage.CreateTrForAttachmentBefore(doc,attachment,parent,last_tr.nextSibling);
           }  
        }
        else
        {
          if (commentHasChanged)
            last_tr = SFDCCRUTCH.UICasePage.CreateTrForAttachmentBefore(doc,attachment,parent,last_tr);
           else
            last_tr = SFDCCRUTCH.UICasePage.CreateTrForAttachmentBefore(doc,attachment,parent,last_tr.nextSibling);
        }
        commentHasChanged=false;
      } // end processing all attachments
    }
  }

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - exiting ");
}

SFDCCRUTCH.UICasePage.getAttachments = function(doc,caseId,max_attachments){
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.getAttachments - entering "+caseId+" max="+max_attachments);
   var attachmentSet= new Array(); 
   
   var iframe = SFDCCRUTCH.Dom.FindNode(doc,"id","066600000004YBU");
   if (iframe != null)
   {
      var table = SFDCCRUTCH.Dom.FindNode(iframe.contentWindow.document,"id","j_id0:j_id1:j_id2:j_id140:FileList:j_id213");
      if (table != null)
      {
        var trs= table.getElementsByTagName("tr");
        for (var i=1;i<Math.min(trs.length,max_attachments);i++)
        {
          
          
          var filename_text="";
          var onclick_text = ""; 
          
          var filename_div = SFDCCRUTCH.Dom.FindNode(trs[i],"id","j_id0:j_id1:j_id2:j_id140:FileList:j_id213:"+(i-1).toString()+":j_id251");
          if(filename_div!=null){
            filename_text = filename_div.textContent;
            var as = filename_div.getElementsByTagName("a");
            onclick_text = as[0].onclick; 
          
          }
          
          
          var date_text="";   
          var date_div = SFDCCRUTCH.Dom.FindNode(trs[i],"id","j_id0:j_id1:j_id2:j_id140:FileList:j_id213:"+(i-1).toString()+":customFieldRepeater:0:j_id262");
          if(date_div!=null) date_text = date_div.textContent;
          
          var author_text="";   
          var author_div = SFDCCRUTCH.Dom.FindNode(trs[i],"id","j_id0:j_id1:j_id2:j_id140:FileList:j_id213:"+(i-1).toString()+":customFieldRepeater:1:j_id262");
          if(author_div!=null) author_text = author_div.textContent;
          
          var desc_text="";   
          var desc_div = SFDCCRUTCH.Dom.FindNode(trs[i],"id","j_id0:j_id1:j_id2:j_id140:FileList:j_id213:"+(i-1).toString()+":customFieldRepeater:2:j_id269");
          if(desc_div!=null) desc_text = desc_div.textContent;
          
          var size_text="";   
          var size_div = SFDCCRUTCH.Dom.FindNode(trs[i],"id","j_id0:j_id1:j_id2:j_id140:FileList:j_id213:"+(i-1).toString()+":customFieldRepeater:3:j_id262");
          if(size_div!=null) size_text = size_div.textContent;
          
          var attachment = new SFDCCRUTCH.Attachment(filename_text,size_text,desc_text,date_text,author_text,onclick_text);
          attachmentSet.unshift(attachment);
        }
      }
      else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - can't find table");
   }
   else
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - can't find iframe");
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrumentAttachments - exiting "+caseId+" num_attach="+attachmentSet.length);
   // final sort just in case
   attachmentSet.sort(function(a, b) {
          return b.date.date - a.date.date;
       });
   return attachmentSet;

}

SFDCCRUTCH.UICasePage.collectInfo = function(dom,caseId)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.collectInfo - entering doc="+dom+" "+caseId);

  var caseNumber_text="";
  var severity_text = "";
  var status_text = "";
  var next_case_update_text = "";
  var user_text = "";
  var contactname_text = "";
  var ownerorg_text="";
  var subject_text="";
  var account_text="";
  var endcustomer_text="";
  var supportproduct_text="";
  var actualSWreleasecode_text="";
  
  
  var h2 = SFDCCRUTCH.Dom.FindNode(dom,"class","pageDescription");
  if (h2 == null)
  { 
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.collectInfo - h2 is not found ... user must have been logged out");
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.collectInfo - exiting");
  }
  else caseNumber_text = h2.textContent;
  
  var subject_div = SFDCCRUTCH.Dom.FindNode(dom,"id","cas14_ileinner"); 
  if ( subject_div != null)
      subject_text = SFDCCRUTCH.Dom.Attr(subject_div,"textContent");
  
  var severity_div = SFDCCRUTCH.Dom.FindNode(dom,"id","cas8_ileinner");
  if ( severity_div != null)
  {
      severity_text = SFDCCRUTCH.Dom.Attr(severity_div,"textContent");
  }
  var status_div = SFDCCRUTCH.Dom.FindNode(dom,"id","cas7_ileinner"); 
  if ( status_div != null)
  {
      status_text = SFDCCRUTCH.Dom.Attr(status_div,"textContent");
      
  }
  
  var account_div = SFDCCRUTCH.Dom.FindNode(dom,"id","cas4_ileinner"); 
  if ( account_div != null)
      account_text = SFDCCRUTCH.Dom.Attr(account_div,"textContent");
      
  var ownerorg_div = SFDCCRUTCH.Dom.FindNode(dom,"id","00N60000001qMeS_ileinner"); 
  if ( ownerorg_div != null)
      ownerorg_text = SFDCCRUTCH.Dom.Attr(ownerorg_div,"textContent");

  var endcustomer_div = SFDCCRUTCH.Dom.FindNode(dom,"id","lookup0016000000RxhXf00N60000001fPrf"); 
  if ( endcustomer_div != null)
      endcustomer_text = SFDCCRUTCH.Dom.Attr(endcustomer_div,"textContent");
            
  var supportproduct_div = SFDCCRUTCH.Dom.FindNode(dom,"id","CF00N60000001qP5h_ileinner"); 
  if ( supportproduct_div != null)
      supportproduct_text = SFDCCRUTCH.Dom.Attr(supportproduct_div,"textContent");
      
  var actualSWreleasecode_div = SFDCCRUTCH.Dom.FindNode(dom,"id","00N60000001qMaf_ilecell"); 
  if ( actualSWreleasecode_div != null)
      actualSWreleasecode_text = SFDCCRUTCH.Dom.Attr(actualSWreleasecode_div,"textContent");
  
  var retvals = SFDCCRUTCH.UICasePage.extractLastComment(dom,caseId);

  var info = new SFDCCRUTCH.CasePageInfo(caseId,caseNumber_text,subject_text,severity_text,status_text,null,next_case_update_text,user_text,contactname_text,account_text,ownerorg_text,retvals.dateAndTime,retvals.commentMaker,"");      
  info.setProperty("supportProduct",supportproduct_text);
  info.setProperty("endCustomer",endcustomer_text);
  info.setProperty("actualSoftwareReleasecode",actualSWreleasecode_text);
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.collectInfo - exiting "+caseId+" subject="+subject_text+" supportproduct="+supportproduct_text+" RelSW="+actualSWreleasecode_text+" status="+status_text);

  return info;
}

SFDCCRUTCH.UICasePage.instrument = function(doc,caseId)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrument - entering doc="+doc+" "+caseId);
  var caseNumber_text="";
  var severity_text = "";
  var status_text = "";
  var next_case_update_text = "";
  var user_text = "";
  var contactname_text = "";
  var ownerorg_text="";
  var subject_text="";
  var account_text="";
  
  var h2 = SFDCCRUTCH.Dom.FindNode(doc,"class","pageDescription");
  if (h2 == null)
  { 
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.instrument - h2 is not found ... user must have been logged out");
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrument - exiting");
  }
  else
  { 
      caseNumber_text = h2.textContent;
  
    var button_new = null;
    var div_comments = SFDCCRUTCH.Dom.FindNode(doc,"id",caseId+"_RelatedCommentsList");
    if (div_comments != null)
      button_new = SFDCCRUTCH.Dom.FindNode(div_comments,"name","newComment");
    else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.instrument - div_comments is not found");


    if (button_new != null)
    {
      var new_td = doc.createElement("td");
      button_get_notified = SFDCCRUTCH.UI.createSubscribeButton(doc,caseId,"input");  
      new_td.appendChild(button_get_notified);
      button_new.parentNode.parentNode.insertBefore(new_td, button_new.parentNode.nextSibling);
    }
    else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.instrument - button_new is not found");
  
  
    var user_div = SFDCCRUTCH.Dom.FindNode(doc,"id","globalHeaderNameMink");
    if (user_div != null)
    {
      var spans = user_div.getElementsByTagName("span");
      
      user_text = user_div.textContent;
      SFDCCRUTCH.Pref.set(SFDCCRUTCH.Pref.USER, "str",user_text);
      SFDCCRUTCH.user = user_text;
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICasePage.instrument - user_div class="+user_div.className);
    }
    else
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.UICasePage.instrument - user_div is not found");
  
  
  
    var next_case_update_div = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000002hsjn_ileinner");
    if (next_case_update_div != null)
      next_case_update_text = next_case_update_div.textContent;
    else
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.instrument - next_case_update_div is not found");
  
  
    var severity_div = SFDCCRUTCH.Dom.FindNode(doc,"id","cas8_ileinner");
    if ( severity_div != null)
    {
      severity_text = SFDCCRUTCH.Dom.Attr(severity_div,"textContent");
      doc.SFDCCRUTCHseverity=severity_text;
    }
  
    var status_div = SFDCCRUTCH.Dom.FindNode(doc,"id","cas7_ileinner"); 
    if ( status_div != null)
    {
      status_text = SFDCCRUTCH.Dom.Attr(status_div,"textContent");
      if (status_text == "Closed Resolved" || status_text == "Closed Unresolved")
      {
        SFDCCRUTCH.alarmManager._removeCaseAlarm(caseId);
        SFDCCRUTCH.alarmManager.save();
        //SFDCCRUTCH.Util.getBrowserWindow().alert("Case ["+caseId+"] is now closed");
      }
    }
    var contactname_div = SFDCCRUTCH.Dom.FindNode(doc,"id","cas3_ileinner"); 
    if ( contactname_div != null)
      contactname_text = SFDCCRUTCH.Dom.Attr(contactname_div,"textContent");

    var account_div = SFDCCRUTCH.Dom.FindNode(doc,"id","cas4_ileinner"); 
    if ( account_div != null)
      account_text = SFDCCRUTCH.Dom.Attr(account_div,"textContent");
    else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.instrument - account div is not found");


    var ownerorg_div = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000001qMeS_ileinner"); 
    if ( ownerorg_div != null)
      ownerorg_text = SFDCCRUTCH.Dom.Attr(ownerorg_div,"textContent");
    var subject_div = SFDCCRUTCH.Dom.FindNode(doc,"id","cas14_ileinner"); 
    if ( subject_div != null)
      subject_text = SFDCCRUTCH.Dom.Attr(subject_div,"textContent");
    if (h2 != null)
    {
      h2.style.color = "Blue";
      h2.textContent += " "+SFDCCRUTCH.Util.shortSeverity(severity_text)+" "+subject_text;
      h2.setAttribute("title",account_text);
    }
  
  // interface mandatory
    var gts_customer_interface_mandatory = false;
    var img = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000001sbpP_chkbox"); 
    if ( img != null) gts_customer_interface_mandatory = (img.getAttribute("title") != "Not Checked");
   
  // new in 1.2.8, implement case update date update on save button
    var button_save_set = SFDCCRUTCH.Dom.FindAllNodes(doc,"name","inlineEditSave");
    var button_save_onclick=null;

    for (var i=0;i<button_save_set.length;i++)
    {
      button_save = button_save_set[i];
      button_save_onclick = button_save.onclick;
      button_save.onclick=function(){return true;};
      button_save.addEventListener("click", function(){
          SFDCCRUTCH.UICasePage.save(this,doc,caseId);
        }, false);
      button_save.style.color = "Blue";
    }

    SFDCCRUTCH.UICasePage.instrumentAttachments(doc,caseId) ;
  
    var retvals = SFDCCRUTCH.UICasePage.extractLastComment(doc,caseId);

    if (SFDCCRUTCH.CasePageInformationSet[caseId])
       SFDCCRUTCH.CasePageInformationSet[caseId].update(subject_text,severity_text,status_text,button_new,next_case_update_text,user_text,contactname_text,account_text,ownerorg_text,retvals.dateAndTime,retvals.commentMaker,gts_customer_interface_mandatory);
    else
       SFDCCRUTCH.CasePageInformationSet[caseId] = new SFDCCRUTCH.CasePageInfo(caseId,caseNumber_text,subject_text,severity_text,status_text,button_new,next_case_update_text,user_text,contactname_text,account_text,ownerorg_text,retvals.dateAndTime,retvals.commentMaker,gts_customer_interface_mandatory);      

    if (button_save_onclick != null) SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("caseButtonSaveOnclick",button_save_onclick);

    if (SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.LIGHT_CASEDISPLAY, "bool",false))
      SFDCCRUTCH.UICasePage.applyLightModeDisplay(doc,caseId);

    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.instrument - exiting caseNumber_text ="+caseNumber_text+
            " user_text ="+user_text+" next_case_update_text ="+next_case_update_text+" severity ="+severity_text+
            " status ="+status_text+" contactname ="+contactname_text+" account="+account_text+" button_new ="+button_new+" ownerorg ="+ownerorg_text+" subject ="+subject_text+" GTS ci mand="+gts_customer_interface_mandatory);
  }
}

SFDCCRUTCH.UICasePage.extractLastComment=function(dom,caseId){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.extractLastComment entering "+caseId+" dom="+dom);
	//SFDCCRUTCH.Dom.prettyPrint(dom);
	var retVals = { dateAndTime: "", commentMaker: "" , result: 0 };

	var dateAndTimeText="";
	var commentMaker="";
  var h2 = SFDCCRUTCH.Dom.FindNode(dom,"class","pageDescription");
  if (h2 != null)
  {

    retVals.result=1;
    var div_comments = SFDCCRUTCH.Dom.FindNode(dom,"id",caseId+"_RelatedCommentsList_body");
    if (div_comments != null)
    {
    
      var tables = div_comments.getElementsByTagName("table");
      if (tables != null)
      {

        var trs= tables[0].getElementsByTagName("tr");
        // loop over first element, min is used to detect a table that has just a header
        // fixes bug in 1.2.1 when no comments have ever been inserted
        for (var i=1;i<Math.min(trs.length,2);i++)
        {
          var td_datacell = SFDCCRUTCH.Dom.FindNode(trs[i],"class"," dataCell  ");
          // extract date and time
          var bs = td_datacell.getElementsByTagName("b");
          var regexp = new RegExp("\([0-9]*\/[0-9]*\/[0-9]* [0-9]*:[0-9]* (PM)?\)");
          var matches = regexp.exec(bs[0].textContent);
          if (matches != null) dateAndTimeText = matches[0];
          // extract author
          var as= bs[0].getElementsByTagName("a");
          if (as != null && as.length !=0)
            commentMaker = as[0].textContent;
        }
        retVals.dateAndTime = dateAndTimeText; 
        retVals.commentMaker = commentMaker; 
        retVals.result = 1;
      }
      else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.extractLastComment - no comments yet in case "+caseId);
    }
    else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.extractLastComment - div_comments is NULL !");
  }
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.extractLastComment exiting dAt="+dateAndTimeText+" cm="+commentMaker);
	return retVals;
}

SFDCCRUTCH.UICasePage.UpdateOrgWhenModifiedFromComment = function(doc,caseId,changeOrg,changeNextUpdateDate){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.UpdateOrgWhenModifiedFromComment - entering doc="+doc+" "+caseId+" change org="+changeOrg+" change update date="+changeNextUpdateDate);
  var evt = doc.createEvent("MouseEvents");  
  var td1;
   
  if (changeOrg && (td1 = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000002hsjn_ilecell")) != null)
  {
    var td_ownerOrg = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000001qMeS_ileinner");
    if (td_ownerOrg != null)
    {
      td_ownerOrg.textContent = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganizationNew");
      evt.initEvent("dblclick", true, false);
      var ilecell = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000001qMeS_ilecell");
      if (ilecell != null)
      {
        ilecell.dispatchEvent(evt); 
        SFDCCRUTCH.Util.getBrowserWindow().setTimeout(function(){
        
        
                var td_div = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000001qMeS_ileinner");
                if (td_div != null)
                {
                  td_div.textContent = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganizationNew");
                
                  var td_edit = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000001qMeS_ileinneredit");
                  if (td_edit != null)
                  {
                    var select = SFDCCRUTCH.Dom.FindNode(td_edit,"id","00N60000001qMeS");
                    if (select != null)
                    {
                      select.value = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganizationNew");
                    }
                    else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.UpdateOrgWhenModifiedFromComment select not found !");
                  }
                  else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.UpdateOrgWhenModifiedFromComment td_edit not found !");
                }
                // chain next update date update
                if (changeNextUpdateDate)
                  SFDCCRUTCH.UICasePage.UpdateNextUpdateDateWhenModifiedFromComment(doc,caseId,changeOrg,changeNextUpdateDate);
                else
                {
                  if (SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonSubStatus") == SFDCCRUTCH.EmailToBeSent)
                      SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",SFDCCRUTCH.LaunchEmailEdition);
                  SFDCCRUTCH.UICasePage.triggerSave(doc,caseId);
                }
              },700);
      }
      else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.UpdateOrgWhenModifiedFromComment ilecell not found !");
    }
    else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.UpdateOrgWhenModifiedFromComment td_ownerOrg is null !");
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.UpdateOrgWhenModifiedFromComment - entering doc="+doc+" "+caseId+" nupd="+SFDCCRUTCH.CasePageInformationSet[caseId].nextUpdateDate+ " org="+SFDCCRUTCH.CasePageInformationSet[caseId].ownerOrganization);
}


SFDCCRUTCH.UICasePage.UpdateNextUpdateDateWhenModifiedFromComment = function(doc,caseId,changeOrg,changeNextUpdateDate)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.UpdateNextUpdateDateWhenModifiedFromComment - entering doc="+doc+" "+caseId+" change org="+changeOrg+" change update date="+changeNextUpdateDate);
  var evt = doc.createEvent("MouseEvents");  
  // Update nextUpdateDate field in page
  evt.initEvent("dblclick", true, false);  
  var td1 = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000002hsjn_ilecell");
  if (td1 != null)
  {
    td1.dispatchEvent(evt); 
    SFDCCRUTCH.Util.getBrowserWindow().setTimeout(function(){     
        var input = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000002hsjn");
        if (input != null)
        {
               //input.setAttribute("value","");
               //SFDCCRUTCH.UI.simulateKeyEvent(doc,input,SFDCCRUTCH.CasePageInformationSet[caseId].nextUpdateDate);
               input.value = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDateNew");
        }
        else
          SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.UpdateNextUpdateDateWhenModifiedFromComment - input is not found");
        var td = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000002hsjn_ileinner");
        if (td != null)
             td.textContent= SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDateNew");
        else
             SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.UpdateNextUpdateDateWhenModifiedFromComment - td is not found");
        if (SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonSubStatus") == SFDCCRUTCH.EmailToBeSent)
          SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",SFDCCRUTCH.LaunchEmailEdition);
        SFDCCRUTCH.UICasePage.triggerSave(doc,caseId);
    },1000); 
  }
  else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.UpdateNextUpdateDateWhenModifiedFromComment - td is not found : id=00N60000002hsjn_ilecell");
} 
   
SFDCCRUTCH.UICasePage.save = function(button_save,doc,caseId){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.save - entering doc="+doc+" caseId"+caseId);

  button_save.onclick = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("caseButtonSaveOnclick");
    //SFDCCRUTCH.Util.getBrowserWindow().setTimeout(function(){ button_save.onclick();},200); 
  
  SFDCCRUTCH.Util.getBrowserWindow().setTimeout(function(){
        button_save.focus();
        var nextUpdateDateNew = "";
        var next_case_update_div = SFDCCRUTCH.Dom.FindNode(doc,"id","00N60000002hsjn_ileinner");
        if (next_case_update_div != null)
            nextUpdateDateNew = next_case_update_div.textContent;
        else
          SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.save - next_case_update_div is not found");

        SFDCCRUTCH.alarmManager._addCaseAlarm(caseId,
                SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("caseNumber"),
                "https://genband.my.salesforce.com/"+caseId,
                SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("subject"),
                nextUpdateDateNew,
                SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("severity")); 
        button_save.onclick();},200); 
              
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.save - exiting");

}

SFDCCRUTCH.UICasePage.triggerSave = function(doc,caseId){
  var save_button = SFDCCRUTCH.Dom.FindNode(doc,"name","inlineEditSave");
  if (save_button != null)
  {
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.triggerSave - save_button name="+SFDCCRUTCH.Dom.Attr(save_button,"name"));
    SFDCCRUTCH.Util.getBrowserWindow().focus();
    SFDCCRUTCH.UICasePage.save(save_button,doc,caseId);
  }
  else
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UICasePage.triggerSave - save_button is not found");
}



SFDCCRUTCH.UICasePage.AddInfoModifiedFromComment = function(doc,caseId){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.AddInfoModifiedFromComment - entering doc="+doc+" "+caseId+" org old="+SFDCCRUTCH.CasePageInformationSet[caseId].ownerOrganization+ " new="+SFDCCRUTCH.CasePageInformationSet[caseId].ownerOrganizationNew);
  SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",0);
  
 var changedNextUpdateDate =  (SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDate") != SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("nextUpdateDateNew"));
 var changedOrg =  (SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganization") != SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganizationNew"));
 
 if (changedOrg) SFDCCRUTCH.UICasePage.UpdateOrgWhenModifiedFromComment(doc,caseId,changedOrg,changedNextUpdateDate);
 else if (changedNextUpdateDate) SFDCCRUTCH.UICasePage.UpdateNextUpdateDateWhenModifiedFromComment(doc,caseId,changedOrg,changedNextUpdateDate);     

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.AddInfoModifiedFromComment - exiting");
  return changedNextUpdateDate || changedNextUpdateDate;

}


SFDCCRUTCH.UICasePage.applyLightModeDisplay = function(doc,caseId) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.applyLightModeDisplay - entering doc="+doc+" "+caseId);
  
  // TL9000 Information
  SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000003FfFA_ep");
  // RCA (Root Cause Analysis)
  SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000003FfFB_ep");
  // RCA Related Case Information
  SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000003Gjn7_ep");
  
  // RCA Description Information
  SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000003GPm8_ep");
  // Service Disruption Information
  SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000003FfFE_ep");
  // Outage Times
  SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000003FgUA_ep");
  // System Information
  SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000003FgHK_ep");
  // Case Files
  //SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000004UODf_ep");
  // Legacy Attachments 
  SFDCCRUTCH.UICasePage.hideSubSection(doc,"head_01B60000005RR2s_ep");

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.applyLightModeDisplay - exiting");
}

SFDCCRUTCH.UICasePage.hideSubSection=function(doc,id) {
  var div = SFDCCRUTCH.Dom.FindNode(doc,"id",id);
  if (div != null)
  {
    div.style.display = "none";
    var pbSubsection = div.nextSibling;
    if (pbSubsection.className =="pbSubsection")
      pbSubsection.style.display = "none";
  }
 
}

SFDCCRUTCH.UICasePage.launchEmailEdition = function(doc,caseId) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.launchEmailEdition - entering");    

  var button = SFDCCRUTCH.Dom.FindNode(doc,"value","Send an Email");
  if (button != null)
  {
    //button.onclick();
    var evt = doc.createEvent("MouseEvents");  
    evt.initEvent("click", true, false);  
                  button.dispatchEvent(evt); 
  }
  else
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"myListener can't find button for email launch");
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UICasePage.launchEmailEdition - exiting");    
  return (button != null);
}

