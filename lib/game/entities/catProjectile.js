ig.module(
	'game.entities.catProjectile'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityCatProjectile = ig.Box2DEntity.extend({
	size: {x: 64, y: 128},
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
	upForce: -250,
	contactList: [],
	selfContacts: 0,
	lifeTime: 4.5,
	timerStarted: false,
	grabbable: true,
	ropeSegments: [],

	init: function( x, y, settings ) {
		//set stemCount
		this.stemCount = 8;

		this.animSheet = new ig.AnimationSheet( 'media/catProjectile.png' , 64 , 128 );
		this.addAnim( 'idle' , 0.1 , [0] );
		this.currentAnim = this.anims.idle;

		this.lifeTimer = new ig.Timer();
		this.lifeTimer.pause();
		
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
		fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.radius * Box2D.SCALE);  
	    fixture.density = 0.1;
	    fixture.restitution = 0.7;
	    fixture.friction = 0;
	    //set collision categories
	    fixture.filter.categoryBits = 0x0002;
	    fixture.filter.maskBits = 0x0002;
	    //set userData
	    fixture.userData = this;

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);
	    //set body properties
	    this.body.SetLinearDamping(3);
	    this.body.SetAngularDamping(999);
    	
		//create stem links & joints
		for ( var i = 0 ; i < this.stemCount ; i++ ){
			var newRopeSegment = ig.game.spawnEntity(EntityBalloon_ropeSegment, (this.pos.x ) , (this.pos.y ) )
			this.ropeSegments.push( ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[ig.game.getEntitiesByType(EntityBalloon_ropeSegment).length - 1  ] );
			//new joint definition
			var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
			//if it's the first rope segment, join it to the balloon
			if( i == 0 ){
				//set bodies to join
		    	var myBodyA = this.body;
				var myBodyB = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[i].body;

				jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , this.radius * Box2D.SCALE );
				jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );
			
			}
			//or else join the segment to the previous segment 
			else if ( i > 0 ){
				var myBodyA = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[ ( i - 1 ) ].body;
				var myBodyB = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[ i ].body;

				jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 11 * Box2D.SCALE );
				jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , -11 * Box2D.SCALE );

				//if it's the last rope segment, join it to the anchor
				if ( i == this.stemCount - 1 ){
					//new joint definition
					var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
					//set bodies to join
			    	var myBodyAn = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[ i ].body;
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
		//kill anything it touches
		if( this.contactList.length ){
			for( var i = 0 ; i < this.contactList.length ; i++ ){
				ig.game.killList.push( this.contactList[i].m_userData );
			}
			
		}
		if( ig.game.breathIndicator.fullBreathTaken == true && this.timerStarted == false && ig.game.breathIndicator.state == "HOLDING" ){
			console.log('starting timer on cat')
			this.lifeTimer.reset();
			this.timerStarted = true;
		}
		//check if lifetime is up
		if( this.lifeTimer.delta() >= this.lifeTime ){
			console.log('killing cat ');
			ig.game.killList.push(this);
		}
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