const mongoose = require('mongoose');

const { MONGO_USER: USER, MONGO_PASSWORD: PASS, MONGO_CLUSTER: CLUSTER, MONGO_TABLE: TABLE } = process.env
const MONGO_URI = `mongodb+srv://${USER}:${PASS}@${CLUSTER}.ljiec.mongodb.net/${TABLE}?retryWrites=true&w=majority&appName=${CLUSTER}`;
console.log('Connecting to', MONGO_URI);
mongoose.set('strictQuery', false)
mongoose.connect(MONGO_URI) // AS in HTTP server, never disconnect really
    .then(result => { console.log('connected to MongoDB') })
    .catch(error => {console.log('error connecting to MongoDB:', error.message)})

const personSchema = new mongoose.Schema(
    {
        name: String,
        number: String,
    },
    {
        toJSON: { // Parses outbound from JS
        // toObject: { // Parses inbound to JS
            transform: (document, returnedObject) => {
                returnedObject.id = returnedObject._id.toString()
                delete returnedObject._id
                delete returnedObject.__v
            }
        }
    }
)

const Person = mongoose.model('Person', personSchema) // Wraps a bunch of CRUD methods

module.exports = Person