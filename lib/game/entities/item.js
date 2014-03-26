ig.module(
	'game.entities.item'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityItem = ig.Box2DEntity.extend({
	size: {x: 128, y:151}, //one size for all items?
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "ITEM", //used in contact listener
	shouldAnimate: true, //used as flag to determine whether inflate/deflate anim occurs
	state: "ON", //used in contact listener
	radius: 35, //b2d
	dampingRatio: 0.5, //b2d
	frequencyHz: 12, //b2d
	zIndex: 10, 
	jointList: [], //collect a list of joints as we make them - used to destroy rope in breathIndicator.js 159
	upForce: -550, //controls force with which item floats
	contactList: [], //stores a list of all contacts
	selfContacts: 0, //how many contacts are self contacts? -- dispenser specific
	grabbable: true, //used in mousejoint logic 

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
    	
		//join item to ropeSegment and ropeSegment to anchor
		//spawn rope segment
		this.ropeSegment = ig.game.spawnEntity(EntityRopeSegment, (this.pos.x ) , (this.pos.y ) )
		
		//Join item to ropeSegment new joint definition
		var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
		//where is joint anchored
		jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , this.radius * Box2D.SCALE );
		jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , -100 * Box2D.SCALE );
		//which bodies are we joining?
		jointDef.bodyA = this.body;
	    jointDef.bodyB = this.ropeSegment.body;
	    jointDef.length = 0.1;
	    jointDef.collideConnected = false;

	    var joint =  ig.world.CreateJoint(jointDef);
	    this.jointList.push(joint);

		//Join ropeSegment to anchor new joint definition
		var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
		//where is joint anchored
		jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 100 * Box2D.SCALE );
		jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );
		//which bodies are we joining?
		jointDef.bodyA = this.ropeSegment.body;
	    jointDef.bodyB = ig.game.getEntitiesByType(EntityAnchor)[0].body;
	    jointDef.length = 0.1;
	    jointDef.collideConnected = false;

	    var joint2 =  ig.world.CreateJoint(jointDef);
	    this.jointList.push(joint);

	},

	update: function() {
		//the following function checks contacts to see if any qualify as self contacts
		//self contacts are two items of the same type contacting
		//if self contacts reaches 3, then we change the item
		//right now we kill it, but soon we will kill self contacts to spawn a new item 
		//this logic is specific to DISPENSERS
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
			//if we've got 3 together
			if( this.selfContacts.length >= 2 ){
				//kill them all
				for( var i = 0 ; i < this.selfContacts.length  ; i++ ){
					console.log('pushing');
					if( this.selfContacts[i].m_userData != this ){
						//kill self contacts
						ig.game.killList.push( this.selfContacts[i].m_userData );
					}
				}
				//also kill self, woohoo death everywhere
				ig.game.killList.push(this);
				console.log( 'killing '+this.colorName+' balloon');
			}
		}


		//apply constant upward force
		this.body.ApplyForce( new Box2D.Common.Math.b2Vec2(0,this.upForce), this.body.GetPosition() );
		this.yPos = this.body.GetPosition().y;
		this.parent();
	
	},
	//this function must be top level item.js
	breakJoint: function(){
                     //find the rope joint to destroy
                    var n = ig.game.mouseOverClass.jointList.length - (ig.game.mouseOverClass.jointList.length - 1);
                    ig.world.DestroyJoint( ig.game.mouseOverClass.jointList[n] );
                    
                    //kill all ropeSegments
                    var ropeSegmentsArray = ig.game.getEntitiesByType( EntityRopeSegment );
                    for( var i = 0 ; i < ropeSegmentsArray.length ; i++ ){
                        ropeSegmentsArray[i].kill();
                    }
                    ig.game.ropeSegmentCount = 0;
                    
    },

	kill: function(){
		//play death animation
		//should spawn some debris particles here

		this.parent();

	}

});

});