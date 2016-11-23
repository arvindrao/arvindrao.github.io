/*
Author:  Arvind Rao
Original release: ver 1-0 13/08/2011
Last major release: ver 1-0 13/08/2011
Last minor release: ver 1-1 18/08/2011
License: Creative Commons Attribution 3.0 Unported License http://creativecommons.org/licenses/by/3.0/
*/

var bid=0;
var ask=0;

var newGame=0;

var dayVol=0;
var dayVWAP=0;
var dayTradeValue=0;
var tradeTimer;

var timeElapsed=0;
var botSide;
var tradeVol;
var tradeValue;
var lastTradeTime;
var lastPrice;

var lastVol;
var openPrice=0;
var closePrice;
var highPrice;
var lowPrice;
var changeFromClose;
var changeFromClosePercent;
var row;
var cell;
var cash=0;
var mktValue=0;
var cost=0;
var position=0;
var unrealizedGain=0;
var unrealizedGainPercent=0;
var realizedGain=0;
var realizedGainPercent=0;
var origRealizedGain=0;

var longPosition=0;
var longCash=0;
var shortPosition=0;
var shortCash=0;
var longAvgPx=0;
var shortAvgPx=0;

var NO_ACTIVITY_TIMEOUT=300; //in seconds
var noActivityTimer=NO_ACTIVITY_TIMEOUT;

var MIN_USR_QTY=1;
var MAX_USR_QTY=40;
var MAX_USR_POS=200;

//Bot buys or sells a large block
var MIN_BLOCK_BOT_QTY=50;
var MAX_BLOCK_BOT_QTY=100;

var MIN_NO_BOT_QTY=1;
var MAX_NO_BOT_QTY=10;

//Bot reacts to news
var MIN_NEWS_BOT_QTY=50;
var MAX_NEWS_BOT_QTY=100;

var MIN_BITE=5;
var MAX_BITE=10;

var LOT_SIZE=100;
var TICK_SIZE=1;
var MIN_ORD_BK_LOTS=10;
var MAX_ORD_BK_LOTS=50;
var MIN_PRICE=100;
var MAX_PRICE=200;
var SPREAD=1.00;

var MAX_CASH=1000000;
var MAX_SHORT_POSITION=500000;
var MAX_STOCK_BORROW=5000;

var DELAY=5000;//milliseconds
var tradeDelay=DELAY;

var botSellCount=0;
var botBuyCount=0;

var tradeHistory;

var bot=0;
var prevBot=0;

var NO_BOT=0;
var BLOCK_BOT=1;
var NEWS_BOT=2;

var blockSize=0;
var biteSize=0;

var OB_QUEUE_SIZE=5;

var	buyQueuePrice=new Array(OB_QUEUE_SIZE);
var	sellQueuePrice=new Array(OB_QUEUE_SIZE);
var	buyQueueSize=new Array(OB_QUEUE_SIZE);
var	sellQueueSize=new Array(OB_QUEUE_SIZE);

var chatBuddy=["Joe: ","Sarah: ","Andy: "];

var chattingWith;

var newsCountry=["US","Japan","Germany","China","UK"];
var newsCountryPositiveData=[
	"business confidence at highest level in 3 years",
	"manufacturing index rises for 2nd successive quarter",
	"industrial production numbers beat expectations",
	"consumer spending unexpectedly rises",
	"announces tax incentives to stimulate growth"
	];
var newsCountryNegativeData=[
	"business confidence at lowest level in 3 years",
	"manufacturing index falls for 2nd successive quarter",
	"industrial production numbers disappoint",
	"consumer spending unexpectedly falls",
	"announces tax increases to cut deficit"
	];
var newsCompanyPositiveData=[
	"Hypothetical Systems quarterly revenue up 30%",
	"Arandom Corp in discussions to acquire Hypothetical Systems"
	];
var newsCompanyNegativeData=[
	"Hypothetical Systems quarterly revenue down 10%",
	"Hypothetical Systems in discussions to acquire Somefake Corp"
	];

var newsType;
var newsSign;

var changeSign="+";
var unrealizedGainSign="+";
var realizedGainSign="+";

var newsFlash;


