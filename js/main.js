var normal = getElement("nav-menu");
var reverse = getElement("nav-menu-left");
var icon = normal !== null ? normal : reverse;


function toggle() {
	// Toggle the "menu-open" % "menu-opn-left" classes to display/hide
	// the menu.
	var navRight = getElement("nav");
	var navLeft = getElement("nav-left");
	var nav = navRight !== null ? navRight : navLeft;

	var button = getElement("menu");
	var site = getElement("wrap");
	  
	if (nav.className == "menu-open" || nav.className == "menu-open-left") {
	  	nav.className = "";
	  	button.className = "";
	  	site.className = "";
	} 
	else if (reverse !== null) {
	  	nav.className += "menu-open-left";
	  	button.className += "btn-close";
	  	site.className += "fixed";
	  } 
	else {
	  	nav.className += "menu-open";
	  	button.className += "btn-close";
	  	site.className += "fixed";
	}
}



function getElement( id ){
	// A simple shorthand for document.getElementById
	// Useful to have cleaner and shorter code.
	return document.getElementById(id);
}

function parseArgs( parameter, value ){
	// Checks whether @parameter is defined; 
	// If it isn't, returns @value
	if ( typeof parameter === 'undefined' ){
		return value;
	}
	else {
		return parameter;
	}
}

function createElement(type, id, inner, parent){
	var element = document.createElement(type);
	if (id != undefined && id != ''){ element.id = id; }
	if (inner != undefined && inner != ''){ element.innerHTML = inner;}
	if (parent != undefined){ parent.appendChild(element);}
	return element;
}

function loadHTML( resource, async, method, postage, callback ){
	// Handles AJAX requests to html or plain text
	// 
	// The default call is a synchronous GET with no params or callback.
	// @resource: URL of the resource. It is the only required parameter.
	//            If it's a GET request, then it should include HTTP params as well.
	// @async: whether the call is synchronous ar asynchronous.
	// @method: the HTTP method
	// @postage: POST parameters. Only used in POST calls.
	// @callback: Callback function. Only used in async calls.
	
	
	var filename = resource;
	if ( typeof resource === 'undefined' ){
		console.error( 'No resource has been defined!' );
	}
	
	// Checks which arguments have been passed, and sets to default value
	// those that have been not.
	async = parseArgs( async, false );
	method = parseArgs( method, 'GET' );
	callback = parseArgs( callback, function(){
		if ( this.readyState == 4 ){
			if ( this.status == 200 ){
				console.log( this.responseText );
			}
		}
	});
	postage = parseArgs( postage, null );

	// Creates the xmlHTTP object
	var xmlhttp;
	if ( window.XMLHttpRequest ){
		xmlhttp = new XMLHttpRequest();
	}
	else {
		// IE support
		try {
			xmlhttp = new ActiveXObject( "Microsoft.XMLHTTP" );
		}
		catch (e){
			try {
				xmlhttp = new ActiveXObject( "Msxml2.XMLHTTP" );
			}
			catch (e){
				console.error(e);
			}
		}
	}
	

	// GET or POST
	if ( method == 'GET' ){
		xmlhttp.open( "GET",filename, async );
		xmlhttp.send();
	}
	else {
		xmlhttp.open( "POST", filename, async );
		xmlhttp.setRequestHeader( "Content-type","application/x-www-form-urlencoded" );
		xmlhttp.send( postage );
	}
	
	
	// Async or sync
	if ( async == true ){
		xmlhttp.onload = callback;
	}
	else {
		if ( xmlhttp.status == 200 ){
			return xmlhttp.responseText;
		}
	}
}

function getCookie(cookieName){
	var name = cookieName + '=';
    var ca = document.cookie.split(';');
    for ( var i = 0; i < ca.length; i++ ) {
        var c = ca[i];
        while ( c.charAt(0) == ' ' ) { 
			c = c.substring(1); 
		}
        if ( c.indexOf(name) == 0 ){ 
			return c.substring( name.length,c.length );
		}
    }
    return '';
}

