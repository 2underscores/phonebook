const mongoose = require('mongoose');
// const { MONGO_URI } = require('./config');


let PASSWORD, NAME, NUMBER;
switch (process.argv.length) {
    case 3:
        [ , , PASSWORD] = process.argv
        break;
    case 5:
        [ , , PASSWORD, NAME, NUMBER] = process.argv
        break;
    default:
        console.log('Provide either:\n1 args - List all contacts - <password>\n5 args - Add new contact (<password> <entry_name> <entry_number>)')    
        process.exit(1)
        break;
}

const DATABASE_NAME = 'phonebook_app'

const MONGO_URI = `mongodb+srv://jeremysmith:${PASSWORD}@fullstackopen-phonebook.ljiec.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority&appName=fullstackopen-phonebook`;

mongoose.set('strictQuery',false)

mongoose.connect(MONGO_URI)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

const Person = mongoose.model('Person', personSchema)

// List
if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('Phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
    return
// POST
} else if (process.argv.length === 5) {
            
      const person = new Person({
          "name": NAME,
          "number": NUMBER,
      })
      
      person.save().then(result => {
          console.log(`Added ${result.name} number ${result.number} to phonebook`)
          mongoose.connection.close()
      })
}

