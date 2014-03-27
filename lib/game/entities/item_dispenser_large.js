ig.module(
	'game.entities.item_dispenser_large'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity',
	'game.entities.item'
)
.defines(function(){

EntityItem_dispenser_large = EntityItem.extend({
	size: {x: 128, y:151}, //one size for all items?
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "DISPENSER_LARGE", //used in contact listener
	shouldAnimate: false, //used as flag to determine whether inflate/deflate anim occurs
	state: "ON", //used in contact listener
	radius: 45, //larger radius
	upForce: -960, //larger upForce

	init: function( x, y, settings ) {
		//choose TYPE, then spritesheet, then set anims
		var randNum = Math.ceil( Math.random() * 3 );
		switch( randNum ){
			case 1:
				this.dispenserType = "FOOD";
				//also choose spritesheet here
			break;
			case 2:
				this.dispenserType = "FOOD";//replace with FUN 
				//also choose spritesheet here
			break;
			case 3:
				this.dispenserType = "FOOD";//replace with HOME
				//also choose spritesheet here				
			break;
		}
		//call parent
		this.parent( x, y, settings );
	},

	update: function() {
		//call parent
		this.parent();
	},      

	dropTowerBlock: function(){
		//spawn and drop a block of correct type ( this.dispenserType )
		ig.game.spawnEntity( EntityTowerBlock , this.pos.x + this.radius , this.pos.y + this.radius );
		//kill self 
		this.kill();
	},  

	kill: function(){
		//play death animation
		//should spawn some debris particles here

		this.parent();

	}

});

});