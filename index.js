require('dotenv').config()
const express = require('express')
const crypto = require('crypto')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/people')


const app = express()

// Middleware
// app.use(cors({origin: 'http://localhost:5173',}))
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
morgan.token('body', (req, res) => { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Endpoints & Methods
app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${personsData.length} people</p><p>${new Date()}</p>`)
})

const generateId = () => {
  return crypto.randomBytes(2).toString('hex');
}

const parsePerson = (p) => {
  if (!p.name) { return { status: 'bad', msg: 'Must contain name' } }
  if (!p.number) { return { status: 'bad', msg: 'Must contain number' } }
  return resp = { status: 'ok', person: p }
}

// Person CRUD endpoints
app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.post('/api/persons', (req, res) => {
  // Parse request with standard body
  const parsed = parsePerson(req.body)
  console.log('Attempting creation:', parsed.person);
  if (parsed.status === 'bad') {
    console.log(parsed)
    res.status(400).json(parsed)
    return
  }
  // If duplicate, error
  const matchingPeople = Person.find({ // Should use countDocuments()
    $or: [
      { name: parsed.person.name },
      { number: parsed.person.number }
    ]})
    .then(people => {
      if (people.length > 0) {
        console.log(`${people.length} Conflicts in DB:`, people)
        res.status(400).json({ status: 'bad', msg: 'Name or number already exists' })
        return Promise.reject('Duplicates')
      } else {
        const person = new Person(parsed.person)
        return person.save()
      }
    })
    .then(savedPerson => {
      console.log('Saved:', savedPerson)
      res.json(savedPerson)
    })
    .catch(err => {
      console.log('Error:', err)
    })
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        console.log('Found:', person);
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      console.log('Error:', error);
      res.status(500).end()
    })
})

app.put('/api/persons/:id', (req, res) => {
  const parsed = parsePerson(req.body)
  if (parsed.status === 'bad') {
    console.log(parsed)
    res.status(400).json(parsed)
    return
  }
  const personObj = { ...parsed.person, ...{ id: req.params.id } }
  personsData = personsData.map(p => p.id === personObj.id ? personObj : p) // TODO: Delete DB
  console.log('Updated:', personObj)
  res.json(personObj)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id;
  const person = personsData.find(p => p.id === id)
  personsData = personsData.filter(p => p.id !== id) // TODO: Delete DB
  res.status(person ? 204 : 404).end()
})

app.use((req, res, next) => {
  res.status(404).json({ error: 'Does not exist' })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
