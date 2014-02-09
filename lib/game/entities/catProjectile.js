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
	upForce: -500,
	contactList: [],
	selfContacts: 0,
	lifeTime: 2,
	timerStarted: false,
	grabbable: true,
	launched: false,
	impulseApplied: false,
	impulseForce: -1600,
	bounceImpulse: -300,

	init: function( x, y, settings ) {
		//set stemCount
		this.stemCount = 8;

		//establish amount to add for multiplier
		this.multiplier = ig.game.ropeSegmentCount;

		//make a global var which counts stems
		ig.game.ropeSegmentCount += this.stemCount;

		this.animSheet = new ig.AnimationSheet( 'media/catProjectile.png' , 64 , 128 );
		this.addAnim( 'idle' , 0.1 , [0] );
		this.currentAnim = this.anims.idle;

		this.lifeTimer = new ig.Timer();
		this.lifeTimer.pause();

		this.number =  ig.game.getEntitiesByType(EntityCatProjectile).length;
		
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
	    fixture.density = 0.2;
	    fixture.restitution = 0;
	    fixture.friction = 0;

	    //set userData
	    fixture.userData = this;

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);
	    //set body properties
	    this.body.SetLinearDamping(0);
	    this.body.SetAngularDamping(0);
    	
		//create stem links & joints
		for ( var i = 0 ; i < this.stemCount ; i++ ){
			ig.game.spawnEntity(EntityBalloon_ropeSegment, (this.pos.x ) , (this.pos.y ) )
			
			//new joint definition
			var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
			//if it's the first rope segment, join it to the balloon
			if( i == 0 ){
				//set bodies to join
		    	var myBodyA = this.body;
				var myBodyB = ig.game.getEntitiesByType(EntityBalloon_ropeSegment)[i + this.multiplier].body;

				jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , this.radius * Box2D.SCALE );
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
		//kill anything it touches
		if( this.contactList.length ){
			for( var i = 0 ; i < this.contactList.length ; i++ ){
				ig.game.killList.push( this.contactList[i].m_userData );
				//bounce upwards when hitting something
				var posNeg = 1; 
				if( Math.random() > 0.5 ){ posNeg = -1; }
				var xImpulse = Math.floor( Math.random() * 200 ) * posNeg ;
				var yImpulse = Math.floor( Math.random() * 200 ) * -1 ;
				this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2( xImpulse , yImpulse ), this.body.GetPosition() );	
			}
			
		}
		//cat LAUNCHING:
		if( ig.game.breathIndicator.fullBreathTaken == true && this.timerStarted == false && ig.game.breathIndicator.state == "HOLDING" ){
			console.log('starting timer on cat')
			this.lifeTimer.reset();
			this.timerStarted = true;
		}
		//cat launched - button released
		if( ig.game.breathIndicator.fullBreathTaken == true && this.timerStarted == true && ig.game.breathIndicator.state == "OUT" ){
			this.launched = true;
		}
		//check if lifetime is up
		if( this.lifeTimer.delta() >= this.lifeTime ){
			console.log('killing cat ');
			ig.game.killList.push(this);
		}
		//check if launched
		if( this.launched == true ){
			if( this.impulseApplied == false ){
				this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2(0,this.impulseForce), this.body.GetPosition() );	
				this.impulseApplied = true;
			}
		}
		else{
			//apply constant upward force
			this.body.ApplyForce( new Box2D.Common.Math.b2Vec2(0,this.upForce), this.body.GetPosition() );	
		}
		//store yPos for z index ordering
		this.yPos = this.body.GetPosition().y;
		//call parent
		this.parent();
	},

	kill: function(){

		//should spawn some debris particles here

		this.parent();

	}

});

});