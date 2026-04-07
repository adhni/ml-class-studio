// _____         _   __     ___                  _ ____  
//|_   _|_ _ ___| | _\ \   / (_) _____      __  | / ___| 
//  | |/ _` / __| |/ /\ \ / /| |/ _ \ \ /\ / /  | \___ \ 
//  | | (_| \__ \   <  \ V / | |  __/\ V  V / |_| |___) |
//  |_|\__,_|___/_|\_\  \_/  |_|\___| \_/\_(_)___/|____/
//
// Auteur: Shi Qiao Yu
// Thoran Inc.

var timerFilter;
/** Retourne le gridview, les paramètres sont optionnels
argument[0] = page courante
argument[1] = ['column name','asc/desc']
*/
function getGridView() {
  //le query string de taskview.aspx
  var queryStr = document.getElementById('idQueryString').value;
  //option filter pour max items par page

  var maxItemPage = document.getElementById('idDDLMaxItemPage').value;
  var addToSort = document.getElementById('idAddSort').value;
  var currentPage = '1';
  var sortorder;

  if (arguments[0] != undefined) {
    //lire la page courante dans les paramètres de getGridView
    currentPage = arguments[0];
  }
  else {
    //sinon, la page courante est 1 par défaut
    currentPage = '1';
  }

  if (arguments[1] != undefined) {
    //lire le sort column dans les paramètres de getGridView
    sortorder = arguments[1];
    //à noter, que le hidden sort direction sera toujours à l'inverse du onclick=getGridView(1,['column name',.... de la colonne.
    //le hidden sort direction affiche la direction présente, tandis que le onclick représente la direction qu'on veut avoir
    document.getElementById('idCurrentSortColumn').value = arguments[1][0];
    document.getElementById('idCurrentSortDirection').value = arguments[1][1];
  }
  else {    
    //sinon, lire les hidden paramètres
    sortorder = new Array(2);
    sortorder[0] = document.getElementById('idCurrentSortColumn').value;
    sortorder[1] = document.getElementById('idCurrentSortDirection').value;
  }
  
  //CQ v3.3.3.1003: ajout Response Rate: maintenant 10 filters array for 9 columns
  var filtervalues = new Array(10);

  //initialize array to empty string
  for (var i = 0; i < filtervalues.length; i++) {
    filtervalues[i] = "";
  }
    
  //on ne filtre pas la colonne Link et Alert pour le moment, les columns index sont fixes pour qu'on puisse se retrouver
  if (document.getElementById('idDDLCol1')) filtervalues[0] = document.getElementById('idDDLCol1').value;
  if (document.getElementById('idDDLCol2')) filtervalues[1] = document.getElementById('idDDLCol2').value;
  if (document.getElementById('idDDLCol3')) filtervalues[2] = document.getElementById('idDDLCol3').value;
  if (document.getElementById('idDDLCol4')) filtervalues[3] = document.getElementById('idDDLCol4').value;
  //if (document.getElementById('idDDLCol5')) filtervalues[4] = document.getElementById('idDDLCol5').value;
  if (document.getElementById('idDDLColCat')) filtervalues[5] = document.getElementById('idDDLColCat').value;
  if (document.getElementById('idDDLColSubCat')) filtervalues[6] = document.getElementById('idDDLColSubCat').value;
  if (document.getElementById('idDDLColGradeBlocking')) filtervalues[7] = document.getElementById('idDDLColGradeBlocking').value;
  if (document.getElementById('idDDLColAlert')) filtervalues[8] = document.getElementById('idDDLColAlert').value;
  if (document.getElementById('idDDLColResponseRate')) filtervalues[9] = document.getElementById('idDDLColResponseRate').value;

  //Search
  var searchstr = "";

  //si le texte du textfield search n'est pas le tag BPI du textfield search, on lit le texte du textfield search
  if (document.getElementById('idSearchKey').value != document.getElementById('idBlockSearchBy').value) {
    searchstr = document.getElementById('idSearchKey').value;
  }
  else {
    searchstr = "";
  }

  WaitMachineStart();
  WaitMachineProcessAdd(___WaitLoadingGridView___);
  WSBackEndTaskView.GetTaskGridView(queryStr, maxItemPage, currentPage, sortorder, filtervalues, searchstr, addToSort, ___ongetGridView, __ws_OnError);  
}

