/*
Author:  Arvind Rao
Original release: ver 1-0 22/08/2011
Last major release: ver 1-0 22/08/2011
Last minor release: ver 1-0 22/08/2011
License: Creative Commons Attribution 3.0 Unported License http://creativecommons.org/licenses/by/3.0/
*/

var MOVE_LEFT=0;
var MOVE_UP=1;
var MOVE_RIGHT=2;
var MOVE_DOWN=3;

var LEFT_WALL=0;
var RIGHT_WALL=512;
var TOP_WALL=0;
var BOTTOM_WALL=512;

var oneStep;

var level;
var lineOrShape;
var posx;
var posy;
var xwidth;
var yheight;
var timeout;
var myTimer;
var timeElapsed;
var direction;
var red;
var green;
var blue;
var allowLife=false;
var dir;

var myCanvas;
var myContext;

var wipeoutSize;
var myTimer2;
var timeout2;

function init(){

  	level=1;
	lineOrShape=0;

	posx=0;
	posy=0;
	xwidth=0;
	yheight=0;
	timeout=10;//milliseconds
	timeElapsed=0;
	oneStep=512;

	red=0;
	green=0;
	blue=0;
	dir=0;

	wipeoutSize=8;
	timeout2=10;

	allowLife=false;

  	myCanvas = document.getElementById("planet");
  	if (myCanvas.getContext){
		myContext = myCanvas.getContext('2d');
		myContext.lineWidth=1;
		myContext.beginPath();
		myContext.moveTo(posx,posy);
		myContext.closePath();
	}
	else{
		document.getElementById("workBody").style.display="none";
		document.getElementById("altCanvas").style.display="block";
		document.getElementById("resumeAnim").style.display="none";
		document.getElementById("startAnim").style.display="none";
		document.getElementById("pauseAnim").style.display="none";
	}

}

