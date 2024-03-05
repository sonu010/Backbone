var Book = Backbone.RelationalModel.extend({
    defaults: {
        title: '',
        genre: ''
    },
    relations: [{
        type: Backbone.HasOne,
        key: 'author',
        relatedModel: 'Author', // Referencing the name of the related model
        reverseRelation: {
            key: 'books' // Name of the key in the related model
        }
    }]
});

var Author = Backbone.RelationalModel.extend({
    defaults: {
        name: '',
        country: ''
    },
    relations: [{
        type: Backbone.HasMany,
        key: 'books',
        relatedModel: 'Book', // Referencing the name of the related model
        reverseRelation: {
            key: 'author' // Name of the key in the related model
        }
    }]
});
var author1 = new Author({ name: 'J.K. Rowling', country: 'UK' });
var book1 = new Book({ title: 'Harry Potter and the Sorcerer\'s Stone', genre: 'Fantasy' });

author1.get('books').add(book1); // Adding the book to the author's books collection

console.log(author1.toJSON());
console.log(book1.toJSON());