function updateTradeStats()
{
	if (lastPrice>highPrice){
		highPrice=lastPrice;
		document.getElementById("highPrice").innerHTML=highPrice.toFixed(2);
	}
	else if (lastPrice<lowPrice){
		lowPrice=lastPrice;
		document.getElementById("lowPrice").innerHTML=lowPrice.toFixed(2);
	}

	dayTradeValue=dayTradeValue+tradeValue;
	dayVol=dayVol+tradeVol;
	dayVWAP=dayTradeValue/dayVol;

	changeFromClose=lastPrice-closePrice;
	changeFromClosePercent=(changeFromClose/closePrice)*100;

	if (changeFromClose>=0){
		changeSign="+";
		document.getElementById("changeFromClose").style.color='#70D400';
	}
	else{
		changeSign="";
		document.getElementById("changeFromClose").style.color='#FF5738';
	}

	document.getElementById("changeFromClose").innerHTML=changeSign+changeFromClose.toFixed(2)+" ("+changeSign+changeFromClosePercent.toFixed(2)+"%)";
	document.getElementById("lastTradePrice").innerHTML=lastPrice.toFixed(2);
	document.getElementById("lastTradeVol").innerHTML=lastVol;
	document.getElementById("dayVWAP").innerHTML=dayVWAP.toFixed(2);
	document.getElementById("dayVol").innerHTML=dayVol;

	if (longPosition>0){
		//player is long
		mktValue=longPosition*lastPrice;
		unrealizedGain=mktValue-(longPosition*longAvgPx);
		unrealizedGainPercent=(unrealizedGain/(longPosition*longAvgPx))*100;
	}
	else if (shortPosition>0){
		//player is short
		mktValue=shortPosition*lastPrice;
		unrealizedGain=(shortPosition*shortAvgPx)-mktValue;
		unrealizedGainPercent=(unrealizedGain/(shortPosition*shortAvgPx))*100;
	}
	else{
		//player is flat
		mktValue=0;
		unrealizedGain=0;
		unrealizedGainPercent=0;
	}
	document.getElementById("myPosition").innerHTML=longPosition-shortPosition;
	document.getElementById("myMktValue").innerHTML=mktValue.toFixed(2);
	if(unrealizedGain>=0){
		unrealizedGainSign="+";
		document.getElementById("myUnrealizedGain").style.color='#70D400';
	}
	else{
		unrealizedGainSign="";
		document.getElementById("myUnrealizedGain").style.color='#FF5738';
	}

	document.getElementById("myUnrealizedGain").innerHTML=unrealizedGainSign+unrealizedGain.toFixed(2)+" ("+unrealizedGainSign+unrealizedGainPercent.toFixed(2)+"%)";

}

