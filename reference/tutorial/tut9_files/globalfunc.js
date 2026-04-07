//          ________
//          |/\/\/\|
//          | o o  |
//-----oOOO---(_---OOOo---------------------------------------------------------------------------------------
//
// Auteur      : Chanh T.Do [Thoransoft - 2008.04.08]
// Description : fichier contenant les fonctions globales du site de la Centrale ATR
// JScript File
//------------------------------------------------------------------------------------------------------------

//CQ 3.5 je l'enleve parce que le path sera toujours a cette valeur-la. Cette variable est setter dans les master pages
//var _basePathGlobal = "/";

/* BPIPlatform, BPIModules, BPINative */
var PlatformSystem = { Blackboard: { value: 0, name: "Blackboard" }, Moodle: { value: 1, name: "Moodle" }, Sharepoint: { value: 2, name: "Sharepoint" }, WebApps: { value: 3, name: "WebApps" }, Canvas: { value: 4, name: "Canvas" }, Facebook: { value: 5, name: "Facebook" }, Desire2Learn: { value: 6, name: "Desire2Learn" }, Sakai: { value: 6, name: "Sakai"} };
var ModuleType = { Tasks: { value: 0, name: "Tasks" }, Reports: { value: 1, name: "Reports" }, Feedback: { value: 2, name: "Feedback" }, SubjectManagement: { value: 3, name: "SubjectManagement" }, Launcher: { value: 4, name: "Launcher" }, EnhancedCourse: { value: 5, name: "EnhancedCourse"} };
var NativeOrWebApp = { Webapp: { value: 0, name: "Webapp" }, Native: { value: 1, name: "Native"} };

/**
* @fileOverview
globalfunc.js [JScript File]: <br>
Scripts de fonctions globales utilisées dans le site de l'ATR <br>
@author: Chanh T.Do [www.thoransoft.com - 2008.04.08] <br>
Version 1.0 */

/** Fonction permettant de précharger les images en javascript.<br>
Retourne undefined s'il ne trouve pas l'objet.
@param {array} arguments - Vecteur contenant les images à charger
@return vecteur des images qui ont été pré-chargées
@type array */
function preloadImg() {
    var vImg = new Array();   //Initialiser le tableau d'image
    if (document.images)      //Vérifier s'il y a des images dans le documents
    {
        //Boucler dans le array des arguments pour pré-charger les images
        for (var i = 0; i < arguments.length; i++) {
            vImg[i] = new Image();
            vImg[i].src = arguments[i];
        }
        return vImg;    //Retourner le tableau d'image préchargée
    }
}


/* IndexOf pour array */
/* provient de: http://www.tutorialspoint.com/javascript/array_indexof.htm */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
          this[from] === elt)
                return from;
        }
        return -1;
    };
}


/** Fonction permettant de choisir une image au hasard.
Prend un tableau d'image en entrée et retourne une seule image choisie au hasard. <br>
<b>Note</b>: retourne undefined s'il ne trouve pas l'objet.
@param {array} vImg - Vecteur contenant les ID des images dont on voudrait prendre une au hasard
@return ID de l'images choisie au hasard
@type string */
function getRandomImg(vImg) {
    var borne_max = vImg.length;  //Borne maximum pour le random

    if (borne_max > 0)  //Générer un nombre
    {
        return vImg[Math.floor(Math.random() * borne_max)];
    }
}


/** Fonction permettant de colorer les couleur du grid lorsqu'on passe la souris dessus. <br>
@param {object} element - Element à colorer (tablecells)
@param {string} oGrid - ID de la grid en cours de traitement */
function setMouseOverColor(element, oGrid) {
    if (!document.getElementById(oGrid).disabled) {
        oldgridSelectedColor = element.style.backgroundColor;
        element.style.backgroundColor = '#f6f6f8';
        element.style.cursor = 'pointer';
    }
}


/** Fonction permettant de décolorer les couleur du grid lorsqu'on passe la souris dessus. <br>
@param {object} element - Element à colorer (tablecells)
@param {string} oGrid - ID de la grid en cours de traitement */
function setMouseOutColor(element, oGrid) {
    if (!document.getElementById(oGrid).disabled) {
        element.style.backgroundColor = oldgridSelectedColor;
    }
}


/** Fonction permettant de générer un nombre au hasard.
@param {int} lbound - Valeur de la borne de début
@param {int} ubound - Valeur de la borne de fin 
@return Nombre au hasard (integer arrondi)
@type int */
function getRandomNum(lbound, ubound) {
    return (Math.floor(Math.random() * (ubound - lbound)) + lbound);
}


/** Fonction permettant de générer des caractères au hasard.
@param {bool} number - Mettre à true si on veut obtenir des chiffres dans la génération (0123456789)
@param {bool} lower - Mettre à true si on veut obtenir des caractères minuscules (abcdefghijklmnopqrstuvwxyz)
@param {bool} upper - Mettre à true si on veut obtenir des caractères majuscule (ABCDEFGHIJKLMNOPQRSTUVWXYZ)
@param {bool} other - Mettre à true si on veut obtenir les caractères spéciaux (`~!@#$%^&*()-_=+[{]}\\|;:'\",<.>/? )
@param {string} extra - Contient un chaîne de caractères extra que l'utilisateur peut définir
@return Le caractère générés au hasard
@type char */
function getRandomChar(number, lower, upper, other, extra) {
    var numberChars = "0123456789";
    var lowerChars = "abcdefghijklmnopqrstuvwxyz";
    var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var otherChars = "`~!@#$%^&*()-_=+[{]}\\|;:'\",<.>/? ";
    var charSet = extra;

    if (number) { charSet += numberChars; }
    if (lower) { charSet += lowerChars; }
    if (upper) { charSet += upperChars; }
    if (other) { charSet += otherChars; }
    return charSet.charAt(getRandomNum(0, charSet.length));
}


//Fonction permettant de générer une chaîne de caractère aux hasard (peut être utilisée pour un password, ID etc...)
function getRandomString(length, extraChars, firstNumber, firstLower, firstUpper, firstOther,
                         latterNumber, latterLower, latterUpper, latterOther) {
    var rc = "";
    if (length > 0) { rc = rc + getRandomChar(firstNumber, firstLower, firstUpper, firstOther, extraChars); }

    for (var idx = 1; idx < length; ++idx)
    { rc = rc + getRandomChar(latterNumber, latterLower, latterUpper, latterOther, extraChars); }

    return rc;
}


//Fonction pour enlever les CRLF d'une chaîne de caractère
function rmCRLF(strHTML) {
    var newHTML = "";

    //Replace méthode ne fonctionne pas. Il faut le faire manuellement.
    for (var i = 0; i < strHTML.length; i++) {
        carac = strHTML.substr(i, 1);
        if ((carac != "\n") && (carac != "\r")) { newHTML += carac; }
    }

    return newHTML;
}


//Fonction pour protéger un caractère avant l'enregistrement à la BD
//Retourne la string protégée.
function protectString(carToProtect, strIn) {
    var strOut = "";

    for (var i = 0; i < strIn.length; i++) {
        if (strIn.substr(i, 1) == carToProtect) { strOut += "\\" + carToProtect; }
        else { strOut += strIn.substr(i, 1); }
    }

    return strOut
}

