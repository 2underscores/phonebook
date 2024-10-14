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
morgan.token('body', (req, res, next) => { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Endpoints & Methods
app.get('/info', (req, res, next) => {
  res.send(`<p>Phonebook has info for ${personsData.length} people</p><p>${new Date()}</p>`)
})

const generateId = () => {
  return crypto.randomBytes(2).toString('hex');
}

const parsePerson = (p) => {
  if (!p.name) { return { error: 'ValidationError', status: 'bad', msg: 'Must contain name' } }
  if (!p.number) { return { error: 'ValidationError', status: 'bad', msg: 'Must contain number' } }
  return resp = { status: 'ok', person: p }
}

// Person CRUD endpoints
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(result => {res.json(result)})
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  // Parse request with standard body
  const parsed = parsePerson(req.body)
  if (parsed.status === 'bad') {
    next(parsed)
    return
  }
  console.log('Attempting creation:', parsed.person);
  // If duplicate, error
  const matchingPeople = Person.find( // Should use countDocuments()
    {
      $or: [
        { name: parsed.person.name },
        { number: parsed.person.number }
      ]
    })
    .then(people => {
      if (people.length > 0) {
        console.log(`${people.length} Conflict(s) in DB:`, people)
        next({ error: 'ValidationError', status: 'bad', msg: 'Name or number already exists' })
        return
      } else {
        const person = new Person(parsed.person)
        return person.save()
      }
    })
    .then(savedPerson => {
      console.log('Saved:', savedPerson)
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        console.log('Found:', person);
        res.json(person)
      } else {
        next({ error: 'NotFound', msg: 'Person ID not found' })
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const parsed = parsePerson(req.body)
  if (parsed.status === 'bad') {
    next(parsed)
    return
  }
  Person.findByIdAndUpdate(req.params.id, parsed.person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        console.log('Updated:', updatedPerson)
        res.json(updatedPerson)
      } else {
        next({ error: 'NotFound', msg: 'Person ID not found' })
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      if (result) {
        console.log('Deleted:', result)
        res.status(204).end()
      } else {
        next({ error: 'NotFound', msg: 'Person ID not found' })
      }
    })
    .catch(error => next(error))
})

app.use((req, res, next) => {
  res.status(404).json({ error: 'Path does not exist' })
})

errorHandler = (error, req, res, next) => {
  console.error('Error: ', error)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.error === 'ValidationError') {
    return res.status(400).json(error)
  } else if (error.error === 'NotFound') {
    return res.status(404).json(error)
  }
  console.log('Error unhandled. Fallback to default error handler')
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
