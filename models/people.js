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
        name: {
            type: String,
            required: true,
            unique: true, // NOT a validator - https://mongoosejs.com/docs/validation.html#the-code%3Eunique%3C/code%3E-option-is-not-a-validator
            minLength: [ 3, 'Name must be at least 3 characters, is {VALUE} characters'],
            maxLength: [30, 'Name must be less than 30 characters, is {VALUE} characters'],
        },
        number: {
            type: String,
            required: true,
            validate: {
                validator: (v) => {
                    return v.replace(/[^0-9]/g, '').length >= 3 // Short for ezdev
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        },
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