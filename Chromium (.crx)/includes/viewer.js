(function()
{
	if(document.URL.indexOf("docs.google.com/viewer?docex=1") === -1) return;
	
	window.addEventListener("DOMContentLoaded", function()
	{
		var docStyle = 	"#content-pane, #thumb-pane{ top:28px !important; }\n"+
						"#controlbar{ position:fixed !important; top:28px !important; z-index:99 !important; display:none; transition:500ms; box-shadow:0 5px 10px -5px rgba(0,0,0,0.3); } \n"+ // grey control bar
						"#docex_titlediv{ float:right; height:22px; padding-top:5px; color:#666; transition:0.5s; }\n"+
						"#menubar-shadow{ position:fixed; height:1px; width:100%; top:27px; left:0; z-index:98; border-bottom:1px solid #ddd; }\n"+
						"#bugreport:hover, #rate_extension:hover{ background:#eee; }";
	
		var style = document.createElement("style");
		style.setAttribute("type","text/css");
		style.id = "Documents_extension_style";
		style.innerHTML = docStyle;
		document.getElementsByTagName("head")[0].appendChild(style);
		
		document.getElementById("content-pane").style.height = document.body.offsetHeight-28+"px";
		document.getElementById("thumb-pane").style.height = document.body.offsetHeight-28+"px";
		document.getElementById("thumb-pane-lower").style.height = document.body.offsetHeight-28+"px";
		
		// get rid of black google bar and big title of document:
		document.getElementById("docs-header").style.height = "0px";
		document.getElementById("docs-header").style.overflow = "hidden";
		
		// set height/offsetheight, because Google calculates top of document = docs-menubar + controlbar
		document.getElementById("docs-menubar").style.height = "0px";
		document.getElementById("docs-menubar").style.overflow = "visible";
		document.getElementById("controlbar").offsetHeight = "28";
		// add a fixed invisible div for the shadow of docs-menubar:
		var docs_menubar_shadow = document.createElement("div");
		docs_menubar_shadow.id = "menubar-shadow";
		document.body.appendChild(docs_menubar_shadow);
		
		// display document's file name or its title (if available) at the right side of white docs-menubar:
		var titlediv = document.createElement("div");
		titlediv.id = "docex_titlediv";
		titlediv.innerHTML = document.title;
		document.getElementById("docs-menubar").appendChild(titlediv);
		window.setTimeout(check_title,1000); window.setTimeout(check_title,3000);
		window.setTimeout(check_title,5000); window.setTimeout(check_title,10000);
		
		// adjust menu:
		try{
			document.getElementById(":a").outerHTML = ""; // separator
			document.getElementById(":b").outerHTML = ""; // edit online
			document.getElementById(":c").outerHTML = ""; // download original file
			document.getElementById(":d").outerHTML = ""; // "print" (PDF)
			document.getElementById(":j").outerHTML = ""; // separator
			document.getElementById(":k").outerHTML = ""; // compact control elements
			document.getElementById(":o").id = "bugreport";
			document.getElementById("bugreport").firstChild.innerHTML = chrome.i18n.getMessage("bugreport");
			document.getElementById("bugreport").onclick = function(){
				window.open("https://addons.opera.com/extensions/details/documents/?reports#feedback-container"); };
			document.getElementById(":p").id = "rate_extension";
			document.getElementById("rate_extension").firstChild.innerHTML = chrome.i18n.getMessage("rate_extension");
			document.getElementById("rate_extension").onclick = function(){
				window.open("https://addons.opera.com/extensions/details/documents/#feedback-container"); };
		}catch(e){ console.log("Documents extension: Google Docs Viewer's structure changed: "+e.message); }
		
		// grey control bar: insert a button to save the documents:
		var printbutton	= document.getElementById("printToolbarButton");
		var savebutton = printbutton.cloneNode(true);
		savebutton.id = "saveToolbarButton";
		savebutton.dataset.tooltip = chrome.i18n.getMessage("save_file");
		savebutton.setAttribute("aria-label", chrome.i18n.getMessage("save_file"));
		savebutton.firstChild.firstChild.innerHTML = "<a href='"+document.URL.split("&url=")[1].split("&docid")[0]+"' style='cursor:default;' download><img src='"+savebutton_src+"' height='29' style='margin-top:-2px;'></a>";
		savebutton.onmouseover = function(){ savebutton.getElementsByTagName("img")[0].src = savebutton_hover_src; };
		savebutton.onmouseout = function(){ savebutton.getElementsByTagName("img")[0].src = savebutton_src; };
		
		// and some space to keep the alignments:
		var spacer = document.createElement("div");
		spacer.className = "goog-inline-block separator";
		printbutton.parentNode.insertBefore(savebutton, printbutton);
		printbutton.parentNode.insertBefore(spacer, printbutton);
		// don't show print(PDF)-button if viewed file is a pdf:
		if(document.getElementsByClassName("docs-title-inner")[0].innerHTML.match(new RegExp("\.pdf","i"))){
			document.getElementById("printToolbarButton").outerHTML = "";
			document.getElementById("separator2").outerHTML = "";
		}
		
		// correct the link for password protected files:
		try{ document.getElementById("password-div").firstChild.action =
				document.getElementById("password-div").firstChild.action.replace("docs.google.com/viewer?url=","docs.google.com/viewer?docex=1&url=");
		}catch(e){}
		
		// show / hide controlbar:
		window.addEventListener("keydown", function(){ adjust_controlbar(); }, false);
		window.addEventListener("mousemove", function(){ adjust_controlbar(); }, false);
		
		// if available go to page nr X in link:
		if(document.URL.match(/\#page([0-9]+)/)) window.setTimeout(function(){
			try{document.getElementById(":r.thumb."+(document.URL.match(/\#page([0-9]+)/)[1]-1)).lastChild.click();}catch(e){/* !page */}
		},1000);
	}, false);
	
	var controlbar_is_visible = 0; var controlbar_timeout;
	function adjust_controlbar(){
		var e = window.event;
		var active = document.activeElement.id;
		if(!controlbar_is_visible && (e.pageY < 29 || active === "searchBox")){
			window.clearTimeout(controlbar_timeout);
			document.getElementById("controlbar").style.display = "block";
			document.getElementById("controlbar").style.opacity = "1";
			document.getElementById("menubar-shadow").style.display = "none";
			controlbar_is_visible = 1;
		}
		else if(controlbar_is_visible && ((e.keyCode === 27 && active === "searchBox") || (active !== "searchBox" && e.pageY > 100))){
			document.getElementById("controlbar").style.opacity = "0";
			controlbar_timeout = window.setTimeout(function(){document.getElementById("controlbar").style.display = null;}, 500);
			document.getElementById("menubar-shadow").style.display = null;
			controlbar_is_visible = 0;
		}
	}
	
	function check_title(){
		if(document.getElementById("docex_titlediv").innerHTML !== document.title){
			document.getElementById("docex_titlediv").style.opacity = "0";
			window.setTimeout(function(){
				document.getElementById("docex_titlediv").innerHTML = document.title;
				document.getElementById("docex_titlediv").style.opacity = "1";
			},500);
		}
	}
	
	var savebutton_src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAHQSURBVFhHzZa9zcIwEIbtlAghEKxAS4dEzwLQIzEFDQMwAytQIGAAeiSaiIIGIVGwAP8V8OlOtj/HuQTHkMAjnRwb5/zyXi4Kv91uT6bBORdX6fJ8Bo5FPDH+BAExoNaMT0DlhTAJiJElglHGJ9DzyfC8cFH49XoNSYTNOubcBcoJc81KTFq8JWY8HrPlconXvV4Px1KphOPhcGC73Y4VCgXm+z6utVotlYsqiymG7CbYpIcNq9WKjUYjvAbBENPpVN1v5pTrOqQYk6ibXyEF2WIlJis83TZXB1wxz3V+ZjabDcZ6vcYol8us0+mw7XYrdgQxc1J5+eVysbZiMpmobrKlXq+zdrstZvE4iel2u2y/34vVMNVqFcfhcJhIjFOZ8vk8q1QqkZHL5TB0zJxU8PP5bO0MtCk4U6vV8L0SRbPZxHE+nytn4LBXOLV2sVhU/54KeAtDJMW5m5Ji5qTykmWiNgKz2QzL1O/3xUo8g8FAlenxeIjVf0JfB6fTyfqvg5jFYiFmdjQaDRRzv99xHvdFkEjMO0i348Rk9sxI4vKSznxaQBSmS06tnRakM9STnwahbjoejygGfsi6POZ5v1Um3ZlvlUeinMmqRNEw9gfQ8pSgoVZQeAAAAABJRU5ErkJggg==";
	
	var savebutton_hover_src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAdCAYAAAAgqdWEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAIVSURBVFhHzZfLjgFBFIZPDxJxCyGxYCWxkPAEHsDKip0NKwvxAN7AG/AgljZiT4KwEIkIG4mIWwihRx1V0jHFVPWMnvmSP3XprvLrU1XdR9ntdir8E9DMarWC2WwGp9OJdhuHxWKBYDAILpcLlO12qw4GAwiFQmC32+ktxrHZbGA8HkMkEoEPVVXxifyFEYLT6cTfJz7QDIGUz/Qb8OZlYtc/sPYNj4P1SAQhM4x8Pg+BQAC1WCxQl8sFtVwuod1uw2g0gmQyiTqfz/frItzN8P4NkwidTgeKxSLWW60WKpFI3Mc/zqkVQypMspBdWiqVaOt7pML0bv6nGW0MH8VjOByi+v0+yuv1QrVaxQXMgzcvE0P3mkmlUiiySLXK5XL0DnnMtJSiXq/DdDqlra+Ew2Es4/E4lqLoCpPD4QCfz/dUNpsNpYU3LxND6MloBxCazSY0Gg3a+ko6naY1OXTtJrfbfT+JeSKfA0Sy6N5NsvDmZWIo6/Va7fV6EIvFaNdzCoUC1Go1PFlFIN8omUwGyuXyy/dTt9uFaDQqZ6ZSqcBkMqEtMYihbDaLL02CoihYatFl5iewcLwyY9iaYbyaX+oE/olE0LW134VQmN4tBpoxm82w3++xw2iueRvmTgTlmreo5Pt1Pp/D8XjETiMhRvx+P3g8nlsSdzgc0CE7C4zEZDJhzma1Wm/pLS9+RkHOnZsU+AQ8X63UgZIW7wAAAABJRU5ErkJggg==";
})();