/** au retour du getGridView */
function ___ongetGridView(result) {

  WaitMachineProcessRemove(___WaitLoadingGridView___);   //Enlever les processes du waitMachine

  if (result[0] == "error" && result[1] == "error") {
    gotoURL('error500.aspx?errormessage=' + result[2]);
  }
  else {
    document.getElementById('idBlockGridView').innerHTML = result[0];
    document.getElementById('blockGridViewPagingLabel').innerHTML = result[1];
    document.getElementById('blockGridViewPaging').innerHTML = result[2];
    }
    publishIframeHeight();
}

/** Affiche ou cache le block description */
function toggleBlockDescription() {
  var block = document.getElementById('idBlockDescription');

  if (block.style.display == 'none') {
    block.style.display = 'block';
    document.getElementById('idBlockTitleOpenBracket').innerHTML = "[-] ";
    publishIframeHeight();
  }
  else {
    block.style.display = 'none';
    document.getElementById('idBlockTitleOpenBracket').innerHTML = "[+] ";
    publishIframeHeight();
  }
}

/** Affiche ou cache les filters options */
function toggleFiltersOptions() {
  var block = document.getElementById('idBlockFilterView');

  if (block.style.display == 'none') {
    block.style.display = 'block';
    document.getElementById('idFiltersOptionsOpenBracket').innerHTML = "[-] ";
    publishIframeHeight();
  }
  else {
    block.style.display = 'none';
    document.getElementById('idFiltersOptionsOpenBracket').innerHTML = "[+] ";
    publishIframeHeight();
  }
}

/** Affiche la fenetre des messages alerts */
/** [Modifié par Chanh T.Do - 2012.03.01] Ajustement pour que les Alert Messages s'affiche correctement 
    en utilisant un CSS commun pour les sub panels */
function showAlert(elem) {
  //si le alertbox n'est pas déjà ouverte, on ouvre un alertbox
  var eAlertBox = document.getElementById('mPanelDiv');
  showModalBeforeElementId(eAlertBox.id, '0.2');
  eAlertBox.style.visibility = 'hidden';
  unhideElementById(eAlertBox.id);

  //on va chercher tous les éléments qui sont dans le même row que l'alert 
  var arr = elem.parentNode.parentNode.getElementsByTagName('td');
   
  var rowStr = "<table id='clickedTaskId' class='gListSub' border='0' cellpadding='4' cellspacing='0' style='margin-top:0px;'>";
  rowStr += "<tr  class='gDataSub'>";

  for (var i = 0; i < arr.length; i++) {
    //si c'est le dernier element, on s'assure pour qu'il n'a pas un border-right en trop
    if (i == (arr.length - 1)) {
        //si ce n'est pas le Alert
      if (arr[i] != elem.parentNode) {
          rowStr += "<td style='padding:8px;'>" + arr[i].innerHTML + "</td>";
      }
      else {
          rowStr += "<td style='padding:8px;'>[ ! ]</td>";  //CQ modif BPI 3.2: je fais apparaitre le symbole du alert pour faciliter le code
      }
    }
    else {
      if (arr[i] != elem.parentNode) {
          rowStr += "<td style='border-right:2px solid #aaa; padding:8px;'>" + arr[i].innerHTML + "</td>";
      }
      else {
          rowStr += "<td style='border-right:2px solid #aaa; padding:8px;'>[ ! ]</td>";
      }
    }
  }
  
  rowStr += "</tr></table>";
  
  document.getElementById('tableRowContent').innerHTML = rowStr;
  document.getElementById('msgTitleId').innerHTML = elem.getElementsByTagName('span')[0].innerHTML;
  document.getElementById('msgContent').innerHTML = elem.getElementsByTagName('span')[1].innerHTML;

  //Vérifier la hauteur du subPanel (max 400px). Si plus que 400, on ajoute un scroll
  /*if (document.getElementById('subPanelScroll').offsetHeight > 300) {
      document.getElementById('subPanelScroll').style.height = '300px';
  }*/
  eAlertBox.style.visibility = 'visible';
}

    
/** Quand on clique dans le textfield du search */    
function txtSearchOnFocus(html_element, strText){
  if (html_element.value == strText) { html_element.value = ""; html_element.style.color = "black"; }
}

/** Quand on clique à l'extérieur du textfield search */
function setTextFieldValue(html_element, strText){
  if (html_element.value == "") { html_element.value = strText; html_element.style.color = "#aaa"; }
}

/** Quand on écrit dans le textfield search */
function searchKeyPressEvent(e) {
  //si on fait "enter", on affiche le gridview
  if (e.keyCode == 13) { getGridView();return false; }
  else { return e.keyCode }
}