//+--------------------------------------------------------------------
//| S e t _ C o o k i e 
//|
//| Cette fonction fera la creation d'un cookie.
//|
//+--------------------------------------------------------------------
function Set_Cookie(name, value, expires, path, domain, secure) {

    //Expiration du cookie
    var today = new Date();
    today.setTime(today.getTime());

    if (expires) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date(today.getTime() + (expires));

    document.cookie = name + "=" + escape(value) +
((expires) ? ";expires=" + expires_date.toGMTString() : "") +
((path) ? ";path=" + path : "") +
((domain) ? ";domain=" + domain : "") +
((secure) ? ";secure" : "");
}


//+--------------------------------------------------------------------
//| G e t _ C o o k i e 
//|
//| Cette fonction fera la lecture de la valeur d'un cookie.
//| (Prise du web http://techpatterns.com/downloads/javascript_cookies.php)
//+--------------------------------------------------------------------
function Get_Cookie(check_name) {

    var a_all_cookies = document.cookie.split(';');
    var a_temp_cookie = '';
    var cookie_name = '';
    var cookie_value = '';
    var b_cookie_found = false; // set boolean t/f default f

    for (i = 0; i < a_all_cookies.length; i++) {
        // now we'll split apart each name=value pair
        a_temp_cookie = a_all_cookies[i].split('=');


        // and trim left/right whitespace while we're at it
        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

        // if the extracted name matches passed check_name
        if (cookie_name == check_name) {
            b_cookie_found = true;
            // we need to handle case where cookie has no value but exists (no = sign, that is):
            if (a_temp_cookie.length > 1) {
                cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
            }
            // note that in cases where cookie is initialized but no value, null is returned
            return cookie_value;
            break;
        }
        a_temp_cookie = null;
        cookie_name = '';
    }
    if (!b_cookie_found) {
        return null;
    }
}