function moveBot(direction)
{
	switch(direction){
		case MOVE_LEFT:{
			if (lineOrShape>0){
				//move left on x axis
				myContext.beginPath();
				myContext.moveTo(posx,posy);
				if (posx==LEFT_WALL){
					//if we hit the wall,do nothing
				}
				else{
					posx=(posx-oneStep>=LEFT_WALL)?(posx-oneStep):LEFT_WALL;
				}
				myContext.lineTo(posx,posy);
				myContext.stroke();
				myContext.closePath();
			}
			else{
				//move left on x axis, up on y axis
				myContext.beginPath();
				if (posx==LEFT_WALL || posy==TOP_WALL){
					//if we hit the wall,do nothing
				}
				else{
					xwidth=(posx-oneStep>=LEFT_WALL)?oneStep:posx-LEFT_WALL;
					yheight=(posy-oneStep>=TOP_WALL)?oneStep:posy-TOP_WALL;
					myContext.clearRect(posx,posy,-1*xwidth,-1*yheight);
					myContext.fillRect(posx,posy,-1*xwidth,-1*yheight);

					posx=(posx-oneStep>=LEFT_WALL)?(posx-oneStep):LEFT_WALL;
					posy=(posy-oneStep>=TOP_WALL)?(posy-oneStep):TOP_WALL;
				}
				myContext.closePath();
			}
		};break;
		case MOVE_RIGHT:{
			if (lineOrShape>0){
				//move right on x axis
				myContext.beginPath();
				myContext.moveTo(posx,posy);
				if (posx==RIGHT_WALL){
					//if we hit the wall,do nothing
				}
				else{
					posx=(posx+oneStep<=RIGHT_WALL)?(posx+oneStep):RIGHT_WALL;
				}
				myContext.lineTo(posx,posy);
				myContext.stroke();
				myContext.closePath();
			}
			else{
				//move right on x axis, down on y axis
				myContext.beginPath();
				if (posx==RIGHT_WALL || posy==BOTTOM_WALL){
					//if we hit the wall,do nothing
				}
				else{
					xwidth=(posx+oneStep<=RIGHT_WALL)?oneStep:RIGHT_WALL-posx;
					yheight=(posy+oneStep<=BOTTOM_WALL)?oneStep:BOTTOM_WALL-posy;
					myContext.clearRect(posx,posy,xwidth,yheight);
					myContext.fillRect(posx,posy,xwidth,yheight);

					posx=(posx+oneStep<=RIGHT_WALL)?(posx+oneStep):RIGHT_WALL;
					posy=(posy+oneStep<=BOTTOM_WALL)?(posy+oneStep):BOTTOM_WALL;
				}
				myContext.closePath();
			}

		};break;
		case MOVE_UP:{
			if (lineOrShape>0){
				//move up on y axis
				myContext.beginPath();
				myContext.moveTo(posx,posy);
				if (posy==TOP_WALL){
					//if we hit the wall,do nothing
				}
				else{
					posy=(posy-oneStep>=TOP_WALL)?(posy-oneStep):TOP_WALL;
				}
				myContext.lineTo(posx,posy);
				myContext.stroke();
				myContext.closePath();
			}
			else{
				//move up on y axis, right on x axis
				myContext.beginPath();
				if (posx==RIGHT_WALL || posy==TOP_WALL){
					//if we hit the wall,do nothing
				}
				else{
					xwidth=(posx+oneStep<=RIGHT_WALL)?oneStep:RIGHT_WALL-posx;
					yheight=(posy-oneStep>=TOP_WALL)?oneStep:posy-TOP_WALL;
					myContext.clearRect(posx,posy,xwidth,-1*yheight);
					myContext.fillRect(posx,posy,xwidth,-1*yheight);

					posx=(posx+oneStep<=RIGHT_WALL)?(posx+oneStep):RIGHT_WALL;
					posy=(posy-oneStep>=TOP_WALL)?(posy-oneStep):TOP_WALL;
				}
				myContext.closePath();
			}
		};break;
		case MOVE_DOWN:{
			if (lineOrShape>0){
				//move down on y axis
				myContext.beginPath();
				myContext.moveTo(posx,posy);
				if (posy==BOTTOM_WALL){
					//if we hit the wall,do nothing
				}
				else{
					posy=(posy+oneStep<=BOTTOM_WALL)?(posy+oneStep):BOTTOM_WALL;
				}
				myContext.lineTo(posx,posy);
				myContext.stroke();
				myContext.closePath();
			}
			else{
				//move down on y axis, left on x axis
				myContext.beginPath();
				if (posx==LEFT_WALL || posy==BOTTOM_WALL){
					//if we hit the wall,do nothing
				}
				else{
					xwidth=(posx-oneStep>=LEFT_WALL)?oneStep:posx-LEFT_WALL;
					yheight=(posy+oneStep<=BOTTOM_WALL)?oneStep:BOTTOM_WALL-posy;
					myContext.clearRect(posx,posy,-1*xwidth,yheight);
					myContext.fillRect(posx,posy,-1*xwidth,yheight);

					posx=(posx-oneStep>=LEFT_WALL)?(posx-oneStep):LEFT_WALL;
					posy=(posy+oneStep<=BOTTOM_WALL)?(posy+oneStep):BOTTOM_WALL;
				}
				myContext.closePath();
			}
		};break;


	};

}

function apocalypse()
{
	if (wipeoutSize<=RIGHT_WALL-LEFT_WALL+2){
		myContext.beginPath();
		myContext.clearRect(RIGHT_WALL/2-wipeoutSize/2,BOTTOM_WALL/2-wipeoutSize/2,wipeoutSize,wipeoutSize);
		myContext.closePath();
		wipeoutSize+=2;
		myTimer2=setTimeout("apocalypse()",timeout2);
	}
	else{
		clearTimeout(myTimer2);
		document.getElementById("resumeAnim").style.display="none";
		document.getElementById("startAnim").style.display="block";
		document.getElementById("pauseAnim").style.display="none";
	}
}

