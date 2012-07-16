// ==UserScript==
// @include http://*
// @include https://*
// ==/UserScript==

////////////////////////////////// Documents 1.2 by Christoph142 //////////////////////////////////
//                                                                                               //
// You're welcome to use or modify this code (or parts of it) for your personal use as a userjs  //
//              but please refrain from copying its functionality to other extensions            //
//                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////

var extended_docs = new RegExp("\\.("+widget.preferences.extended_docs+")$","gim");//$ = end of string

window.opera.addEventListener("BeforeEvent", handle_pasted_urls, false);
function handle_pasted_urls(){
	if(document.URL.match(extended_docs)&&document.URL.match(/\?/)==null){
		window.stop();
		window.location.replace("https://docs.google.com/viewer?docex=1&url="+document.URL);
	}
	window.opera.removeEventListener("BeforeEvent", handle_pasted_urls, false);
}