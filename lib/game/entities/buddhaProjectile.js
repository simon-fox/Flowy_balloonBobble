ig.module(
	'game.entities.buddhaProjectile'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityBuddhaProjectile = ig.Box2DEntity.extend({
	size: {x: 112, y: 168},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "BALLOON",
	state: "ON",
	radius: 45,
	dampingRatio: 0.5,
	frequencyHz: 12,
	zIndex: 10,
	jointList: [],
	upForce: -450,
	contactList: [],
	selfContacts: 0,
	lifeTime: 2.5,
	timerStarted: false,
	grabbable: true,
	launched: false,
	impulseApplied: false,
	impulseForce: -1600,
	bounceImpulse: -300,
	enlightenmentRadius: 0,

	init: function( x, y, settings ) {
		//set stemCount
		this.stemCount = 8;

		//establish amount to add for multiplier
		this.multiplier = ig.game.ropeSegmentCount;

		//make a global var which counts stems
		ig.game.ropeSegmentCount += this.stemCount;

		this.animSheet = new ig.AnimationSheet( 'media/buddhaBomb_112x168.png' , 112 , 168 );
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
	    fixture.density = 0.1;
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
			var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;
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
					var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
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
				this.body.ApplyImpulse( new Box2D.Common.Math.b2Vec2( 0 , -150 ), this.body.GetPosition() );	
			}
			
		}
		//LAUNCHING:
		if( ig.game.breathIndicator.fullBreathTaken == true && this.timerStarted == false && ig.game.breathIndicator.state == "HOLDING" ){
			console.log('starting timer on BUDDHA')
			this.lifeTimer.reset();
			this.timerStarted = true;
		}
		//launched - button released
		if( ig.game.breathIndicator.fullBreathTaken == true && this.timerStarted == true && ig.game.breathIndicator.state == "OUT" ){
			this.launched = true;
		}
		//check if lifetime is up
		if( this.lifeTimer.delta() >= this.lifeTime ){
			console.log('killing BUDDHA ');
			ig.game.killList.push(this);
			//kill everything
			for( var i = 0 ; i < ig.game.entities.length ; i++ ){
				if( ig.game.entities[i].name == "BALLOON" && ig.game.entities[i].newest == false ){
					ig.game.entities[i].kill();
				}
			}
		}
		//check if launched
		if( this.launched == true ){
			if( this.yPos >= 30 ){
				//console.log(this.yPos);
				this.body.ApplyForce( new Box2D.Common.Math.b2Vec2( 0 , -500 ), this.body.GetPosition() );	
			}
			else if( this.yPos <= 27){
				this.body.SetLinearVelocity( new Box2D.Common.Math.b2Vec2( 0 , 0 ), this.body.GetPosition() );	
				this.body.SetAngularVelocity( 0 );	
				this.drawEnlightenment();
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

	drawEnlightenment: function(){ 
		console.log(this.enlightenmentRadius);
		

        this.enlightenmentRadius += 7;
	},

	draw: function(){
		if( this.enlightenmentRadius > 0 ){
			//grab the canvas
	        var ctx = ig.system.context;

	        this.canvasX = ig.system.getDrawPos( this.pos.x + ( this.size.x / 2 ) );
	        this.canvasY = ig.system.getDrawPos( this.pos.y + ( this.size.x / 2 ) );
			//let's draw a circle
	        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
	        ctx.beginPath();
	        ctx.moveTo( this.canvasX , this.canvasY );
	        ctx.arc( this.canvasX , this.canvasY , this.enlightenmentRadius * ig.system.scale,0, Math.PI * 2 );
	        ctx.fill();
	        ctx.closePath();
		}
		this.parent();
	},

	kill: function(){



		this.parent();

	}

});

});