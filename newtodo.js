

//- set up level where you shoot balloons by inflating them 
	//- single balloon on screen
	//- when inflated, replace 
	//- Bounding box to keep stuff in

- add in windVector stuff for directing the balloon
	- add arrow for directing?

//- or let user drag item around on rope before releasing

//- switch to smaller balloons? 
	//- will have to edit png myself for smaller balloons of different colors
	//- then switch ballon.js around to have smaller balloons

//- destroy rope from ballons which have been inflated 

//- balloons should part inflate on contact and full inflate on pop

//- some kind of special projectile

//- have balloons pop when in groups of three of same color
	//- some kind of contacts array for each balloon/item
	//- every contact check 
		//- if this contact is not already in the array
			//- add it to array

	//- every break of contact 
		//- if this contact is in the array?
			//- remove it from the array

	//- in balloons update: 
	//- loop through contacts array
		//- count up contact.color 
			//- if two of same color as self
				//- explode 

- Or have ballons pop when they take damage
	- for every contact: 
		- count hit number on item contacting
		- add to hits on balloon
		- when a preset number is reached, explode
		- bigger items deliver more hits

- Try different obstacle types and sizes
	//- randomly pick from within same class for all box shaped

- Try different projectile types and sizes
	- randomly pick as with obstacles 

//- cats are actual projectiles
	//- launch rather than float

- Allow user to under or over breathe and still launch item 
	- feedback text 'try breathing more deeply' eg

- Feedback effects
	- for popping a trio of balloons
		- particles
			- balloon parts 
			- stars
			- 'well done!'
	- for breaking an obstacle
	 	- dust cloud
	 	- obstacle parts 
	 	- smaller obstacle entities 
	 - for cat 
	 	- launch from cannon
	 	- smoke trail
	 	- cat parachutes down/ cloud of smoke





















