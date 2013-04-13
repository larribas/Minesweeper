/*
	CREATED BY LORENZO ARRIBAS
	22/08/2011
*/

/* Global variables and constants */	
	var BLOCK_SIZE = 60; // The length in pixels one square is wide
	var gridSize = 10; // Measures of the grid
	var numberOfMines = 10; // Number of mines
	var flags = numberOfMines; // Number of flags
	var structure = []; // Holds the whole structure of the game
	var squaresToWin = gridSize * gridSize; // Hidden squares
	var firstTime = true;
	var int; // count-up timer
	
	var imgF = new Image(); // pre-cache flag icon
	imgF.src = "flag.png";

	var imgM = new Image(); // pre-cache mine icon
	imgM.src = "mine.png";
	
	
/* Draws the default grid and calls the settings modal dialog box */
	function initialise() {
		
		draw();
		showModal("settingsDiv");		
		
	}
	
/* Shows the info or settingsDiv modal box */
	function showModal(boxID) {
		
		var bg = document.getElementById("blackBG");
		var canvas = document.getElementById("minesweeper");
		var closeIcon = document.getElementById("closeI");
				
		// Transparent black background
		bg.style.position = "fixed";
		bg.style.display = "block";
		bg.style.zIndex = "1";
		bg.style.height = window.innerHeight + "px"; // Adjust to the current size of the window
		bg.style.width = window.innerWidth + "px";
		
	/* Enables the black background to fit the screen anytime */
		function whenResize() {				
				bg.style.height = window.innerHeight + "px"; // Adjust to the current size of the window
				bg.style.width = window.innerWidth + "px";							
			}			
		window.onresize = whenResize;		
		
			
		// Target one box or the other	
		var box = (boxID == "info")? document.getElementById("info") : document.getElementById("settingsDiv");
		
		// Refresh info about the current settings
		if(boxID == "info") {
			document.getElementById("playing").innerHTML = "Playing in a " + gridSize + "x" + gridSize + " grid, mined " + numberOfMines + " times.";
		}
		
		box.style.display = "block";
		box.style.zIndex = "2";
		box.style.height = (canvas.width < 400)? "400px" : (canvas.width - 110) + "px";
		box.style.width = box.style.height;
		
		// Exit button
		closeIcon.style.display = "block";
		closeIcon.style.zIndex = "3";
		closeIcon.style.top = "77px";
		closeIcon.style.left = (canvas.width < 400)? "485px" : (canvas.width - 25) + "px";
		
		
	}

/* Closes the current modal box */
	function closeModal() {		
	
		if(firstTime) { firstTime = false; settings("close"); return; }
		
			// targets and closes every possible combination of modal box			
			var bg = document.getElementById("blackBG");		
			var closeIcon = document.getElementById("closeI");
			var info = document.getElementById("info");
			var sd = document.getElementById("settingsDiv");
			
			
			bg.style.display = "none";
			bg.style.zIndex = "-1";
			
			closeIcon.style.display = "none";
			closeIcon.style.zIndex = "-1";
			
			info.style.display = "none";
			info.style.zIndex = "-1";
			
			sd.style.display = "none";
			sd.style.zIndex = "-1";	
		
	}
	
/* Sets the value of the global variables and starts the game */
	function settings(mode) {
		
		if(mode=="custom") { // set values as indicated in the form fields
			
			var sqList = document.forms[0].fSquare;
			
			BLOCK_SIZE = sqList.options[sqList.selectedIndex].value;
					
			gridSize = document.forms[0].fGrid.value;
			numberOfMines = document.forms[0].fMines.value;
			
			
		}
		else if(mode=="default") { // set values by default
			
			BLOCK_SIZE = 60;
			gridSize = 10;
			numberOfMines = 10;
			
		}
		
		// Initialize flags and squares counters
		flags = numberOfMines;
		squaresToWin = gridSize * gridSize;
		
		// Activate interaction with canvas
		addEvent(document.getElementById("minesweeper"),'click',handleClick);
		document.getElementById("minesweeper").oncontextmenu = function oncontextmenu(event) { flag(event); return false; };
		
		// Reset counter
		clearInterval(int);
		
		trackProgress();
		setCounter();
		draw();
		createStructure();
		buryMines();
		reckonMinesAround();
		closeModal();
	}
	