function generateTradeActivity()
{

	//return false;
	prevBot=bot;

	if (blockSize<=0 || prevBot==NO_BOT){

		//if price is falling to MIN_PRICE, provide support
		if (lastPrice<MIN_PRICE+5){
			bot=BLOCK_BOT;
			//pick a chat buddy
			chattingWith=Math.floor(Math.random()*3);
			//pick direction
			botSide="B";
			document.getElementById("alerts").innerHTML=chatBuddy[chattingWith]+"should see support near "+MIN_PRICE;
			document.getElementById("newsTicker").innerHTML="";

			blockSize=MAX_BLOCK_BOT_QTY*LOT_SIZE;
			biteSize=MAX_BITE*LOT_SIZE;
		}
		else{
			//pick a new bot
			//one of five outcomes, more bias to news
			bot=Math.floor(Math.random()*5);

			switch (bot) {

				case NO_BOT:{
					//20% probability
					//random trade, no strategy
					//pick a size between MIN_NO_BOT_QTY and MAX_NO_BOT_QTY
					blockSize=(MIN_NO_BOT_QTY+Math.floor(Math.random()*(MAX_NO_BOT_QTY-MIN_NO_BOT_QTY+1)))*LOT_SIZE;
					biteSize=blockSize;

					//pick direction
					if (Math.floor(Math.random()*2)==0) {
						botSide="B";
					}
					else {
						botSide="S";
					}
					document.getElementById("newsTicker").innerHTML="";
					document.getElementById("alerts").innerHTML="";
				};
				break;

				case BLOCK_BOT:{
					//20% probability
					//have a large block to trade
					//pick a size between MIN_BLOCK_BOT_QTY and MAX_BLOCK_BOT_QTY
					blockSize=(MIN_BLOCK_BOT_QTY+Math.floor(Math.random()*(MAX_BLOCK_BOT_QTY-MIN_BLOCK_BOT_QTY+1)))*LOT_SIZE;
					//pick a order size between MIN_BITE and MAX_BITE
					biteSize=(MIN_BITE+Math.floor(Math.random()*(MAX_BITE-MIN_BITE+1)))*LOT_SIZE;

					//pick a chat buddy
					chattingWith=Math.floor(Math.random()*3);
					//pick direction
					if (Math.floor(Math.random()*2)==0) {
						botSide="B";
						document.getElementById("alerts").innerHTML=chatBuddy[chattingWith]+"big buyer out there?";
					}
					else {
						botSide="S";
						document.getElementById("alerts").innerHTML=chatBuddy[chattingWith]+"big seller out there?";
					}
					document.getElementById("newsTicker").innerHTML="";
				};
				break;

				default:{
					//60% probability
					//news bot
					//react to news flow

					newsType=Math.floor(Math.random()*2);
					newsSign=Math.floor(Math.random()*2);
					newsFlash="";
					if (newsType==0){
						//country news
						//pick a country
						newsFlash=newsFlash+newsCountry[Math.floor(Math.random()*5)];
						if (newsSign==0){
							//pick positive news
							newsFlash=newsFlash+" "+newsCountryPositiveData[Math.floor(Math.random()*5)];
							botSide="B";
						}
						else{
							//pick negative news
							newsFlash=newsFlash+" "+newsCountryNegativeData[Math.floor(Math.random()*5)];
							botSide="S";
						}
					}
					else{
						//company news
						if (newsSign==0){
							//pick positive news
							newsFlash=newsFlash+newsCompanyPositiveData[Math.floor(Math.random()*2)];
							botSide="B";
						}
						else{
							//pick negative news
							newsFlash=newsFlash+newsCompanyNegativeData[Math.floor(Math.random()*2)];
							botSide="S";
						}
					}
					document.getElementById("newsTicker").innerHTML=newsFlash;
					document.getElementById("alerts").innerHTML="";

					//pick a size between MIN_NEWS_BOT_QTY and MAX_NEWS_BOT_QTY
					blockSize=(MIN_NEWS_BOT_QTY+Math.floor(Math.random()*(MAX_NEWS_BOT_QTY-MIN_NEWS_BOT_QTY+1)))*LOT_SIZE;

					//pick a order size between MIN_BITE and MAX_BITE
					biteSize=(MIN_BITE+Math.floor(Math.random()*(MAX_BITE-MIN_BITE+1)))*LOT_SIZE;


				};
			};
		}

	}

	//alert(prevBot+";"+bot+";"+botSide+";"+blockSize+";"+biteSize);

	tradeVol = biteSize;
	tradeValue=0;
	lastTradeTime=new Date();

	//side="B";

	if (botSide=="B"){
		processBuy("BOT");
		botBuyCount++;
	}
	else if (botSide=="S"){
		processSell("BOT");
		botSellCount++;
	}

	blockSize=blockSize-biteSize;
	updateTradeStats();

	timeElapsed=timeElapsed+(tradeDelay/1000);
	if (timeElapsed>=300 && timeElapsed<600){
		tradeDelay=4000;
	}
	else if (timeElapsed>=600 && timeElapsed<900){
		tradeDelay=3000;
	}
	else if (timeElapsed>=900 && timeElapsed<1200){
		tradeDelay=2000;
	}
	else if (timeElapsed>=1200){
		tradeDelay=1000;
	}

	noActivityTimer--;
	if (noActivityTimer>0){
		tradeTimer=setTimeout("generateTradeActivity()",tradeDelay);
	}
	else {
		pauseGame();
	}
}

