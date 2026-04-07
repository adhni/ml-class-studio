//               _____      _     _       _               
//              / ____|    (_)   | |     (_)              
//__      _____| |  __ _ __ _  __| |_   ___  _____      __
//\ \ /\ / / __| | |_ | '__| |/ _` \ \ / / |/ _ \ \ /\ / /
// \ V  V /\__ \ |__| | |  | | (_| |\ V /| |  __/\ V  V / 
//  \_/\_/ |___/\_____|_|  |_|\__,_| \_/ |_|\___| \_/\_/  
//                                                        
//
// auteur: Shi Qiao Yu
// compagnie: ThoranSoft
// description: jscript pour wsGridview.cs

function keyPressEventGridView(e, jp) {
  try {
    switch (e.keyCode) {
      case 13:
        //obtenir la valeur de la page dans le text box
        var fval = getValidGridViewValue(document.getElementById(jp.funcValueElem).value, jp.pageMax);
        //reconstruire le json pour le sort order
        var strOrderBy = "";
        if (jp.strOrderBy0 != "") strOrderBy = ",['" + jp.strOrderBy0 + "','" + jp.strOrderBy1 + "']";
        //construire les parametres de la fonction
        var jparams = fval + strOrderBy;
        eval("(" + jp.funcName + "(" + jparams + ")" + ")");
        return false;
      default:
        return e.keyCode;
    }
  }
  catch (e) { }
}

/** Fonction qui valide la valeur du paging et retourne une valeur valide 
@param {string} val - la valeur dans le textbox du paging
@param {string} pageMax - la valeur du nombre maximum de page */
function getValidGridViewValue(val, pageMax) {
  //verifier si c'est un nombre valide
  if (isNaN(val)) return 1;
  //verifier si c'est moins que 1
  if (parseInt(val) < 1) return 1;
  //verifier si c'est plus grand que le nombre maximale de pages
  if (parseInt(val) > parseInt(pageMax)) return pageMax;
  return val;
}