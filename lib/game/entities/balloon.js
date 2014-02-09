ig.module(
	'game.entities.balloon'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityBalloon = ig.Box2DEntity.extend({
	size: {x: 128, y:151},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "BALLOON",
	isBalloon: true,
	state: "ON",
	radius: 35,
	dampingRatio: 0.5,
	frequencyHz: 12,
	zIndex: 10,
	jointList: [],
	upForce: -550,
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
			var randNum = Math.ceil( Math.random() * 4 );
			switch( randNum ){
				case 1:
					this.colorName = "GREEN";
					this.animSheet = new ig.AnimationSheet( 'media/BalloonSmall_GREEN_1023x151y_6f.png' , 128 , 151 );
				break;
				case 2:
					this.colorName = "ORANGE";
					this.animSheet = new ig.AnimationSheet( 'media/BalloonSmall_ORANGE_1023x151y_6f.png' , 128 , 151 );
				break;
				case 3:
					this.colorName = "PURPLE";
					this.animSheet = new ig.AnimationSheet( 'media/BalloonSmall_PURPLE_1023x151y_6f.png' , 128 , 151 );
				break;
				case 4:
					this.colorName = "RED";
					this.animSheet = new ig.AnimationSheet( 'media/BalloonSmall_RED_1023x151y_6f.png' , 128 , 151 );
				break;
			}
			this.addAnim( 'idle' , 0.1 , [0] );
			this.addAnim( 'inflate' , 0.1 , [0,1,2,3,4,5] , true );
			this.addAnim( 'partInflate' , 0.1 , [0,1,2,3] , true );
			this.addAnim( 'fullInflate' , 0.1 , [3,4,5] , true );
			this.addAnim( 'inflated' , 0.1 , [5] );
			this.addAnim( 'deflate' , 0.1 , [3,2,1,0] , true );
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
		fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.radius * Box2D.SCALE);  
	    fixture.density = 0.1;
	    fixture.restitution = 0.7;
	    fixture.friction = 0;
	   
	    //set userData
	    fixture.userData = this;

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);
	    //set body properties
	    this.body.SetLinearDamping(3);
	    this.body.SetAngularDamping(999);
    	
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
		if( this.contactList.length ){
			this.selfContacts = [];
			for( var i = 0 ; i < this.contactList.length ; i++ ){
				if( this.contactList[i].m_userData.colorName == this.colorName ){ 
					this.selfContacts.push( this.contactList[i] );
				}
			}
			if( this.selfContacts.length <= 0 ){
				this.currentAnim = this.anims.deflate;
			}
			if( this.selfContacts.length >= 1 ){
				//inflate
				this.currentAnim = this.anims.partInflate;
				//this.currentAnim.rewind();
			}
			if( this.selfContacts.length >= 2 ){
				//kill them all
				for( var i = 0 ; i < this.selfContacts.length  ; i++ ){
					console.log('pushing');
					if( this.selfContacts[i].m_userData != this ){
						ig.game.killList.push( this.selfContacts[i].m_userData );
					}
				}
				ig.game.killList.push(this);
				console.log( 'killing '+this.colorName+' balloon');
			}
		}
		//apply constant upward force
		this.body.ApplyForce( new Box2D.Common.Math.b2Vec2(0,this.upForce), this.body.GetPosition() );
		this.yPos = this.body.GetPosition().y;
		this.parent();
	
	},

	kill: function(){
		//inflate
		this.currentAnim = this.anims.fullInflate;
		this.currentAnim.rewind();
		//should spawn some debris particles here

		this.parent();

	}

});

});