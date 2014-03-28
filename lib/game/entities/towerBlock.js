ig.module(
	'game.entities.towerBlock'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityTowerBlock = ig.Box2DEntity.extend({
	size: {x: 150, y:60}, //one size for all items?
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "BLOCK", //used in contact listener
	state: "ON", //used in contact listener

	init: function( x, y, settings ) {
		//choose TYPE, then spritesheet, then set anims
		var randNum = Math.ceil( Math.random() * 3 );
		switch( randNum ){
			case 1:
				this.dispenserType = "FOOD";
				//also choose spritesheet here
			break;
			case 2:
				this.dispenserType = "FUN";//replace with FUN 
				//also choose spritesheet here
			break;
			case 3:
				this.dispenserType = "HOME";//replace with HOME
				//also choose spritesheet here				
			break;
		}
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
	    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;    
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
		fixture.density = 0.3;
	    fixture.restitution = 0.1;
	    fixture.friction = 1;
	   	
	   	//set collision categories
	    fixture.filter.categoryBits = 0x0010;
	    fixture.filter.maskBits = 0x1110;

	    //set userData
	    fixture.userData = this;

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);
	    //set body properties
	    this.body.SetLinearDamping(0);
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