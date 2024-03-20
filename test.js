$(document).ready(function() {
	// Variable to catch the last request.
	window.lastRequest = null;

	// Stub out Backbone.request...
	Backbone.sync = function() {
		lastRequest = _.toArray(arguments);
	};


	House = Backbone.RelationalModel.extend({
		relations: [{
				type: Backbone.HasMany,
				key: 'occupants',
				relatedModel: 'Person',
				reverseRelation: {
					key: 'livesIn'
				}
			}]
	});

	Person = Backbone.RelationalModel.extend({
		relations: [{
				// Create a cozy, recursive, one-to-one relationship
				type: Backbone.HasOne,
				key: 'likesALot',
				relatedModel: 'Person',
				reverseRelation: {
					type: Backbone.HasOne,
					key: 'likedALotBy'
				}
			},
			{
				type: Backbone.HasOne,
				key: 'user',
				relatedModel: 'User',
				reverseRelation: {
					type: Backbone.HasOne,
					key: 'person'
				}
			},
			{
				type: Backbone.HasMany,
				key: 'cats',
				relatedModel: 'Cat',
				includeInJSON: false
			}]
	});

	User = Backbone.RelationalModel.extend({
	});

	Cat = Backbone.RelationalModel.extend({
		relations: [{
				type: 'HasOne',
				key: 'owner',
				relatedModel: 'Person'
			},
			{
				type: 'HasMany',
				key: 'likes',
				relatedModel: 'Person'
			}]
	});

/*	
	person1 = new Person({
		id: 'person-1',
		name: 'boy',
		likesALot: 'person-2',
		cats: [],
		user: { login: 'dude', email: 'me@gmail.com' }
	});
	
	person2 = new Person({
		id: 'person-2',
		name: 'girl',
		likesALot: 'person-1',
		cats: [ 'cat-1', 'cat-2' ]
	});
	
	cat1 = new Cat({
		id: 'cat-1',
		name: 'E',
		owner: 'person-2',
		likes: [ 'person-1', 'person-2' ]
	});
	
	cat2 = new Cat({
		id: 'cat-2',
		name: 'L',
		owner: 'person-2',
		likes: [ 'person-2' ]
	});
	
	ourHouse = new House({
		id: 'house-1',
		location: 'in the middle of the street',
		occupants: ['person-2']
	});
	
	theirHouse = new House({
		id: 'house-2',
		location: 'outside of town',
		occupants: []
	});
	
	//console.debug( 'ourHouse=%o, person1=%o, person2=%o, cat1=%o, cat2=%o', ourHouse, person1, person2, cat1, cat2 );
	module("Backbone.Store");
	
		test("Initialized", function() {
			equal( Backbone.store._collections.length, 4, "Store contains 4 collections" );
		});
		
		test("Add and removes from store", function() {
			var coll = Backbone.store.getCollection( person1 );
			var length = coll.length;
			
			var person = new Person({
				id: 'person-10',
				name: 'Remi'
			});
			
			ok( coll.length === length + 1, "Collection size increased by 1" );
			
			person.destroy();
			
			ok( coll.length === length, "Collection size decreased by 1" );
		});
		
		test("Models are created from objects, can then be found, destroyed, cannot be found anymore", function() {
			var houseId = 'house-10'
			var personId = 'person-10';
			
			var anotherHouse = new House({
				id: houseId,
				location: 'no country for old men',
				occupants: [{
					id: personId,
					name: 'Remi'
				}]
			});
			
			ok( anotherHouse.get('occupants') instanceof Backbone.Collection, "Occupants is a Collection" );
			ok( anotherHouse.get('occupants').get( personId ) instanceof Person, "Occupants contains the Person with id='" + personId + "'" );
			
			var person = Backbone.store.find( Person, personId );
			
			ok( person, "person-10 is found in the store" );
			
			person.destroy();
			person = Backbone.store.find( Person, personId );
			
			ok( !person, personId + " is not found in the store anymore" );
			ok( !anotherHouse.get('occupants').get( personId ), "Occupants no longer contains the Person with id='" + personId + "'" );
			
			anotherHouse.destroy();
			
			var house = Backbone.store.find( House, houseId );
			
			ok( !house, houseId + " is not found in the store anymore" );
		});
		
	module("IncludeInJSON");
		
		test("Person to JSON", function() {
			var json = person1.toJSON();
			console.debug( json );
			
			ok( _.isArray( json.likesALot.cats ), "No Cat objects (includeInJSON=false for those)" );
			equal(  json.likesALot.likesALot, 'person-1', "Person is serialized only once" );
		});
		
	module("Backbone.HasOne");
		
	
	module("Backbone.HasMany");
		
			
	module("Reverse relationships");
	
		test("Add", function() {
			equal( ourHouse.get('occupants').length, 1, "ourHouse has 1 occupant" );
			equal( person1.get('livesIn'), null, "Person 1 doesn't live anywhere" );
			
			ourHouse.get('occupants').add( person1 );
			
			equal( ourHouse.get('occupants').length, 2, "Our House has 2 occupants" );
			equal( person1.get('livesIn') && person1.get('livesIn').id, ourHouse.id, "Person 1 lives in ourHouse" );
			
			person1.set( { 'livesIn': theirHouse } );
			
			equal( theirHouse.get('occupants').length, 1, "theirHouse has 1 occupant" );
			equal( ourHouse.get('occupants').length, 1, "ourHouse has 1 occupant" );
			equal( person1.get('livesIn') && person1.get('livesIn').id, theirHouse.id, "Person 1 lives in theirHouse" );
		});*/
});