/* Checks if the move makes you win the game,
and refreshes the flags_left counter */
	function trackProgress() {
				
		if(squaresToWin == 0) {
			end("won");
		}
		
		document.getElementById("flags_left").innerHTML = flags + ((flags==1)? " flag left" : " flags left");
					
	}
	
/* Sets the count-up timer */
	function setCounter() {
		
		function display(element) { // display n<10 as 0n ( 1 as 01, ...)
			
			var s, m;
			
			s = (secs < 10)? "0" + secs : secs;
			m = (mins < 10)? "0" + mins : mins;
			
			element.innerHTML = m + ":" + s;
			
		}	
		
		function countup() {
			
			secs++;
			
			if(secs==60){
				mins++;
				secs = 0;
				
			}					
			
			display(document.getElementById("countup"));			
			
		}	
					
		var secs = 0;
		var mins	= 0;
		
		int = setInterval(countup,1000); // countup each second
					
	}
	
/* Draws the grid and sets the measures of the user interface */
	function draw() {
		
		var canvas = document.getElementById("minesweeper");
				
		canvas.width = gridSize * BLOCK_SIZE;
		canvas.height = canvas.width;
			
		
		var context = canvas.getContext("2d");
		context.globalAlpha = 1;		
		context.strokeStyle = "#000000";
		context.fillStyle = "#000000";
						
			
			for (var r = 0; r <= gridSize; r++) { // draws the rows of the grid
				
				context.beginPath()
				context.moveTo(0,r*BLOCK_SIZE);
				context.lineTo(canvas.width,r*BLOCK_SIZE);
				context.stroke();
				context.closePath();
				
			}
			
			for (var c = 0; c <= gridSize; c++) { // draws the columns of the grid
				context.beginPath()
				context.moveTo(c*BLOCK_SIZE,0);
				context.lineTo(c*BLOCK_SIZE,canvas.height);
				context.stroke();
				context.closePath();
				
			}
		
		/* Measures the buttons to the top of the canvas
		depending on the size of the grid */		
		document.getElementById("container").style.width = (canvas.width + 100) + "px";
		document.getElementById("flags_left").style.width = ((canvas.width/3)-(32)) + "px";
		document.getElementById("countup").style.width = document.getElementById("flags_left").style.width;
		document.getElementById("settings").style.width = document.getElementById("flags_left").style.width;
	
		
	}
	
/* Builds a structure to identify each block as a particular object with its own properties */
	function createStructure() {
		
		for (var r = 0; r < gridSize; r++) { // loops through the rows of the structure
				structure[r] = [];
				
					for (var c = 0; c < gridSize; c++) { // loops through the cells of each row
					
									structure[r][c] = { "x1": c*BLOCK_SIZE, // top-left coordinates
																			"y1": r*BLOCK_SIZE,
																																						
																			"mines": 0, // mined? not for the moment
																			"around": "before", // how many mines around? none for now
																																						
																			"state": "hidden" // all the squares are hidden when the game starts
																		};
						
					} 
					
			}
	}
	
/* Buries the specified number of mines randomly beneath the field */
	function buryMines() {
		
		
		/* Returns a number between 0 and 9 */
		function randomize () {
			
			return Math.round((Math.random()*(gridSize-1)));
			
		}
		
		var minesToBury = numberOfMines;
		
		while (minesToBury > 0) {
			
			var i = randomize();
			var j = randomize();
			
			if (structure[i][j]["mines"] == 0) {
				
				structure[i][j]["mines"] = 1;
				
				minesToBury--;								
				}
				
				continue;
		}
		
		
	}
	
/* Reckons the number of mines a square is surrounded by */
	function reckonMinesAround() {
		
		function countMines (cy,cx) {
						
			if((cx >= 0 && cy >= 0) && (cx < gridSize && cy < gridSize)) { // only if the passed square exists...
				
				if(structure[cy][cx]["mines"] == 1) {
					
					minesAround++;
				}
				
			}
						
		} // closing function countMines
		
		var minesAround;
		
		for(var r = 0; r < gridSize; r++) {		
			
			for(var c = 0; c < gridSize; c++) {				
				
				if(structure[r][c]["mines"] == 0) {	// only if the square is not mined...				
					
					minesAround = 0;
					
					countMines(r-1,c-1);
					countMines(r-1,c);
					countMines(r-1,c+1);
					countMines(r,c-1);
					countMines(r,c+1);
					countMines(r+1,c-1);
					countMines(r+1,c);
					countMines(r+1,c+1);
						
					structure[r][c]["around"] = minesAround;					
				
				}
			}
			
		}	// outer for loop (rows)
		
	}