function processBuy(traderId){
	var i=0;
	var temp=tradeVol;
	var newSeedPrice=0;

	//take out tradeVol shares from sell queue
	while(temp>0 && i<OB_QUEUE_SIZE){
		if (temp>=sellQueueSize[i]){
			temp=temp-sellQueueSize[i];
			tradeValue=tradeValue+(sellQueueSize[i]*sellQueuePrice[i]);
			lastVol=sellQueueSize[i];
			sellQueueSize[i]=0;
			lastPrice=sellQueuePrice[i];
			newSeedPrice=lastPrice;
		}
		else if (temp<sellQueueSize[i]){
			tradeValue=tradeValue+(temp*sellQueuePrice[i]);
			lastVol=temp;
			sellQueueSize[i]=sellQueueSize[i]-temp;
			temp=0;
			lastPrice=sellQueuePrice[i];
		}

		document.getElementById("askVol"+i).innerHTML=sellQueueSize[i];

		if (lastVol>0){
			document.getElementById("trades").deleteRow(1);
			row=document.getElementById("trades").insertRow(-1);
			row.insertCell(0).innerHTML=("0"+lastTradeTime.getHours()).slice(-2)+":"+("0"+lastTradeTime.getMinutes()).slice(-2)+":"+("0"+lastTradeTime.getSeconds()).slice(-2);
			row.insertCell(1).innerHTML=lastVol;
			row.insertCell(2).innerHTML=lastPrice.toFixed(2);
			row.insertCell(3).innerHTML=traderId;


			if (traderId=="YOU"){
				//update positions if this is player's trade
				if (shortPosition>0){
					//player is short, try to close out as much of this position as possible
					if (shortPosition>lastVol){
						realizedGain=realizedGain+(shortAvgPx*lastVol - lastPrice*lastVol);
						if (realizedGain>=0){
							document.getElementById("myRealizedGain").style.color='#70D400';
							document.getElementById("myRealizedGain").innerHTML="+"+realizedGain.toFixed(2);
						}
						else{
							document.getElementById("myRealizedGain").style.color='#FF5738';
							document.getElementById("myRealizedGain").innerHTML=realizedGain.toFixed(2);
						}

						shortPosition=shortPosition-lastVol;
						shortCash=shortCash-(lastVol*lastPrice);
					}
					else{
						shortCash=shortCash-(shortPosition*lastPrice);
						longPosition=lastVol-shortPosition;
						shortAvgPx=0;
						longAvgPx=lastPrice;
						shortPosition=0;
						longCash=longCash-(longPosition*lastPrice);
						//calculate gain as position closed out
						realizedGain=origRealizedGain+shortCash;
						if (realizedGain>=0){
							document.getElementById("myRealizedGain").style.color='#70D400';
							document.getElementById("myRealizedGain").innerHTML="+"+realizedGain.toFixed(2);
						}
						else{
							document.getElementById("myRealizedGain").style.color='#FF5738';
							document.getElementById("myRealizedGain").innerHTML=realizedGain.toFixed(2);
						}


						origRealizedGain=realizedGain;
						shortCash=0;
					}

				}
				else{
					//player is flat or long
					shortAvgPx=0;
					longAvgPx=(((longAvgPx*longPosition)+(lastVol*lastPrice))/(longPosition+lastVol)).toFixed(2);
					longPosition=longPosition+lastVol;
					longCash=longCash-(lastVol*lastPrice);
					origRealizedGain=realizedGain;
				}


			}

		}
		i++;
	}

	if (traderId=="YOU"){
		//update player's order book
		document.getElementById("playerOrders").deleteRow(1);
		row=document.getElementById("playerOrders").insertRow(-1);
		row.insertCell(0).innerHTML=("0"+lastTradeTime.getHours()).slice(-2)+":"+("0"+lastTradeTime.getMinutes()).slice(-2)+":"+("0"+lastTradeTime.getSeconds()).slice(-2);
		row.insertCell(1).innerHTML="B";
		row.insertCell(2).innerHTML=tradeVol;
		row.insertCell(3).innerHTML=tradeVol-temp;
		row.insertCell(4).innerHTML=(tradeValue/tradeVol).toFixed(2);

	}


	if (newSeedPrice!=0){
		//Move price up
		//Generate bids
		for (i=0;i<OB_QUEUE_SIZE;i++){
			buyQueuePrice[i]=newSeedPrice-i;
			document.getElementById("bidPrice"+i).innerHTML=buyQueuePrice[i].toFixed(2);
		}

		//Generate asks
		for (i=0;i<OB_QUEUE_SIZE;i++){
			sellQueuePrice[i]=newSeedPrice + SPREAD+ i;
			document.getElementById("askPrice"+i).innerHTML=sellQueuePrice[i].toFixed(2);
		}

		//Generate ask vols
		for (i=0;i<OB_QUEUE_SIZE;i++){
			//sellQueueSize[i]=(MAX_ORD_BK_LOTS-(Math.floor(Math.random()*(MIN_ORD_BK_LOTS+1))))*LOT_SIZE;
			sellQueueSize[i]=(MIN_ORD_BK_LOTS+Math.floor(Math.random()*(MAX_ORD_BK_LOTS-MIN_ORD_BK_LOTS+1)))*LOT_SIZE;
			document.getElementById("askVol"+i).innerHTML=sellQueueSize[i];
		}
	}

}