//+--------------------------------------------------------------------
//| D e l e t e _ C o o k i e 
//|
//| Cette fonction fera la suppression d'un cookie.
//| (Prise du web http://techpatterns.com/downloads/javascript_cookies.php)
//+--------------------------------------------------------------------
function Delete_Cookie(name, path, domain) {
    if (Get_Cookie(name)) document.cookie = name + "=" +
((path) ? ";path=" + path : "") +
((domain) ? ";domain=" + domain : "") +
";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}


/** Fonction permettant de cacher un élément HTML par son ID
@param {string} id - ID de l'élement à cacher */
function hideElementById(id) {
    var e = document.getElementById(id);
    if (e != undefined) { e.style.display = 'none'; }
}


/** Fonction permettant d'afficher un élément HTML par son ID
@param {string} id - ID de l'élement à afficher */
function unhideElementById(id) {
    var e = document.getElementById(id);
    if (e != undefined) { e.style.display = 'block'; }
}


/** Fonction permettant de swapper le style d'affichage (block devient none et vice-versa) <br>
@param {string} id - ID de l'élement à swapper */
function swapDisplay(id) {
    var e = document.getElementById(id);
    if (e != undefined) {
        if (e.style.display == 'block') { e.style.display = 'none'; }
        else { e.style.display = 'block'; }
    }
}

/** Fonction permettant de swapper le style d'affichage (block devient none et vice-versa) <br>
Et tous les éléments avec la class css fourni seront cachés
@param {string} id - ID de l'élement à swapper */
function swapDisplayCloseAllClass(id,classname) {
    var e = document.getElementById(id);
    if (e != undefined) {

        //obtenir tous les éléments avec ce class name
        var arr = new Array();
        arr = document.getElementsByClassName(classname);

        //cacher tous les éléments
        for (var i = 0; i < arr.length; i++) {
            //cacher seulement si ce n'est pas le même élément qu'on vient de cliquer!
            if (arr[i] != e) {
                arr[i].style.display = 'none';
            }
        }
      
        //l'élément choisi
        if (e.style.display == 'block') 
        {
            e.style.display = 'none';
            document.getElementById('modalLabel').style.display = 'none';
        }else {
            e.style.display = 'block';
            document.getElementById('modalLabel').style.display = 'block';
            var a = document.getElementById('modalLabel');
            if (a.attachEvent)  //Pour IE
            {
                a.onclick = new Function("swapDisplayCloseAllClass('" + id + "','" + classname + "')");
            }
            else {
                a.setAttribute("onclick", "swapDisplayCloseAllClass('" + id + "','" + classname + "')");
            }
        }
    }
}

/** Fonction permettant de swapper le style d'affichage (block devient table-row et vice-versa) <br>
@param {string} id - ID de l'élement TR à swapper */
function swapDisplayTableRow(id) {
    var e = document.getElementById(id);
    if (e != undefined) {
        //Patch pour IE. Chrome et Safari fonctionne avec Table-Row, mais pas IE7
        if (navigator.userAgent.indexOf('MSIE') > -1) { swapDisplay(id); }
        else {
          if (e.style.display == 'table-row') { e.style.display = 'none'; }
          else { e.style.display = 'table-row'; }
        }
    }
}


/** Fonction pour rediriger vers une page html
@param {string} strURL - Contient l'adresse URL */
function gotoURL(strURL) {
    window.status = ('Connect to ' + strURL);
    var location = (strURL);
    this.location.href = location;
}


/** Fonction permettant de retourner l'URL de la page
@return {string} Contient l'URL de la page courante */
function getCurrentPageURL() { return document.URL; }


/** Fonction permettant de colorer le lien du menu de la page 
@param {string} menuID - ID du conteneur du menu */
function colorLnkPage(menuID) {
    var strURL = getCurrentPageURL();

    //À partir du menu1 du site, on colore le menu item correspondant à l'URL
    var eMenu = document.getElementById(menuID);
    if (eMenu != undefined) {
        vMenuLst = eMenu.getElementsByTagName('a');
        for (var i = 0; i < vMenuLst.length; i++) {
            if (vMenuLst[i].href == strURL) { vMenuLst[i].style.color = '#bcee01'; }
            else { vMenuLst[i].style.color = ''; }
        }
    }

}


/** Fonction pour obtenir les paramètres dans un URL
@param {string} strParamName - Nom du paramètre 
return {string} strReturn - Valeur du paramètre */
function getURLParam(strParamName) {
    var strParamName = strParamName.toLowerCase();
    var strReturn = "";
    var strHref = window.location.href.toLowerCase();    
    if (strHref.indexOf("?") > -1) {
        var strQueryString = strHref.substr(strHref.indexOf("?"));
        var aQueryString = strQueryString.split("&");
        for (var iParam = 0; iParam < aQueryString.length; iParam++) {
            if (aQueryString[iParam].indexOf(strParamName + "=") > -1) {
                var aParam = aQueryString[iParam].split("=");
                strReturn = aParam[1];
                break;
            }
        }
    }
    return unescape(strReturn);
}

/** Fonction pour obtenir les paramètres dans un URL
@param {string} strParamName - Nom du paramètre 
return {string} strReturn - Valeur du paramètre */
function getURLParamInsens(strParamName) {
    var strReturn = "";
    var strHref = window.location.href;
    if (strHref.indexOf("?") > -1) {
        var strQueryString = strHref.substr(strHref.indexOf("?"));
        var aQueryString = strQueryString.split("&");
        for (var iParam = 0; iParam < aQueryString.length; iParam++) {
            if (aQueryString[iParam].indexOf(strParamName + "=") > -1) {
                var aParam = aQueryString[iParam].split("=");
                strReturn = aParam[1];
                break;
            }
        }
    }
    return unescape(strReturn);
}

/** Fonction retournant un index d'un dropdown par la valeur 
@param {string} ddlID - Contient le ID du Dropdown
@param {variant} value - Contient la valeur d'un élément du dropdown */
function getSelectedIndexByValue(ddlID, value) {
    var ddl = document.getElementById(ddlID);
    if (ddl != undefined) {
        var optionLst = ddl.getElementsByTagName('option');
        for (var i = 0; i < optionLst.length; i++) { if (optionLst[i].value == value) { return i; } }
    }
    return 0;
}


/* Fonction permettant d'afficher un signe + ou un signe - lorsqu'il y a expand ou collapse 
@param {string} id = ID de l'élément */
function expand_or_collapse(id) {
    var e = document.getElementById(id);
    if (e != undefined) {
        if (e.innerHTML == '+') { e.innerHTML = '&ndash;'; }
        else { e.innerHTML = '+'; }
    }
}


//+--------------------------------------------------------------------
//| f a d e
//|
//| Cette fonction fera le fadeout d'un Element passe en parametre
//| (Prise du web http://www.switchonthecode.com/tutorials/javascript-tutorial-simple-fade-animation)
//+--------------------------------------------------------------------
function fade2(eid, speedin) {
    var element = document.getElementById(eid);
    var TimeToFade = speedin;
    if (element == null)
        return;

    if (element.FadeState == null) {
        if (element.style.opacity == null
        || element.style.opacity == ''
        || element.style.opacity == '1') {
            element.FadeState = 2;
        }
        else {
            element.FadeState = -2;
        }
    }

    if (element.FadeState == 1 || element.FadeState == -1) {
        element.FadeState = element.FadeState == 1 ? -1 : 1;
        element.FadeTimeLeft = TimeToFade - element.FadeTimeLeft;
    }
    else {
        element.FadeState = element.FadeState == 2 ? -1 : 1;
        element.FadeTimeLeft = TimeToFade;
        setTimeout("animateFade2(" + new Date().getTime() + ",'" + eid + "'," + speedin + ")", 33);
    }


}

//+--------------------------------------------------------------------
//| a n i m a t e F a d e
//|
//| Cette fonction sert a animer le fadeout d'un Element passe en parametre
//| (Prise du web http://www.switchonthecode.com/tutorials/javascript-tutorial-simple-fade-animation)
//+--------------------------------------------------------------------
function animateFade2(lastTick, eid, speedin) {

    var TimeToFade = speedin
    var curTick = new Date().getTime();
    var elapsedTicks = curTick - lastTick;

    var element = document.getElementById(eid);

    if (element.FadeTimeLeft <= elapsedTicks) {
        element.style.opacity = element.FadeState == 1 ? '1' : '0';
        element.style.filter = 'alpha(opacity = '
        + (element.FadeState == 1 ? '100' : '0') + ')';
        element.FadeState = element.FadeState == 1 ? 2 : -2;
        element.style.display = 'none' //AJOUT JL. Pour ne plus pouvoir utiliser l'element apres le fade

        return;
    }

    element.FadeTimeLeft -= elapsedTicks;
    var newOpVal = element.FadeTimeLeft / TimeToFade;
    if (element.FadeState == 1) {
        //newOpVal = 1 - newOpVal;
        //alert('test');
    }
    element.style.opacity = newOpVal;
    //alert(newOpVal); 
    element.style.filter = 'alpha(opacity = ' + (newOpVal * 100) + ')';

    //setTimeout("animateFade(" + curTick + ",'" + eid + "')", 33);
    setTimeout("animateFade2(" + curTick + ",'" + eid + "'," + speedin + ")", 33);
}

//+--------------------------------------------------------------------
//| a l e r t F a d e r
//|
//| Function permettant d'ajouter un div dynamiquement pour les alerts
//| 
//| Entrants:  eIDin (Element ID sur lequel se positioner)
//|            textIn (texte du alert)
//|            OffsetIn (Differentiel Left negatif ou positif)
//+--------------------------------------------------------------------
function alertFader(eIDin, textIn, offsetIn, offsetTopIn, DelaiIn) {

    if (document.getElementById(eIDin) == undefined)
    { var ni = document.getElementsByTagName('body')[0] }
    else
    { var ni = document.getElementById(eIDin); }

    var divIdName = eIDin + 'subDiv'; //Nouveau nom du div dynamique

    //On valide qu'il n'existe pas deja
    var newOld = document.getElementById(eIDin + 'subDiv');
    var newdiv;

    //Si aucun differentiel n'a ete specifié, nous mettons 0 comme valeur defaut
    if (offsetIn == undefined)
    { offsetIn = 0; }

    //Si aucun differentiel n'a ete specifié, nous mettons 0 comme valeur defaut
    if (offsetTopIn == undefined)
    { offsetTopIn = 0; }

    //Si aucun delai
    if (DelaiIn == undefined)
    { DelaiIn = 2000; }


    //Si l'element existait deja, nous le reprenons etant donnee 
    //qu'il est seulement cache
    if (newOld == undefined)
    { newdiv = document.createElement('div'); }
    else
    { newdiv = newOld; }

    //On affecte le nom
    newdiv.setAttribute('id', divIdName);

    //reset CSS et positionement
    newdiv.style.left = parseInt(getLeft(ni) + offsetIn) + 'px';
    newdiv.style.top = parseInt(getTop(ni) + offsetTopIn) + 'px';
    newdiv.className = 'PopUpFader';
    newdiv.style.display = 'block';
    newdiv.style.opacity = 1;
    newdiv.style.filter = "alpha(opacity = '100')";
    newdiv.FadeState == 1;
    newdiv.style.zIndex = 3000;

    var strStylePopUp = "style='background: #BFD7F4; text-align: right; padding: 3px 10px 3px 10px; border-bottom : 1px solid #AAA;'"
    newdiv.innerHTML = "<div " + strStylePopUp + "><a href=\"javascript:void(0);\" onClick=\"javascript:document.getElementById('" + divIdName + "').style.display = 'none';\">x</a> </div><p>" + textIn + "</p>";
    document.body.appendChild(newdiv);

    setTimeout("fade2('" + divIdName + "', 500)", DelaiIn);
}

//+--------------------------------------------------------------------
//| a l e r t B o x
//|
//| Function permettant d'ajouter un div dynamiquement pour les alerts
//| sans fadeout
//| Entrants:  eIDin (Element ID sur lequel se positioner)
//|            textIn (texte du alert)
//|            OffsetIn (Differentiel Left negatif ou positif)
//+--------------------------------------------------------------------
function alertBox(eIDin, textIn, offsetIn, offsetTopIn) {

    if (document.getElementById(eIDin) == undefined)
    { var ni = document.getElementsByTagName('body')[0] }
    else
    { var ni = document.getElementById(eIDin); }

    var divIdName = eIDin + 'subDiv'; //Nouveau nom du div dynamique

    //On valide qu'il n'existe pas deja
    var newOld = document.getElementById(eIDin + 'subDiv');
    var newdiv;

    //Si aucun differentiel n'a ete specifié, nous mettons 0 comme valeur defaut
    if (offsetIn == undefined)
    { offsetIn = 0; }

    //Si aucun differentiel n'a ete specifié, nous mettons 0 comme valeur defaut
    if (offsetTopIn == undefined)
    { offsetTopIn = 0; }

    //Si l'element existait deja, nous le reprenons etant donnee 
    //qu'il est seulement cache
    if (newOld == undefined)
    { newdiv = document.createElement('div'); }
    else
    { newdiv = newOld; }

    //On affecte le nom
    newdiv.setAttribute('id', divIdName);

    //reset CSS et positionement
    newdiv.style.left = parseInt(getLeft(ni) + offsetIn) + 'px';
    newdiv.style.top = parseInt(getTop(ni) + offsetTopIn) + 'px';
    //newdiv.className = 'PopUpFader';
    newdiv.style.position = 'absolute';
    newdiv.style.width = '800px';
    newdiv.style.overflow = 'scroll';
    newdiv.style.display = 'block';
    newdiv.style.backgroundColor = 'white';
    newdiv.style.opacity = 1;
    newdiv.style.filter = "alpha(opacity = '100')";
    newdiv.FadeState == 1;

    var strStylePopUp = "style='background: #DDD; text-align: right; padding: 3px 10px 3px 10px; border-bottom : 1px solid #AAA;'"
    newdiv.innerHTML = "<div " + strStylePopUp + "><a href=\"javascript:void(0);\" onClick=\"javascript:document.getElementById('" + divIdName + "').style.display = 'none';\">x</a> </div><p>" + textIn + "</p>";
    document.body.appendChild(newdiv);

}

//========================DEBUT CONFIRM BOX============================================================================
//+--------------------------------------------------------------------
//| C o n f i r m   B o x
//+--------------------------------------------------------------------
/**Function permettant d'ajouter un div dynamiquement pour les confirmations
   avec optionnellement un checkbox. Il sera accrocher sur l'element passe
   en parametre ou sinon centré si aucun element est passe (nullstring)
   @param {string} textIn - le texte
   @param {string} strButtonOkText - le nom du bouton OK
   @param {string} strButtonCancelText - le nom du bouton Cancel
   @param {string} function2Run - la fonction du bouton OK
   @param {bool} blnCheckbox - true: montrer le checkbox
   @param {string} strChkBoxText - le texte du checkbox
   @param {string} blBtnOKClose - false: ne pas fermer la fenêtre quand on click le bouton OK */
function confirmBox(textIn, strButtonOkText, strButtonCancelText, function2Run, blnCheckbox, strChkBoxText, blBtnOKClose) {

    //Appel de la function retournant les points (position) du centre  
    var point = window.center();
    var newdiv = document.createElement("div");
    newdiv.setAttribute('id', 'confirmBoxID');
    newdiv.setAttribute('class', 'confirmationBox shadow');

    var strText = textIn + "<br /><br />";

    if (blnCheckbox == true) {

        if (strChkBoxText != undefined) {
            strText += "&nbsp;&nbsp;<form name='f1_confirm' style='display:inline;'><input id='chkConfirmBox' type='checkbox' name='cb1_confirm'/>";
            strText += "<span onClick='document.f1_confirm.cb1_confirm.checked=(! document.f1_confirm.cb1_confirm.checked);' style='cursor:default;'>";
            strText += strChkBoxText + "</span></form>";
        }
        else
        { strText += "&nbsp;&nbsp;<input id='chkConfirmBox' type='checkbox' />"; }

        strText += "<br /><br />";
        strText += "<div style='text-align:center'>";
        strText += "<input type='button' class='confirmationBox' value='" + strButtonOkText + "' onclick='if (document.getElementById(\"chkConfirmBox\").checked) {" + function2Run.replace(/`/gi, "\"") + "; confirmBoxClose(); }' />";
    }
    else {
        strText += "<div style='text-align:center'>";
        //CQ modif - si le paramètre blBtnOKClose n'est pas présent, le bouton ok marche comme avant
        if (blBtnOKClose == undefined) strText += "<input class='confirmationBox' type='button' value='" + strButtonOkText + "' onclick='" + function2Run.replace(/`/gi, "\"") + "; confirmBoxClose(); ' />";
        //Si blBtnOKClose est false, on ne ferme pas la fenêtre après que function2Run ait roulé
        else if (blBtnOKClose == false) strText += "<input class='confirmationBox' type='button' value='" + strButtonOkText + "' onclick='" + function2Run.replace(/`/gi, "\"") + "; ' />";
    }
    strText += "&nbsp;&nbsp;<input type='button' class='confirmationBox' value='" + strButtonCancelText + "' onclick='confirmBoxClose();' />";
    strText += "</div>";

    newdiv.innerHTML = strText;
    newdiv.style.display = 'none';
    document.body.appendChild(newdiv);
    showModalBeforeElementId('confirmBoxID', '0.30', true);
    newdiv.style.display = 'block';
}

function confirmBoxClose() {
    var objConfirm = document.getElementById('confirmBoxID');
    removeModal('confirmBoxID');
    document.body.removeChild(objConfirm);
}
//========================FIN CONFIRM BOX============================================================================

//+--------------------------------------------------------------------
//| getTop
//|
//| Function permettant de retourner la position relative TOP d'un element
//| (prise du web http://bytes.com/topic/javascript/answers/90547-how-get-absolute-position-element)
//+--------------------------------------------------------------------
function getTop(oElement) {
    var iReturnValue = 0;
    while (oElement != null) {
        iReturnValue += oElement.offsetTop;
        oElement = oElement.offsetParent;
    }
    return iReturnValue;
}

//+--------------------------------------------------------------------
//| getLeft
//|
//| Function permettant de retourner la position relative LEFT d'un element
//|  (prise du web http://bytes.com/topic/javascript/answers/90547-how-get-absolute-position-element)
//+--------------------------------------------------------------------
function getLeft(oElement) {
    var iReturnValue = 0;
    while (oElement != null) {
        //alert(oElement.offsetLeft);
        iReturnValue += oElement.offsetLeft;
        oElement = oElement.offsetParent;
        //oElement.style.border = '1px solid red';
    }
    return iReturnValue;
}

//+--------------------------------------------------------------------
//| getScrollXY
//|
//| Function permettant de retourner la position relative LEFT du scroll
//|  (prise du web http://www.howtocreate.co.uk/tutorials/javascript/browserwindow)
//+--------------------------------------------------------------------
function getScrollXY() {
    var scrOfX = 0, scrOfY = 0;
    if (typeof (window.pageYOffset) == 'number') {
        //Netscape compliant
        scrOfY = window.pageYOffset;
        scrOfX = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        //DOM compliant
        scrOfY = document.body.scrollTop;
        scrOfX = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        //IE6 standards compliant mode
        scrOfY = document.documentElement.scrollTop;
        scrOfX = document.documentElement.scrollLeft;
    }
    return [scrOfX, scrOfY];
}


/* Fonction permettant de mettre un panel modal par-dessus le navigateur 
   @param {string} id - Contient le ID de l'élément dont on veut insérer le divModal avant 
   @param {string} valeur en decimal de l'opacity (optionnel) 
   @param {bool} valeur indiquant si il y a plusieurs modal (meme id) ou un seul unique */
function showModalBeforeElementId(id, intOpacity, unique)
{
  var divModal = document.createElement('div');
  var screenLenght = window.size();

  var strOpacity = "0.9";
  var strAlpha = "90";
  
  if (intOpacity != undefined) 
  {
      if (intOpacity == "1" || intOpacity == "1.0")
        { strOpacity = "1.0"; strAlpha = "100"; }
      else
      { strOpacity = intOpacity; strAlpha = intOpacity.replace("0.", ""); }
  }

  divModal.setAttribute('style', 'opacity:' + strOpacity + '; -moz-opacity:' + strOpacity + '; -ms-filter:"alpha(opacity=' + strAlpha + ')"; filter:alpha(opacity=' + strAlpha + ');');
  divModal.style.display = 'none';
  divModal.style.position = 'fixed';
  divModal.style.backgroundColor = (intOpacity == '0') ? '#fff' : '#000';
  divModal.style.zIndex = '190';
  divModal.style.top = '0px';
  divModal.style.left = '0px';
  divModal.style.width = "100%";  /* screenLenght.width + 'px';*/
  divModal.style.height = "100%"; /* screenLenght.height + 'px';*/  

  //Si nous voulons un modal avec un ID unique nous combinerons les divModal et le ID en param.
  if (unique != undefined)
  { divModal.setAttribute('id', 'divModal' + id); }
  else
  { divModal.setAttribute('id', 'divModal'); }

  var element = document.getElementById(id);
  var parentElement = element.parentNode;
  parentElement.insertBefore(divModal, element);
  divModal.style.display = 'block';
}


/* Fonction permettant d'enlever le DIV modal 
@param {string} id - optionnel le nom du div */
function removeModal(id) {

    //Si aucun parametre id nous supprimons l'element divModal
    if (id == undefined)
    { var divModal = document.getElementById('divModal'); }
    else
    { var divModal = document.getElementById('divModal' + id); }

    if (divModal != undefined) {
        var parentElement = divModal.parentNode;
        parentElement.removeChild(divModal);
    }
}


/* Permet d'obtenir le size de l'écran du navigateur
provient de: http://www.geekdaily.net/2007/07/04/javascript-cross-browser-window-size-and-centering/
+ addition du scrollHeight/Width pour obtenir le Height/Width du document avec scrollbar */
window.size = function() {
    var w = 0;
    var h = 0;

    if (!window.innerWidth) //IE
    {
        //strict mode
        if (!(document.documentElement.clientWidth == 0)) {
            w = (document.documentElement.scrollWidth != 0) ? document.documentElement.scrollWidth : document.documentElement.clientWidth;
            h = (document.documentElement.scrollHeight != 0) ? document.documentElement.scrollHeight : document.documentElement.clientHeight;
        }
        else //quirks mode
        {
            w = (document.body.scrollWidth != 0) ? document.body.scrollWidth : document.body.clientWidth;
            h = (document.body.scrollHeight != 0) ? document.body.scrollHeight : document.body.clientHeight;
        }
    }
    else //w3c
    {
        w = (document.documentElement.scrollWidth != 0) ? document.documentElement.scrollWidth : window.innerWidth;
        h = (document.documentElement.scrollHeight != 0) ? document.documentElement.scrollHeight : window.innerHeight;

        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {

            //Afin de corriger la problematique du height du body dans chrome, nous faisons un petit overide
            //permettant de reprendre la bonne hauteur.
            if (document.documentElement.scrollHeight != 0) {
                if (window.innerHeight > document.documentElement.scrollHeight)
                { h = window.innerHeight; }
            }
        }
    }
    return { width: w, height: h };
}


/* Permet d'obtenir le point central de la page
provient de: http://www.geekdaily.net/2007/07/04/javascript-cross-browser-window-size-and-centering/ */
window.center = function() {
    var hWnd = (arguments[0] != null) ? arguments[0] : { width: 0, height: 0 };

    var _x = 0;
    var _y = 0;
    var offsetX = 0;
    var offsetY = 0;

    //IE
    if (!window.pageYOffset) {
        //strict mode
        if (!(document.documentElement.scrollTop == 0)) {
            offsetY = document.documentElement.scrollTop;
            offsetX = document.documentElement.scrollLeft;
        }
        //quirks mode
        else {
            offsetY = document.body.scrollTop;
            offsetX = document.body.scrollLeft;
        }
    }
    //w3c
    else {
        offsetX = window.pageXOffset;
        offsetY = window.pageYOffset;
    }

    _x = ((this.size().width - hWnd.width) / 2) + offsetX;
    _y = ((this.size().height - hWnd.height) / 2) + offsetY;

    return { x: _x, y: _y };
}


/* Fonction permettant de rendre un checkbox checked lorsqu'il ne l'est pas 
et de le rendre unchecked lorsqu'il est. 
@param {string} id - Contient le id du checkbox */
function chkMe(id) {
    var cBox = document.getElementById(id);
    if (cBox != undefined) {
        if (cBox.disabled == false) {
            if (cBox.checked) { cBox.checked = false; }
            else { cBox.checked = true; }
        }
    }
}




// Shi Qiao Yu (Thoran inc.) Date: 11/10/2012
/** Utilisé pour les boutton radio. Si le boutton est déjà checké, on le check à nouveau.
@param {string} id: le id du boutton radio */
function chkMeRadio(id) {
    var cBox = document.getElementById(id);
    if (cBox != undefined) {
        if (cBox.disabled == false) {
            cBox.checked = true;
        }
    }    
}


// Shi Qiao Yu (Thoran inc.) Date: 26-12-2013
/** Retourne la valeur du boutton radio selectionne. Retourne null si rien de trouve
@param {} 
@return */
function getRadioValue(namestr) {
    var btnarr = document.getElementsByName(namestr);

    for (var i = 0; i < btnarr.length; i++) {
        if (btnarr[i].checked == true) {
            return btnarr[i].value;
        }
    }

    return null;
}


// Shi Qiao Yu (Thoran inc.) Date: 26-12-2013
/** Selectionne le radio button d'apres le value
@param {} 
@return */
function checkRadioByValue(namestr, valuestr) {
    var btnarr = document.getElementsByName(namestr);

    for (var i = 0; i < btnarr.length; i++) {
        if (btnarr[i].value == valuestr) {
            btnarr[i].checked = true;
            return;
        }
    }
}

//------------------------------------------------------------------------------
// W a i t M a c h i n e   Funcs
//------------------------------------------------------------------------------
var WaitMachineProcessList = new Array();

/* Fonction qui initialise le wait machine */
function WaitMachineStart(appendElementID) {
    if (arguments[0] != undefined) {
        setTimeout('WaitMachineCheck(\'' + appendElementID + '\');', 1000);
    }
    else {
        setTimeout('WaitMachineCheck();', 1000);
    }
}

/* Function permettant d'ajouter un processus au waitMachine */
function WaitMachineProcessAdd(strProcessName)
{ WaitMachineProcessList[WaitMachineProcessList.length] = strProcessName; }

/* Function permettant d'enlever un processus au waitMacine */
function WaitMachineProcessRemove(strProcessName) {
    WaitMachineProcessList.remove(WaitMachineProcessList.indexOf(strProcessName));
}

/* Function qui valide le nombre de processus encore actif et relance de facon 
recursive le Check */
function WaitMachineCheck(appendElementID) {

    if (WaitMachineProcessList.length == 0) {
        if (arguments[0] != undefined) {
            waitMachine(false, "", appendElementID);
        }
        else {
            waitMachine(false);
        } 
    }
    else {
        if (arguments[0] != undefined) {
            waitMachine(true, WaitMachineProcessList[0], appendElementID);
            setTimeout('WaitMachineCheck(\'' + appendElementID + '\');', 500);
        }
        else {
            waitMachine(true, WaitMachineProcessList[0]);
            setTimeout('WaitMachineCheck();', 500);
        }
        
    }

}

/* Function  permettant d'afficher un wait picture avec optionnellement un message
@param {bool} blnSwitch - Permet de mettre a ON ou OFF le waiter
@param {string} strMessage - Optionnel, message jumelé au waitMachine
@param {string} appendElementID - Optionnel, permet de choisir de appender le wait div dans un élément autre que le body
*/
function waitMachine(blnSwitch, strMessage, appendElementID) {

    //Selon le parametre nous affichons ou suprimons le div
    try {
        if (arguments[2] != undefined) {
            document.getElementById(appendElementID).removeChild(document.getElementById("waitMachineID")); removeModal('waitMachineID');
        }
        else {
            document.body.removeChild(document.getElementById("waitMachineID")); removeModal('waitMachineID');
        }
    }
    catch (err) { }

    if (!blnSwitch) { return; }

    var newdiv = document.createElement("div");
    newdiv.setAttribute('id', 'waitMachineID');
    newdiv.style.position = "absolute";
    
    //CQ 3.5: fix pour le path
    if (_basePathGlobal == undefined || _basePathGlobal == null) {
        var strPathOpt = "../images/";
    }
    else {
        var strPathOpt = _basePathGlobal + "images/";
    }
    //if (_basePathGlobal=="/") { var strPathOpt="../images/"; }

    if (strMessage == undefined)
    { newdiv.innerHTML = "<img style='margin-top:15px;' src='" + strPathOpt + "wait.gif' alt='" + ___AltWait___ + "' />"; }
    else
    { newdiv.innerHTML = strMessage + "&nbsp;&nbsp;<img style='margin-top:15px;' src='" + strPathOpt + "wait.gif' alt='" + ___AltWait___ + "' />"; }

    newdiv.style.position = "fixed";
    newdiv.style.top = "50%";
    newdiv.style.left = "50%";
    newdiv.style.marginLeft = "-200px";
    newdiv.style.marginTop = "-150px";
    newdiv.style.width = "300px";
    newdiv.style.height = "auto";
    newdiv.style.backgroundColor = "#F7F7F7";
    newdiv.style.padding = "50px";
    newdiv.style.textAlign = "center";
    newdiv.style.border = "1px dotted #0099CC";
    newdiv.style.fontWeight = "bold";
    newdiv.style.zIndex = "201";
    
    //CQ ajout v3.1: si on envoit un append element ID, c'est que le wait div n'arrive pas à apparaitre sur l'écran en se colland au body
    if (arguments[2] != undefined) {
        document.getElementById(appendElementID).appendChild(newdiv);
    }
    else {
        document.body.appendChild(newdiv);
    }
    showModalBeforeElementId('waitMachineID', '0', true);
}

/* fonction permettant d'effectuer une command asyncrone selon le wait timeout */
function waitMachineDelayCommand(strcommand) {

    if (WaitMachineProcessList.length == 0)
    { setTimeout(strcommand, 1); }
    else
    { setTimeout("waitMachineDelayCommand('" + strcommand + "');", 500); }


}

//---Fin WaitMachine-------------------------------------------------------------

// Remove d'un item d'un array
// prise du web http://ejohn.org/blog/javascript-array-remove/
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


/** Function permettant d'aller à la page d'acceuil quand la session est fermé et 
que l'utilisateur essaie d'accéder le WEB service
@param {object} result - Reponse du serveur lors d'un appel Web-service */
function __ws_OnError(result) {
    // gotoURL('../login.aspx'); 
}


/** Permet d'effectuer une recherche des éléments par nom de classe 
@param {string} cl = nom de la classe dans l'atribut class */
document.getElementsByClassName = function(cl) {
    var retnode = [];
    var myclass = new RegExp('\\b' + cl + '\\b');
    var elem = this.getElementsByTagName('*');
    for (var i = 0; i < elem.length; i++) {
        var classes = elem[i].className;
        if (myclass.test(classes)) retnode.push(elem[i]);
    }
    return retnode;
};

/** Sort tous les éléments qui ont le class name voulu à l'intérieur d'un élément
@param {elem} elemobj - l'élément obtenu avec document.getElementById
@param {string} strClassName - le class name recherché */
function getElemsByClassName(strClassName, elemobj) {
    var retnode = [];
    var myclass = new RegExp('\\b' + strClassName + '\\b');
    var elem = elemobj.getElementsByTagName('*');

    for (var i = 0; i < elem.length; i++) {
        var classes = elem[i].className;
        if (myclass.test(classes)) retnode.push(elem[i]);
    }
    return retnode;
}

/** Fonction qui efface le contenu du Search textfield quand celui-ci contient la valeur par défaut */
function txtSearchOnFocus(html_element, strDefault) {
    if (html_element.value == strDefault) {
        html_element.value = "";
        html_element.style.color = "black";
    }
}

/** Function permettant de reinsérer le 'Search ?? by ??' dans le text field si celui-ci est vide */
function setTextFieldValue(html_element, strText) {
    if (html_element.value == "") {
        html_element.style.color = "#aaa";
        html_element.value = strText;
    }
}


/** Function permettant d'obtenir le size d'une fenêtre d'un navigateur 
Fonctionne dans IE 7-8, FF3.0, Chrome 1.0. */
function getVisibleWindowSize() {
    var myWidth = 0, myHeight = 0;
    if (typeof (window.innerWidth) == 'number') {
        //Non-IE
        myWidth = window.innerWidth;
        myHeight = window.innerHeight;
    }
    else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        myWidth = document.documentElement.clientWidth;
        myHeight = document.documentElement.clientHeight;
    }
    else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
        //IE 4 compatible
        myWidth = document.body.clientWidth;
        myHeight = document.body.clientHeight;
    }

    return { w: myWidth, h: myHeight };
}

/** Recursive qui active ou desactive les crontroles d'un element 
@Param {object} el - Element pricinal
@param {bool} blnDisabled - statut a appliquer
*/
function toggleDisabled(el, blnDisabled) {
    try {
        el.disabled = blnDisabled;
    }
    catch (E) {
    }

    if (el.childNodes && el.childNodes.length > 0) {
        for (var x = 0; x < el.childNodes.length; x++) {
            toggleDisabled(el.childNodes[x], blnDisabled);
        }
    }
}

/** Retourne true ou false d'apres le string
@param {string} strBool - le string à convertir à boolean*/
function getBoolFromString(strBool) {
    if (strBool == "True" || strBool == "true" || strBool == true || strBool > 0) {
        return new Boolean(true);
    }
    else {
        return new Boolean(false);
    }
}

/**Ajouter un tag texte dans le textarea
@param {element} elemID - le id du textarea
@param {string} myValue - le tag texte qu'on veut insérer dans le textarea */
function AddTagAtCursor(elemID, myValue) {
    var myField = document.getElementById(elemID);
    //IE support                
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA/NETSCAPE support
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

        //CQ - Fix pour Chrome, on met le cursor à la fin du tag qu'on a ajouté, mais on ne met pas nécessairement à la fin du texte, puisque le tag peut être placé au milieu
        myField.setSelectionRange(startPos + myValue.length, startPos + myValue.length);
    } 
    else {//if all else fails... ajouter tag à la fin du texte
        myField.value += myValue; 
    }
    
    //Remettre le focus dans le textarea, pour empêcher que le boutton sur lequel on a cliquer puisse être re-cliquer si on pèse sur spacebar
    myField.focus();
}

/** Enlève le class name dans tous les éléments d'un document
@param {string} classname - le nom du class name
@param {element} elem - optionnel, si ce paramètre est spécifié, on enlève le class name seulement pour cet élément */
function RemoveClassName(classname, elem) {

    //enlever le class name dans tous le document
    if (elem == undefined) {
        var arr = document.getElementsByClassName(classname);

        for (var i = 0; i < arr.length; i++) {
            arr[i].className = arr[i].className.replace(new RegExp(classname, "g"), '');
        }
    }
    //enlever seulement dans cet élément
    else {
        elem.className = elem.className.replace(new RegExp(classname, "g"), '');
    }
}

/** Enlève tous les class name dans un élément
@param {string} classname - le nom de la class à enlever
@param {element} elem - l'élément obtenu après un document.getElementById*/
function RemoveAllClassNameFromElem(classname, elem) {
    var arr = new Array();

    //Obtient tous les éléments avec le class name
    arr = getElemsByClassName(classname, elem);
    
    //Enlever le class dans tous les éléments
    for (var i = 0; i < arr.length; i++) {
        arr[i].className = arr[i].className.replace(new RegExp(classname, "g"), '');
    }
}

/** Ajoute un class name pour élément, une seule fois seulement
@param {element} elem - l'élément
@param {string} classname - le nom du class name */
function AddClassNameToElementID(elem, classname) {
    var elemname = elem.className; 
    var myclass = new RegExp(classname);
    //Si le class name n'existe pas déjà, on l'ajoute
    if (myclass.test(elemname) == false) {
        elem.className += ' ' + classname; 
    }
}

/** Ajoute une option à la fin d'un select */
function AddToEndOfSelect(myselect, tagid, tagvalue) {
  try {
    myselect.add(new Option(tagvalue, tagid), null);  //add new option to end of "sample"    
  } 
  catch (e) { //in IE, try the below version instead of add()
    myselect.add(new Option(tagvalue, tagid));  //add new option to end of "sample"
  }

  //si le select était vide avant l'ajout, on met le selected à la nouvelle valeur ajoutée et on enlève l'option vide
  if (myselect.value == "-100") {
    myselect.value = tagid;
    //enlever la sélection 
    myselect.remove(0);
  }
}


/** Permet de manipuler le zIndex
@param {element} eId - l'élément HTML dont on veut augmenter le zIndex
@param {int} i - Incrémentation */
function zIndexUp(eId, i) { 
  var e = document.getElementById(eId);
  if (e != undefined) {
    var z = (e.style.zIndex == null) ? 0 : e.style.zIndex;
    e.style.zIndex = (parseInt(z,10) + parseInt(i,10));
  }
}


/** Permet de manipuler le zIndex
@param {element} eId - l'élément HTML dont on veut augmenter le zIndex
@param {int} i - Décrémentation */
function zIndexDown(eId, i) { 
  var e = document.getElementById(eId);
  if (e != undefined) {
    var z = (e.style.zIndex == null) ? 0 : e.style.zIndex;
    e.style.zIndex = (parseInt(z,10) - parseInt(i,10));
  }
}

/** Html decode un text et le raccourçi si celui-çi dépasse une certaine longueur*/     
function ShortTextWithDecoding(strText, num) {
  var decodedText = html_entity_decode(strText);     
  //replacer les &nbsp; par un espace vide
  decodedText = decodedText.replace(/&nbsp;/g, " ");

  if (decodedText.length > num) {
    decodedText = decodedText.substring(0, num - 3) + "...";
  }
  return decodedText;
}

/** Raccourci un text et ajoute 3 points au besoin */
function ShortTextAdd3dots(strText, num) {
    if (strText.length != 0 ) {
          if (strText.length > num) {    
            strText = strText.substring(0, num - 3 ) + "...";
          }
      }
  return strText;
}


function selectAll(id){
  document.getElementById(id).focus();
  document.getElementById(id).select();
}

// Shi Qiao Yu (Thoran inc.) Date: 16/02/2012
/** Retourne le global resource de la platform
@param {string} nameStr : le name dans PlatformSystem
@return le global resource (ex: ___platform0___)*/
function getPlatformResource(nameStr) {
 
  switch (nameStr) {
    case PlatformSystem.Blackboard.name:
      return ___Platform0___;
    case PlatformSystem.Moodle.name:
      return ___Platform1___;
    case PlatformSystem.Sharepoint.name:
      return ___Platform2___;
    case PlatformSystem.WebApps.name:
        return ___Platform3___;
    case PlatformSystem.Canvas.name:
        return ___Platform4___;
    case PlatformSystem.Desire2Learn.name:
        
        return ___Platform6___;
    case PlatformSystem.Sakai.name:
        return ___Platform7___;
    default:
      return "";
  }
}

function getEntityPlatformResource(nameStr) {
    
    switch (nameStr) {
        case PlatformSystem.Blackboard.name:
            return ___Platform0___;
        case PlatformSystem.Moodle.name:
            return ___Platform1___;
        case PlatformSystem.Sharepoint.name:
            return ___Platform2___;
        case PlatformSystem.WebApps.name: 
            return ___Platform3___;
        case PlatformSystem.Canvas.name:
            return ___Platform4___;
        case PlatformSystem.Desire2Learn.name:
            return ___Platform6___;
        case PlatformSystem.Sakai.name:
            return ___Platform7___;
        default:
            return "";
    }
}


// Shi Qiao Yu (Thoran inc.) Date: 16/02/2012
/** Retourne le global resource du module
@param {string} nameStr : le name dans ModuleType
@return le global resource (ex: ___Module0___)*/
function getModuleResource(nameStr) {
  switch (nameStr) {
    case ModuleType.Tasks.name:
      return ___Module0___;
    case ModuleType.Reports.name:
      return ___Module1___;
    case ModuleType.Feedback.name:
      return ___Module2___;
    case ModuleType.SubjectManagement.name:
      return ___Module3___;
    case ModuleType.Launcher.name:
        return ___Module4___;  
    default:
      return "";
  }
}


// Shi Qiao Yu (Thoran inc.) Date: 17/02/2012
/** Retourne le global resource du native
@param {string} nameStr : le name dans NativeOrWebApp
@return le global resource (ex: ___Native0___)*/
function getNativeResource(nameStr) {
  switch (nameStr) {
    case NativeOrWebApp.Webapp.name:
      return ___Native0___;
    case NativeOrWebApp.Native.name:
      return ___Native1___;
    default:
      return "";
  }
}


function pageWidth() { return window.innerWidth != null ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body != null ? document.body.clientWidth : null; }
function pageHeight() { return window.innerHeight != null ? window.innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body != null ? document.body.clientHeight : null; }
function posLeft() { return typeof window.pageXOffset != 'undefined' ? window.pageXOffset : document.documentElement && document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft ? document.body.scrollLeft : 0; }
function posTop() { return typeof window.pageYOffset != 'undefined' ? window.pageYOffset : document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ? document.body.scrollTop : 0; }
function posRight() { return posLeft() + pageWidth(); }
function posBottom() { return posTop() + pageHeight(); }

//+--------------------------------------------------------------------
//| t o T h e T o p
//+--------------------------------------------------------------------
// Martin Benoit  (Thoran inc.) Date: 13/03/2012
/// <summary>Fonction qui scroll a 0,0</summary>
function toTheTop() {
    window.scroll(0, 0);
}



// Shi Qiao Yu (Thoran inc.) Date: 26/06/2012
/** Retour au menu principal des Blocks quand on est déjà à l'intérieur d'un iframe*/
function gotoListBlocks() {
    gotoURL('lstblocks.aspx');
}

// Kai Yin  Date: 25/02/2015
/** Retour au menu principal des Blocks quand on est déjà à l'intérieur d'un iframe*/
function gotoListEntities() {
    gotoURL('lstentities.aspx');
}


// Shi Qiao Yu (Thoran inc.) Date: 06/07/2012
/** Loader la page dans le menu
@param {} 
@return */
function gotoMenuPage(loadpage) {
    gotoURL('bpi.aspx?page=' + loadpage );
}


/** Affiche la section du sous-menu qui est sélectionné
@param {elem} e : le item du menu qui est sélectionné */
function chgNavig(e) {
    if (e.className.indexOf('highlightYellow') == -1) {
        var lstMenu = document.getElementById('blockNavigMenu').getElementsByTagName('a');
        for (var i = 0; i < lstMenu.length; i++) {
            //lstMenu[i].style.backgroundColor = 'transparent';
            RemoveClassName('highlightYellow', lstMenu[i]);
            fadeOut(lstMenu[i].id + '_div', 500);
            hideElementById(lstMenu[i].id + '_div');
        }
        //e.style.backgroundColor = 'yellow';
        AddClassNameToElementID(e, 'highlightYellow');

        unhideElementById(e.id + '_div');
        fadeIn(e.id + '_div', 500);

        //a chaque fois qu'on clique sur un sous-menu, la section revient au top
        window.scroll(0, 0);
    }
  }

  function select_text(element) {
    var tmpValue = element.value;
    var sPosition = element.selectionEnd;

    if (element.value.length == sPosition) { element.select(); }
}


function select_text(element, defaultValue) {
    var tmpValue = element.value;
    if (element.value == defaultValue) { element.select(); }
}


function chgNavigEntity(e) {
    if (e.className.indexOf('highlightYellow') == -1) {
        var lstMenu = document.getElementById('entityNavigMenu').getElementsByTagName('a');
        for (var i = 0; i < lstMenu.length; i++) {
            //lstMenu[i].style.backgroundColor = 'transparent';
            RemoveClassName('highlightYellow', lstMenu[i]);
            fadeOut(lstMenu[i].id + '_div', 500);
            hideElementById(lstMenu[i].id + '_div');
        }
        //e.style.backgroundColor = 'yellow';
        AddClassNameToElementID(e, 'highlightYellow');

        unhideElementById(e.id + '_div');
        fadeIn(e.id + '_div', 500);

        //whenever we click on a submenu, the section returns to the top
        window.scroll(0, 0);
    }
}

/**
* Return the selected value of the provided DDL
* @function
* @name getDDLValue
* @memberOf Globaljs
* @param {string} ddlID
*/
getDDLValue = function(ddlID) {
    var ele = document.getElementById(ddlID);
    return ele.options[ele.selectedIndex].value;
}


/**
* Will set the selectedItem of the DDL to the provided option. (Only if this option already exist in the DDL)
* This function is not case sensitive and it trims the values.
* @function
* @name selectThisOption
* @memberOf Globaljs
* @param {string} ddlID
* @param {string} strOption
*/
selectThisOption = function(ddlID, strOption) {
    if (!strOption || !document.getElementById(ddlID)) { return; }
    var options = document.getElementById(ddlID).options;
    for (var i = 0; i < options.length; i++) {
        if (options[i].value.trim().toLowerCase() == strOption.trim().toLowerCase()) {
            options[i].selected = true;
            break;
        }
    }
}


//+----------------------------------------------------------------------------
//| t r i m
//|
//| Add IE compatibility to the trim function (wich do not support it normally)
//+----------------------------------------------------------------------------
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    }
}


// w a i t F o r F i n a l E v e n t
// Prévient d'appeler une fonction répététivement.
// s'utilise comme suit: waitForFinalEvent(function(){}, 250, "some unique string");
// http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed
var waitForFinalEvent = (function() {
    var timers = {};
    return function(callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();





//+--------------------------------------------------------------------
//| p u b l i s h I f r a m e H e i g h t
//+--------------------------------------------------------------------
// Vlad Adam (Thoran inc.) Date: 02-07-2013
/// <summary>Fonction qui permet de publier le height du iframe d'un block si on a inclu le crossDomainIframeResize.js dans la page</summary>
function publishIframeHeight() {
    if (typeof publishHeight == 'function') {
        publishHeight();
    } 
}


function removeSpace(str) {
  var r = "";
  for (var i = 0; i < str.length; i++) {
    r += (str.substring(i, i+1) == " ") ? "" : str.substring(i, i+1);
  }
  return r;
}


// Shi Qiao Yu (Thoran inc.) Date: 11-04-2014
/** Clone un objet sans garder de reference a l'ancien objet
@param {} 
@return */
function cloneObj(src) {
    var target = {};

    for (var prop in src) {
        target[prop] = src[prop];
    }

    return target;
}

// entities
var PathwayPlatformSystem = { Generic: { value: 0, name: "Generic" }, Desire2Learn: { value: 1, name: "Desire2Learn" }, PeopleSoft: { value: 2, name: "PeopleSoft" }, Blackboard: { value: 3, name: "Blackboard"} };