/*
THE CODE ABOVE RESPONDS TO THE UI BUTTONS
THE ONE BELOW ANSWERS TO LEFT OR RIGHT CLICKS ON THE CANVAS ELEMENT
*/
		
/* Identifies the coordinates of a right click (as for the canvas element) and plays it */
	function handleClick(event) {
		
		var x = (event.layerX)? event.layerX : event.offsetX;
		var y = (event.layerY)? event.layerY : event.offsetY;
		
		var r = Math.floor(y/BLOCK_SIZE);
		var c = Math.floor(x/BLOCK_SIZE);
				
		play(c,r);
		
	}
		
/* Plays with the passed square */
	function play(px,py) {
	
		if((px >= 0 && py >= 0) && (px < gridSize && py < gridSize)) { // if the square asked for exists
	
			if(structure[py][px]["state"] == "hidden") { // and it is not yet unearthed nor flaged…
												
					if(structure[py][px]["around"] == 0) { // in case it is an empty cell
					
						reveal(px,py); // reveal it
											
						structure[py][px]["state"] = "unearthed";	// mark it as unearthed
								
						squaresToWin--; // (one less hidden square)
						
						//and reveal the contiguous squares
						play(px-1,py-1);
						play(px,py-1);
						play(px+1,py-1);
						play(px-1,py);
						play(px+1,py);
						play(px-1,py+1);
						play(px,py+1);
						play(px+1,py+1);
						
						
					}
					
					else if(structure[py][px]["around"] > 0) { // in case it has one or more mines around
						
						reveal(px,py);
						
						structure[py][px]["state"] = "unearthed";
						squaresToWin--;						
												
					}
				
					else { // in case it is mined
						
						var canvas = document.getElementById("minesweeper");
						var context = canvas.getContext("2d");
						
						/* Mark the one that has blown up with a red backgorund */
						context.beginPath();
						context.fillStyle = "#FF0000";
						context.fillRect((structure[py][px]["x1"]+1),(structure[py][px]["y1"]+1),(BLOCK_SIZE-2),(BLOCK_SIZE-2));
						context.closePath();						
						context.globalAlpha = 0.8;
																		
						reveal(px,py);
						context.globalAlpha = 0.6;
						
						structure[py][px]["state"] = "blown";
						
						end("lost"); // you have stepped on a mine and therefore the game is over
						
						
					}
				
				trackProgress(); // check if this movement is the one that makes you win
				
				
			}
		}	
	}
		
	
/* Reveals the passed square */	
	function reveal(rx,ry) {
		
		var canvas = document.getElementById("minesweeper");
		var context = canvas.getContext("2d");
			
			
			if(structure[ry][rx]["around"] == 0) { // empty square
			
				context.beginPath();
				context.fillStyle = "#E9E9E9";
				context.fillRect((structure[ry][rx]["x1"]+1),(structure[ry][rx]["y1"]+1),(BLOCK_SIZE-2),(BLOCK_SIZE-2));
				context.closePath();
				
			}
			
			else if(structure[ry][rx]["around"] > 0) { // number
					
				context.beginPath();
				context.fillStyle = "#000000";
				context.textAlign = "left";
				context.textBaseline = "top";
				context.font = (BLOCK_SIZE) + "px sans-serif";
				context.fillText((structure[ry][rx]["around"]+""),structure[ry][rx]["x1"]+(BLOCK_SIZE/5),structure[ry][rx]["y1"]);						
				context.closePath();
				
			}
			
			else { // mine
												
				context.beginPath();				
				context.drawImage(imgM,(structure[ry][rx]["x1"]+1),(structure[ry][rx]["y1"]+1),(BLOCK_SIZE-2),(BLOCK_SIZE-2));
				context.closePath();
				
			}		
	}
	
	