function processSell(traderId){
	var i=0;
	var temp=tradeVol;
	var newSeedPrice=0;

	//take out tradeVol shares from buy queue
	while(temp>0 && i<OB_QUEUE_SIZE){
		if (temp>=buyQueueSize[i]){
			temp=temp-buyQueueSize[i];
			tradeValue=tradeValue+(buyQueueSize[i]*buyQueuePrice[i]);
			lastVol=buyQueueSize[i];
			buyQueueSize[i]=0;
			lastPrice=buyQueuePrice[i];
			newSeedPrice=lastPrice;
		}
		else if (temp<buyQueueSize[i]){
			tradeValue=tradeValue+(temp*buyQueuePrice[i]);
			lastVol=temp;
			buyQueueSize[i]=buyQueueSize[i]-temp;
			temp=0;
			lastPrice=buyQueuePrice[i];
		}
		document.getElementById("bidVol"+i).innerHTML=buyQueueSize[i];

		if (lastVol>0){
			document.getElementById("trades").deleteRow(1);
			row=document.getElementById("trades").insertRow(-1);
			row.insertCell(0).innerHTML=("0"+lastTradeTime.getHours()).slice(-2)+":"+("0"+lastTradeTime.getMinutes()).slice(-2)+":"+("0"+lastTradeTime.getSeconds()).slice(-2);
			row.insertCell(1).innerHTML=lastVol;
			row.insertCell(2).innerHTML=lastPrice.toFixed(2);
			row.insertCell(3).innerHTML=traderId;

			//update positions if this is player's trade
			if (traderId=="YOU"){
				if (longPosition>0){
					//player is long, try to close out as much of this position as possible
					if (longPosition>lastVol){
						realizedGain=realizedGain+(lastPrice*lastVol - longAvgPx*lastVol);
						if (realizedGain>=0){
							document.getElementById("myRealizedGain").style.color='#70D400';
							document.getElementById("myRealizedGain").innerHTML="+"+realizedGain.toFixed(2);
						}
						else{
							document.getElementById("myRealizedGain").style.color='#FF5738';
							document.getElementById("myRealizedGain").innerHTML=realizedGain.toFixed(2);
						}

						longPosition=longPosition-lastVol;
						longCash=longCash+(lastVol*lastPrice);
					}
					else{
						longCash=longCash+(longPosition*lastPrice);
						shortPosition=lastVol-longPosition;
						longAvgPx=0;
						shortAvgPx=lastPrice;
						longPosition=0;
						shortCash=shortCash+(shortPosition*lastPrice);
						//calculate gain as position closed out
						realizedGain=origRealizedGain+longCash;
						if (realizedGain>=0){
							document.getElementById("myRealizedGain").style.color='#70D400';
							document.getElementById("myRealizedGain").innerHTML="+"+realizedGain.toFixed(2);
						}
						else{
							document.getElementById("myRealizedGain").style.color='#FF5738';
							document.getElementById("myRealizedGain").innerHTML=realizedGain.toFixed(2);
						}

						origRealizedGain=realizedGain;
						longCash=0;
					}
				}
				else{
					//player is flat or short
					longAvgPx=0;
					shortAvgPx=(((shortAvgPx*shortPosition)+(lastVol*lastPrice))/(shortPosition+lastVol)).toFixed(2);
					shortPosition=shortPosition+lastVol;
					shortCash=shortCash+(lastVol*lastPrice);
					origRealizedGain=realizedGain;
				}

			}

		}
		i++;
	}

	if (traderId=="YOU"){
		//update player's order book
		document.getElementById("playerOrders").deleteRow(1);
		row=document.getElementById("playerOrders").insertRow(-1);
		row.insertCell(0).innerHTML=("0"+lastTradeTime.getHours()).slice(-2)+":"+("0"+lastTradeTime.getMinutes()).slice(-2)+":"+("0"+lastTradeTime.getSeconds()).slice(-2);
		row.insertCell(1).innerHTML="S";
		row.insertCell(2).innerHTML=tradeVol;
		row.insertCell(3).innerHTML=tradeVol-temp;
		row.insertCell(4).innerHTML=(tradeValue/tradeVol).toFixed(2);

	}

	if (newSeedPrice!=0){
		//Move price down
		//Generate asks
		for (i=0;i<OB_QUEUE_SIZE;i++){
			sellQueuePrice[i]=newSeedPrice+i;
			document.getElementById("askPrice"+i).innerHTML=sellQueuePrice[i].toFixed(2);
		}

		//Generate bids
		for (i=0;i<OB_QUEUE_SIZE;i++){
			buyQueuePrice[i]=newSeedPrice - SPREAD - i;
			document.getElementById("bidPrice"+i).innerHTML=buyQueuePrice[i].toFixed(2);
		}

		//Generate bid vols
		for (i=0;i<OB_QUEUE_SIZE;i++){
			//buyQueueSize[i]=(MAX_ORD_BK_LOTS-(Math.floor(Math.random()*(MIN_ORD_BK_LOTS+1))))*LOT_SIZE;
			buyQueueSize[i]=(MIN_ORD_BK_LOTS+Math.floor(Math.random()*(MAX_ORD_BK_LOTS-MIN_ORD_BK_LOTS+1)))*LOT_SIZE;
			document.getElementById("bidVol"+i).innerHTML=buyQueueSize[i];
		}
	}

}

