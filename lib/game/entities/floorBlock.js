ig.module(
	'game.entities.floorBlock'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityFloorBlock = ig.Box2DEntity.extend({
	size: {x: 310, y:5}, //one size for all items?
	pos: { x: 160 , y: 565 },
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "BLOCK", //used in contact listener
	state: "ON", //used in contact listener

	init: function( x, y, settings ) {
		//call parent
		this.parent( x, y, settings );
	},

	createBody: function() {
		//build new body definition from prototype
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		//set values
	    bodyDef.position = new Box2D.Common.Math.b2Vec2(
			(this.pos.x ) * Box2D.SCALE,
			(this.pos.y ) * Box2D.SCALE
		); 
	    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;    
	    //create body, assign to this class
	    this.body = ig.world.CreateBody(bodyDef);

	    //new fixture definition from prototype
	    var fixture = new Box2D.Dynamics.b2FixtureDef;
	    //set values
		fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		fixture.shape.SetAsBox(
			this.size.x / 2 * Box2D.SCALE,
			this.size.y / 2 * Box2D.SCALE
		);
	   	
	   	//set collision categories
	    fixture.filter.categoryBits = 0x0100;
	    fixture.filter.maskBits = 0x0110;

	    //set userData
	    fixture.userData = this;

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);
	    //set body properties
	    this.body.SetLinearDamping(3);
	    this.body.SetAngularDamping(2);
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