function updatePage(json){
	// Updates the page with the post data that has been loaded through
	// AJAX.
	
	var postData = JSON.parse(json);
	var siteRoot = getCookie('site-root');
	
	// Update URL and document.title
	var url = siteRoot + postData.url;
	var title = postData.title + ' · A simple Jekyll theme';
	document.title = title;
	
	// Push the state if it's not a popevent.
	if ( !history.state || history.state.page != url ){
		history.pushState({ "page": url }, title, url);
	}
	
	// Clear the main.
	var main = document.getElementsByTagName('main')[0];
	main.innerHTML = '';
	
	// Pagination does not always exist.
	if ( document.getElementsByClassName('pagination')[0] ){
		getElement('container').removeChild( document.getElementsByClassName('pagination')[0] );
	}
	
	// Clears the header navigation elements when they exist.
	if ( getElement('post-next') ){
		getElement('header').removeChild(getElement('post-next'));
	}
	if ( getElement('post-prev') ){
		getElement('header').removeChild(getElement('post-prev'));
	}
	if ( document.querySelector('#header span') ){
		getElement('header').removeChild( document.querySelector('#header span') );
	}

	
	// Updates the page elements
	document.getElementsByTagName('h1')[0].innerHTML = postData.title;
	var article = createElement('article', 'post-page', '', main);
	var div = createElement('time', '', postData.date, article);
	div.dateTime = postData.date;
	div.className = 'by-line';
	div = createElement('div', '', postData.content, article)
	div.className = 'content';
	
	// Updates the header navigation
	var a;
	if ( postData.next != null ){
		a = createElement('a', 'post-next', '&laquo; ' + postData.next[1], getElement('header'));
		a.href = siteRoot + postData.next[0];
		a.title = 'Go to the next post'
		listenerAttacher( a );
	}
	if ( postData.previous != null && postData.next != null){
		createElement( 'span', '', ' - ', getElement('header') );
	}
	if ( postData.previous != null ){
		a = createElement('a', 'post-prev', postData.previous[1] + ' &raquo;', getElement('header'));
		a.href = siteRoot + postData.previous[0];
		a.title = 'Go to the previous post';
		listenerAttacher( a );
	}
}


function loadPost( resource ){
	// Loads post data through AJAX
	loadHTML( resource, true, 'GET', null,  function(){
		updatePage( this.responseText );
	});
}

function listenerAttacher( element ){
	// Adds a click listener to @element. 
	// NOTE: this has nothing to do with the Explorer function!
	element.addEventListener('click', function(e){
		e.preventDefault();
		loadPost( this.href +'.json' );
	}, 
	false);
}


(function(){
	// Init function - performs init tasks.
	
	
	if ( window.history && window.history.pushState ){
		// Adds the event listener for the menu
		if ( document.addEventListener && icon !== null ) {
			icon.addEventListener( 'click', function(e){ 
				e.preventDefault();
				toggle();
			}, false );
		} 
		else if (document.attachEvent && icon !== null ) {
			// IE support
			icon.attachEvent( 'onclick', function(e){
				e.preventDefault();
				toggle();
			});
		}
		
		// Sets a cookie with the site root. 
		// This actually sets the page loaded through HTTP as the site root. 
		var d = new Date();
		d.setTime(d.getTime() + (365*24*60*60));
		var expires = "expires="+d.toUTCString();
		document.cookie = "site-root=" + window.location.href + "; " + expires;
		
		// Adds the event listener to all elements that require it.
		// Also prevents hrefs to fire.
		var posts = document.querySelectorAll('.h2');
		for (var i = 0; i < posts.length; i++){
			listenerAttacher( posts[i] );
		}
		
		// Adds a popstate listener for backwards navigation.
		window.addEventListener('popstate', function(e){
			if ( e.state == null ){
				window.location = 'http://localhost/redmerald';
			}
			else {
				//console.log( 'popevent' );
				loadPost( e.state.page + '.json' );
			}
		}, false);
	}
	
	// Keyboard events
	window.addEventListener('keydown', function(e){
		if ( e.keyCode == 37){
			// Left arrow
			if ( getElement('post-next') ){
				loadPost( getElement('post-next').href + '.json' );
			}
		}
		else if ( e.keyCode == 39){
			// Right arrow
			if ( getElement('post-prev') ){
				loadPost( getElement('post-prev').href + '.json' );
			}
		}
	}, false);

})();