function initializeOrderBook()
{

	bid=0;
	ask=0;
	tradeTimer=null;
	timeElapsed=0;
	tradeVol=0;
	tradeValue=0;

	noActivityTimer=NO_ACTIVITY_TIMEOUT;
	tradeDelay=DELAY;
	botSellCount=0;
	botBuyCount=0;

	bot=0;
	prevBot=0;
	blockSize=0;
	biteSize=0;

	var seedBidPrice = MAX_PRICE-(Math.floor(Math.random()*(MIN_PRICE+1)));
	var priceFloor=Math.floor(seedBidPrice/2);
	var priceCeil=seedBidPrice+priceFloor;
	newSeedPrice=seedBidPrice;

	//open flat
	closePrice=seedBidPrice;
	openPrice=seedBidPrice;

	document.getElementById("closePrice").innerHTML=closePrice.toFixed(2);
	document.getElementById("tickSize").innerHTML=TICK_SIZE.toFixed(2);
	document.getElementById("lotSize").innerHTML=LOT_SIZE;

	//First trade (dummy)
	lastTradeTime=new Date();
	lastPrice=openPrice;

	lastVol=LOT_SIZE;
	dayTradeValue=LOT_SIZE*openPrice;
	dayVol=LOT_SIZE;
	dayVWAP=dayTradeValue/dayVol;
	highPrice=lastPrice;
	lowPrice=lastPrice;
	changeFromClose=lastPrice-closePrice;
	changeFromClosePercent=(changeFromClose/closePrice)*100;

	if (changeFromClose>=0){
		changeSign="+";
	}
	else{
		changeSign="";
	}

	document.getElementById("changeFromClose").innerHTML=changeSign+changeFromClose.toFixed(2)+" ("+changeSign+changeFromClosePercent.toFixed(2)+"%)";
	document.getElementById("highPrice").innerHTML=highPrice.toFixed(2);
	document.getElementById("lowPrice").innerHTML=lowPrice.toFixed(2);
	document.getElementById("openPrice").innerHTML=openPrice.toFixed(2);
	document.getElementById("lastTradePrice").innerHTML=lastPrice.toFixed(2);
	document.getElementById("lastTradeVol").innerHTML=lastVol;
	document.getElementById("dayVWAP").innerHTML=dayVWAP.toFixed(2);
	document.getElementById("dayVol").innerHTML=dayVol;

	var i=0;

	//delete all old trades, in case game is being restarted
	for (i=1;i<=11;i++){
		document.getElementById("trades").deleteRow(1);
		row=document.getElementById("trades").insertRow(-1);
		row.insertCell(0).innerHTML="-";
		row.insertCell(1).innerHTML="";
		row.insertCell(2).innerHTML="";
		row.insertCell(3).innerHTML="";
	}

	document.getElementById("trades").deleteRow(1);
	row=document.getElementById("trades").insertRow(-1);
	row.insertCell(0).innerHTML=("0"+lastTradeTime.getHours()).slice(-2)+":"+("0"+lastTradeTime.getMinutes()).slice(-2)+":"+("0"+lastTradeTime.getSeconds()).slice(-2);
	row.insertCell(1).innerHTML=lastVol;
	row.insertCell(2).innerHTML=lastPrice.toFixed(2);
	row.insertCell(3).innerHTML="BOT";


	//alert("resetting game, random bid price:"+seedBidPrice);


	//Generate bids
	for (i=0;i<OB_QUEUE_SIZE;i++){
		buyQueuePrice[i]=seedBidPrice - i;
		document.getElementById("bidPrice"+i).innerHTML=buyQueuePrice[i].toFixed(2);
	}

	//Generate bid vols
	for (i=0;i<OB_QUEUE_SIZE;i++){
		//orderBook["bidVol"+i]=(MAX_ORD_BK_LOTS-(Math.floor(Math.random()*(MIN_ORD_BK_LOTS+1))))*LOT_SIZE;
		buyQueueSize[i]=(MIN_ORD_BK_LOTS+Math.floor(Math.random()*(MAX_ORD_BK_LOTS-MIN_ORD_BK_LOTS+1)))*LOT_SIZE;
		document.getElementById("bidVol"+i).innerHTML=buyQueueSize[i];
	}

	//Generate offers
	var seedAskPrice = seedBidPrice+SPREAD;

	for (i=0;i<OB_QUEUE_SIZE;i++){
		sellQueuePrice[i]=seedAskPrice + i;
		document.getElementById("askPrice"+i).innerHTML=sellQueuePrice[i].toFixed(2);
	}

	//Generate ask vols
	for (i=0;i<OB_QUEUE_SIZE;i++){
		//sellQueueSize[i]=(MAX_ORD_BK_LOTS-(Math.floor(Math.random()*(MIN_ORD_BK_LOTS+1))))*LOT_SIZE;
		sellQueueSize[i]=(MIN_ORD_BK_LOTS+Math.floor(Math.random()*(MAX_ORD_BK_LOTS-MIN_ORD_BK_LOTS+1)))*LOT_SIZE;
		document.getElementById("askVol"+i).innerHTML=sellQueueSize[i];
	}
}

