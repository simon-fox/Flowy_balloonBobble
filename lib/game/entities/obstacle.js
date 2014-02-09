ig.module(
	'game.entities.obstacle'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityObstacle = ig.Box2DEntity.extend({
	size: {x: 140, y:140},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "BALLOON",
	state: "ON",
	radius: 35,
	dampingRatio: 0.5,
	frequencyHz: 12,
	zIndex: 10,
	jointList: [],
	upForce: -1000,
	contactList: [],
	selfContacts: 0,
	grabbable: true,

	init: function( x, y, settings ) {
		//only execute this code for non button balloons
		if( this.name == "BALLOON"){
			//set stemCount
			this.stemCount = 8;

			//establish amount to add for multiplier
			this.multiplier = ig.game.ropeSegmentCount;

			//make a global var which counts stems
			ig.game.ropeSegmentCount += this.stemCount;

			//establish a random animSheet
			var randNum = Math.ceil( Math.random() * 2 );
			switch( randNum ){
				case 1:
					this.obstacleType = "WOODCUBE";
					this.size = {x: 140, y:140};
					this.upForce = -1000;
					this.animSheet = new ig.AnimationSheet( 'media/woodenObstacle.png' , 140 , 140 );
				break;
				case 2:
					this.obstacleType = "WOODLINE";
					this.size = {x: 140, y:70};
					this.upForce = -500;
					this.animSheet = new ig.AnimationSheet( 'media/woodenObstacle140x70.png' , 140 , 70 );
				break;
			}

			this.addAnim( 'idle' , 0.1 , [0] );
			this.currentAnim = this.anims.idle;
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
		fixture.density = 0.05;
	    fixture.restitution = 0.7;
	    fixture.friction = 1;

	    //set userData
	    fixture.userData = this;

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);
	    //set body properties
	    this.body.SetLinearDamping(3);
	    this.body.SetAngularDamping(2);
    	
		//create stem links & joints
		for ( var i = 0 ; i < this.stemCount ; i++ ){
			ig.game.spawnEntity(EntityBalloon_ropeSegment, (this.pos.x ) , (this.pos.y ) )
			
			//new joint definition
			var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
			//if it's the first rope segment, join it to the balloon
			if( i == 0 ){
				//set bodies to join
		    	var myBodyA = this.body;
				var myBodyB = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[i + this.multiplier].body;

				jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 10 * Box2D.SCALE );
				jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );
			
			}
			//or else join the segment to the previous segment 
			else if ( i > 0 ){
				var myBodyA = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[ ( i - 1 ) + this.multiplier ].body;
				var myBodyB = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[ i + this.multiplier ].body;

				jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 11 * Box2D.SCALE );
				jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , -11 * Box2D.SCALE );

				//if it's the last rope segment, join it to the anchor
				if ( i == this.stemCount - 1 ){
					//new joint definition
					var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
					//set bodies to join
			    	var myBodyAn = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[ i + this.multiplier ].body;
					var myBodyBn = ig.game.getEntitiesByType(EntityBalloon_anchor)[0].body;

					jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 11 * Box2D.SCALE );
					jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , -11 * Box2D.SCALE );

					jointDef.bodyA = myBodyAn;
				    jointDef.bodyB = myBodyBn;
				    jointDef.length = 0.1;
				    //jointDef.dampingRatio = this.dampingRatio;
				    //jointDef.frequencyHz = this.frequencyHz;
				    jointDef.collideConnected = false;

				    var joint =  ig.world.CreateJoint(jointDef);
				    this.jointList.push(joint);
				}
			
			}
			

			
			jointDef.bodyA = myBodyA;
		    jointDef.bodyB = myBodyB;
		    jointDef.length = 0.1;
		    //jointDef.dampingRatio = this.dampingRatio;
			//jointDef.frequencyHz = this.frequencyHz;
		    jointDef.collideConnected = false;

		    var joint =  ig.world.CreateJoint(jointDef);
		    this.jointList.push(joint);
		}

	},

	update: function() { 
		//apply constant upward force
		this.body.ApplyForce( new Box2D.Common.Math.b2Vec2(0,this.upForce), this.body.GetPosition() );
		this.yPos = this.body.GetPosition().y;
		this.parent();
	},

	kill: function(){
		//should spawn some debris particles here

		this.parent();

	}

});

});