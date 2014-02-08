

- set up level where you shoot balloons by inflating them 
	//- single balloon on screen
	- when inflated, replace 
	//- Bounding box to keep stuff in

- add in windVector stuff for directing the balloon
	- add arrow for directing?

//- switch to smaller balloons? 
	//- will have to edit png myself for smaller balloons of different colors
	//- then switch ballon.js around to have smaller balloons

- have balloons pop when in groups of three of same color
	- some kind of contacts array for each balloon/item
	- every contact check 
		- if this contact is not already in the array
			- add it to array
	- every break of contact 
		- if this contact is in the array?
			- remove it from the array

	- in balloons update: 
	- loop through contacts array
		- count up contact.color 
			- if two of same color as self
				- explode 