function initializePlayer()
{
	cash=0;
	mktValue=0;
	cost=0;
	position=0;
	unrealizedGain=0;
	unrealizedGainPercent=0;
	realizedGain=0;
	realizedGainPercent=0;
	origRealizedGain=0;

	longPosition=0;
	longCash=0;
	shortPosition=0;
	shortCash=0;
	longAvgPx=0;
	shortAvgPx=0;

	changeSign="+";
	unrealizedGainSign="+";
	realizedGainSign="+";

	document.getElementById("myMktValue").innerHTML=Number(0).toFixed(2);
	document.getElementById("myUnrealizedGain").innerHTML="+0.00 (+0.00%)";
	document.getElementById("myPosition").innerHTML=0;
	document.getElementById("myRealizedGain").innerHTML="+0.00";

	var i=0;

	//delete all old orders, in case game is being restarted
	for (i=1;i<=5;i++){
		document.getElementById("playerOrders").deleteRow(1);
		row=document.getElementById("playerOrders").insertRow(-1);
		row.insertCell(0).innerHTML="-";
		row.insertCell(1).innerHTML="";
		row.insertCell(2).innerHTML="";
		row.insertCell(3).innerHTML="";
	}

}

function resumeGame()
{
	noActivityTimer=NO_ACTIVITY_TIMEOUT;
	document.getElementById("resumeGame").style.display="none";
	//document.getElementById("startNewGame").style.display="none";
	document.getElementById("pauseGame").style.display="block";
	document.getElementById("helpGame").style.display="block";
	document.getElementById("alerts").innerHTML="";
	document.getElementById("helpPage").className="below";
	document.getElementById("mainPage").className="above";
	document.getElementById("bButton").disabled="";
	document.getElementById("sButton").disabled="";

	document.getElementById("finePrint").style.display="none";
	document.getElementById("infoMsg").style.display="inline";

	tradeTimer=setTimeout("generateTradeActivity()",tradeDelay);
}