function evolve()
{
	switch(level){
		case 1:{
			lineOrShape=1;
		};break;
		case 2:{
			lineOrShape=1;
		};break;
		case 3:{
			if (allowLife){
				//alert(timeElapsed);
				lineOrShape=Math.floor(Math.random()*2);
			}
			else{
				lineOrShape=1;
			}
		};break;
		case 4:{
			if (allowLife){
				lineOrShape=Math.floor(Math.random()*4);
			}
			else{
				lineOrShape=1;
			}
		};break;
		case 5:{
			if (allowLife){
				lineOrShape=Math.floor(Math.random()*4);
			}
			else{
				lineOrShape=1;
			}
		};break;
		case 6:{
			if (allowLife){
				lineOrShape=Math.floor(Math.random()*16);
			}
			else{
				lineOrShape=1;
			}

		};break;
		case 7:{
			if (allowLife){
				lineOrShape=0;
			}
			else{
				lineOrShape=1;
			}

		};break;
	}

	switch(lineOrShape){
		case 0:{
			//shape
			myContext.strokeStyle='#000000';
			red=Math.floor(Math.random()*256);
			green=Math.floor(Math.random()*256);
			blue=Math.floor(Math.random()*256);
			myContext.fillStyle='rgb('+red+','+green+','+blue+')';
		};break;
		default:{
			//line
			switch(Math.floor(Math.random()*2)){
				case 0:{
					myContext.strokeStyle='#FFFFFF';
					};break;
				case 1:{
					myContext.strokeStyle='#000000';
					};break;
			}
		};break;
	}

	dir=Math.floor(Math.random()*(MOVE_DOWN-MOVE_LEFT+1));

	moveBot(dir);

	timeElapsed+=timeout;
	if (timeElapsed>1000 && timeElapsed<=2000){
		oneStep=256;
		level=2;
	}
	else if (timeElapsed>2000 && timeElapsed<=6000){
		oneStep=128;
		level=3;
		if (timeElapsed>5960){
			allowLife=true;
		}
		else{
			allowLife=false;
		}
	}
	else if (timeElapsed>6000 && timeElapsed<=12000){
		oneStep=64;
		level=4;
		if (timeElapsed>11800){
			allowLife=true;
		}
		else{
			allowLife=false;
		}
	}
	else if (timeElapsed>12000 && timeElapsed<=24000){
		oneStep=32;
		level=5;
		if (timeElapsed>23600){
			allowLife=true;
		}
		else{
			allowLife=false;
		}
	}
	else if (timeElapsed>24000 && timeElapsed<=48000){
		oneStep=16;
		level=6;
		if (timeElapsed>44000){
			allowLife=true;
		}
		else{
			allowLife=false;
		}
	}
	else if (timeElapsed>48000 && timeElapsed<=180000){
		oneStep=8;
		level=7;
		timeout=5;
		if (timeElapsed>60000){
			allowLife=true;
		}
		else{
			allowLife=false;
		}
	}
	else if (timeElapsed>180000){
		clearTimeout(myTimer);
		wipeoutSize=8;
		myTimer2=setTimeout("apocalypse()",5000);
		return false;
	}

	myTimer=setTimeout("evolve()",timeout);
}

function startAnimation()
{
	document.getElementById("resumeAnim").style.display="none";
	document.getElementById("startAnim").style.display="none";
	document.getElementById("pauseAnim").style.display="block";
	init();
	myTimer=setTimeout("evolve()",1000);

}

function pauseAnimation()
{
	document.getElementById("resumeAnim").style.display="block";
	document.getElementById("startAnim").style.display="none";
	document.getElementById("pauseAnim").style.display="none";
	clearTimeout(myTimer);
	clearTimeout(myTimer2);

}

function resumeAnimation()
{
	document.getElementById("resumeAnim").style.display="none";
	document.getElementById("startAnim").style.display="none";
	document.getElementById("pauseAnim").style.display="block";
	if (timeElapsed<=180000){
		myTimer=setTimeout("evolve()",timeout);
	}
	else if (timeElapsed>180000){
		myTimer2=setTimeout("apocalypse()",timeout2);
	}
}