/* Handles a right click and tries to flag the square */		
	function flag(event) {
		
		// get coordinates
		var x = (event.layerX)? event.layerX : event.offsetX;
		var y = (event.layerY)? event.layerY : event.offsetY;
		
		// identify clicked square
		var r = Math.floor(y/BLOCK_SIZE);
		var c = Math.floor(x/BLOCK_SIZE);
		
		var canvas = document.getElementById("minesweeper");
		var context = canvas.getContext("2d");
		
		
		if((flags > 0) && (structure[r][c]["state"] == "hidden")) { // if you have a flag at hand, and the square is hidden
			
			// flag it!								
			context.beginPath();				
			context.drawImage(imgF,(structure[r][c]["x1"]+1),(structure[r][c]["y1"]+1),(BLOCK_SIZE-2),(BLOCK_SIZE-2));
			context.closePath();
			
			structure[r][c]["state"] = "flaged";
			flags--; // (one less flag)
			
			/* as you have to flag all the mines and uncover all the harmless squares,
			either flagging or unearthing one brings you closer to the victory */
			squaresToWin--;			
		}
		
		else if(structure[r][c]["state"] == "flaged") { // if it is already flaged
			
			// unflag it!
			context.clearRect((structure[r][c]["x1"]+1),(structure[r][c]["y1"]+1),(BLOCK_SIZE-2),(BLOCK_SIZE-2));
			
			structure[r][c]["state"] = "hidden";
			flags++; // (one more flag)
			
			squaresToWin++;
						
		}	
		
		trackProgress();
		
	}
		
/* Ends the game, either merrily or catastrophically */
	function end(how) {
	
		// remove interaction with the canvas element
		removeEvent(document.getElementById("minesweeper"),'click',handleClick);
		document.getElementById("minesweeper").oncontextmenu = function oncontextmenu(event) { return false; };
		
		// stop counter
		clearInterval(int);
						
		var canvas = document.getElementById("minesweeper");
		var context = canvas.getContext("2d");
		
		
		if(how == "won") { // in case of victory
		
			// print 'you won' over the field
			context.beginPath();
			context.globalAlpha = 0.6;
			context.fillStyle = "#0066FF";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.font = Math.round(canvas.width/3) + "px sans-serif";
			context.fillText("You",Math.round(canvas.width/2),Math.round(canvas.height
			/4));			
			context.fillText("Won",Math.round(canvas.width/2),Math.round(canvas.height
			*0.75));			
			context.closePath();
		
		}
		
		
		else if(how == "lost") { // in case of defeat
				
			// reveal the hidden squares
			for (var r = 0; r < gridSize; r++) {				
				for (var c = 0; c < gridSize; c++) {					
					if(structure[r][c]["state"] != "hidden"){
						continue;
					}					
					reveal(c,r);
				}		
			}
			
			// and print 'game over'	
			context.beginPath();
			context.fillStyle = "#990033";
			context.textAlign = "center";
			context.textBaseline = "middle";			
			context.font = Math.round(canvas.width/3) + "px sans-serif";
			context.fillText("Game",Math.round(canvas.width/2),Math.round(canvas.height
			/4));			
			context.fillText("Over",Math.round(canvas.width/2),Math.round(canvas.height
			*0.75));	
			context.closePath();
			
			
		}
		
	}
	
/* Shows chosen grid dimensions */
	function fG() {
		
		var e = document.forms[0].fGrid;
		
		document.getElementById("show_fGrid").innerHTML = e.value + "x" + e.value;
		document.forms[0].fMines["max"] = Math.round(e.value*e.value*0.2) + "";	
				
	}

/* Shows chosen number of mines */
	function fM() {
		
		var e = document.forms[0].fMines;			
								
		if(e.value > parseInt(e["max"])) {	
			e.value = e["max"];									
		}		
		else if(e.value < parseInt(e["min"])) {			
			e.value = e["min"];									
		}		
		
		document.getElementById("show_fMines").innerHTML = e.value;
	}
	
	
	

/* RESOURCES */

/* Adds cross-browser event handling */
function addEvent(element, kind, action) {
	
	if (element.addEventListener) { // w3c
		element.addEventListener(kind,action,false); }
	else if (element.attachEvent) { // ie
		element.attachEvent("on" + kind, action); }
	else { // default
		element["on" + kind] = action; }

}

/* Removes cross-browser event handling */
function removeEvent(element, kind, action) { 
	
	if (element.removeEventListener) {
		element.removeEventListener(kind, action, false); }
	else if (elem.detachEvent) {
		elem.detachEvent("on" + kind, action); }
	else {
		elem["on" + kind] = null; }
		
}

			
	/* When the page first loads
	trigger 'initialise' */
	addEvent(window,'load',initialise);