function startNewGame()
{
	if (newGame!=0){
		//game in progres, get confirmation from user
		if (confirm("Are you sure you want to start a new game?")==false){
			return;
		}
	}

	newGame=1;

	document.getElementById("resumeGame").style.display="none";
	//document.getElementById("startNewGame").style.display="none";

	document.getElementById("helpGame").style.position="relative";
	document.getElementById("pauseGame").style.display="block";
	document.getElementById("helpGame").style.display="block";

	document.getElementById("helpPage").className="below";
	document.getElementById("mainPage").className="above";
	document.getElementById("bButton").disabled="";
	document.getElementById("sButton").disabled="";

	document.getElementById("finePrint").style.display="none";
	document.getElementById("infoMsg").style.display="inline";

	initializePlayer();
	document.getElementById("newsTicker").innerHTML="";
	document.getElementById("alerts").innerHTML="Joe: mkt's open!";
	initializeOrderBook();
	tradeTimer=setTimeout("generateTradeActivity()",tradeDelay);
}

function pauseGame()
{
	clearTimeout(tradeTimer);
	noActivityTimer=NO_ACTIVITY_TIMEOUT;
	document.getElementById("resumeGame").style.display="block";
	//document.getElementById("startNewGame").style.display="none";

	document.getElementById("pauseGame").style.display="none";

	document.getElementById("helpGame").style.display="block";

	document.getElementById("bButton").disabled="true";
	document.getElementById("sButton").disabled="true";
	document.getElementById("alerts").innerHTML="Sarah: click resume when ur back!";
}

function helpGame()
{
	clearTimeout(tradeTimer);
	noActivityTimer=NO_ACTIVITY_TIMEOUT;
	document.getElementById("resumeGame2").style.display="inline";
	document.getElementById("resumeGame").style.display="none";
	//document.getElementById("startNewGame").style.display="block";
	document.getElementById("pauseGame").style.display="none";
	document.getElementById("helpGame").style.display="none";
	document.getElementById("mainPage").className="below";
	document.getElementById("helpPage").className="above";
	document.getElementById("helpPage").style.height="548px";
	document.getElementById("helpPage").style.width="756px";

	document.getElementById("infoMsg").style.display="none";
	document.getElementById("finePrint").style.display="inline";


}

function exitGame()
{
	clearTimeout(tradeTimer);
	self.close();

}

function placeOrder(side)
{
	//Disable trading bot
	clearTimeout(tradeTimer);
	noActivityTimer=NO_ACTIVITY_TIMEOUT;

	if (isNaN(document.getElementById("myVol").value) || document.getElementById("myVol").value==""){
		document.getElementById("alerts").innerHTML="Joe: Use multiples of "+LOT_SIZE+"!";
		tradeVol=0;
	}
	else{
		//valid number
		tradeVol = Number(document.getElementById("myVol").value);

		if (tradeVol<LOT_SIZE || tradeVol%LOT_SIZE!=0){
			document.getElementById("alerts").innerHTML="Joe: Use multiples of "+LOT_SIZE+"!";
			tradeVol=0;
		}
		else if(tradeVol>MAX_USR_QTY*LOT_SIZE ){
			document.getElementById("alerts").innerHTML="Joe: your order quantity limit is "+MAX_USR_QTY*LOT_SIZE+"..try again!";
			tradeVol=0;
		}
		else{
			//alert(tradeVol);
			tradeValue=0;
			lastTradeTime=new Date();

			if (side=="B"){
				if (longPosition-shortPosition+tradeVol>MAX_USR_POS*LOT_SIZE){
					document.getElementById("alerts").innerHTML="Joe: your long position limit is "+MAX_USR_POS*LOT_SIZE+"..sell first";
					tradeVol=0;
				}
				else{
					document.getElementById("alerts").innerHTML="";
					processBuy("YOU");
				}
			}
			else if (side=="S"){
				if (longPosition-shortPosition-tradeVol< -1*MAX_USR_POS*LOT_SIZE){
					document.getElementById("alerts").innerHTML="Joe: your short position limit is -"+MAX_USR_POS*LOT_SIZE+"..buy first";
					tradeVol=0;
				}
				else{
					document.getElementById("alerts").innerHTML="";
					processSell("YOU");
				}

			}

			updateTradeStats();


		}
	}
	document.getElementById("myVol").value="";
	tradeTimer=setTimeout("generateTradeActivity()",tradeDelay);
}

