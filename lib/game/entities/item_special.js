ig.module(
	'game.entities.item_special'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity',
	'game.entities.item'
)
.defines(function(){

EntityItem_special = EntityItem.extend({
	size: {x: 128, y:151}, //one size for all items?
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "SPECIAL", //used in contact listener
	shouldAnimate: false, //used as flag to determine whether inflate/deflate anim occurs
	state: "ON", //used in contact listener

	init: function( x, y, settings ) {
		//call parent
		this.parent( x, y, settings );
	},

	update: function() {
		//call parent
		this.parent();
	},           

	kill: function(){
		//play death animation
		//should spawn some debris particles here

		this.parent();

	}

});

});