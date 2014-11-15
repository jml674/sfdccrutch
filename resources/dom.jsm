

Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/io.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.Dom"];

SFDCCRUTCH.Dom = {};

SFDCCRUTCH.Dom.Node =
      {
        ELEMENT_NODE                :  1,
        ATTRIBUTE_NODE              :  2,
        TEXT_NODE                   :  3,
        CDATA_SECTION_NODE          :  4,
        ENTITY_REFERENCE_NODE       :  5,
        ENTITY_NODE                 :  6,
        PROCESSING_INSTRUCTION_NODE :  7,
        COMMENT_NODE                :  8,
        DOCUMENT_NODE               :  9,
        DOCUMENT_TYPE_NODE          : 10,
        DOCUMENT_FRAGMENT_NODE      : 11,
        NOTATION_NODE               : 12
      };


SFDCCRUTCH.Dom.Attr=function(node,name){
  if (name =="textContent")
  {
    if (node.childNodes.length > 0)
      return node.textContent;
    else return node.parentNode.textContent;
  }
  else if (name =="tagName")
  {
        return node.tagName;
  }
  else if (name == "innerHTML")
  {
        return node.innerHTML;
  }
  else
  {
    if (node.getAttributeNode(name))
      return node.getAttributeNode(name).value;
    else return "";
  }
}

SFDCCRUTCH.Dom.AttrMatches=function(node,name,pattern){
  if (SFDCCRUTCH.Dom.Attr(node,name) != "")
  {
    var value = SFDCCRUTCH.Dom.Attr(node,name);
    var regexp = new RegExp(pattern);
    return value.match(regexp);
  }
  else return 0;
}

SFDCCRUTCH.Dom.testAttr=function(node,name,value){
  if (value.substr(0,1)=="/")
  {
    return SFDCCRUTCH.Dom.AttrMatches(node,name,value.substr(1,value.length-2));
  }
  else
    return SFDCCRUTCH.Dom.Attr(node,name) == value;
}

SFDCCRUTCH.Dom.FindNodeStart=function(domnode,attr,value,n,nodeset)
{
  node = null;
  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"child#= "+domnode.childNodes.length);

  for(var i=0;i<domnode.childNodes.length;i++)
  {

    var child = domnode.childNodes[i];
    if (child.nodeType != SFDCCRUTCH.Dom.Node.ELEMENT_NODE)
    {
      //      log_msg(tab($n)."Node ".$child->nodeName);
    }
    else
    {
      //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"Node "+child.nodeName+" "+attr+"="+SFDCCRUTCH.Dom.Attr(child,attr)+" class="+SFDCCRUTCH.Dom.Attr(child,"class"));
      if (SFDCCRUTCH.Dom.testAttr(child,attr,value))
      {
        //        log_msg("Found Node ".$child->nodeName." value attr=".$value);
        //        log_msg("Found Node ".$child->nodeName." value attr=".Attr($child,$attr));
        if (nodeset == null)
          return child;
        else
          nodeset.push(child);
      }
      if ((node = SFDCCRUTCH.Dom.FindNodeStart(child,attr,value,n+1,nodeset)) != null) return node;
    }
  }
  return node;
}

SFDCCRUTCH.Dom.FindNode = function(domnode,attr,value){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.Dom.FindNode entering "+domnode+" "+attr+" "+value);
  var node = SFDCCRUTCH.Dom.FindNodeStart(domnode,attr,value,0,null);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.Dom.FindNode exiting ");

  return node;
}

SFDCCRUTCH.Dom.FindAllNodes = function(domnode,attr,value){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Dom.FindNode entering "+domnode.tagName+" "+attr+" "+value);
  var nodes = [];
  SFDCCRUTCH.Dom.FindNodeStart(domnode,attr,value,0,nodes);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Dom.FindNode exiting ");

  return nodes;
}

SFDCCRUTCH.Dom.ApplyToAllNodes=function(domnode,cb)
{
  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Dom.findElement applying callback to "+domnode.tagname);  
  cb(domnode);
  for(var i=0;i<domnode.childNodes.length;i++)
  {

    var child = domnode.childNodes[i];
    if (child.nodeType == SFDCCRUTCH.Dom.Node.ELEMENT_NODE)
    
    {
      SFDCCRUTCH.Dom.ApplyToAllNodes(child,cb);
    }
  }
}

SFDCCRUTCH.Dom.findElement=function(dom,path)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Dom.findElement entering "+dom);
  for(var i=0;i<path.nodes.length;i++)
  {
    var node = path.nodes[i];
    if (dom != null)
      dom = SFDCCRUTCH.Dom.findElementByTagAndIndex(dom,node);
    else
    {
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.Dom.findElement dom is null ! "+i);
      break;
    }
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Dom.findElement exiting");
  return dom;
}

SFDCCRUTCH.Dom.findElementByTagAndIndex=function(dom,node) 
{
  var index = 0;
  var child=null;
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Dom.findElementByTagAndIndex looking for "+node.tagName+node.index);

  for(var i=0;i<dom.childNodes.length;i++)
  {
      child = dom.childNodes[i];
      if (child.tagName == node.tagName)
      {
        if (index == node.index) break;
        index++;
      }
  }  
   if (child == null)
  {
    SFDCCRUTCH.Dom.prettyPrint(dom.parentNode);
  } 
  return child;
}
SFDCCRUTCH.Dom.prettyPrint=function(dom) 
{
  var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"]
                            .createInstance(Components.interfaces.nsIDOMSerializer);  
  var str = serializer.serializeToString( dom );
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Dom.prettyPrint: "+str);
}

