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

const parsePerson = (p) => {
  if (!p.name) { return { error: 'ValidationError', status: 'bad', msg: 'Must contain name' } }
  if (!p.number) { return { error: 'ValidationError', status: 'bad', msg: 'Must contain number' } }
  return resp = { status: 'ok', person: p }
}

// Person CRUD endpoints
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(result => { res.json(result) })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  // Parse (unnecessary, duplicated in DB save, but i don't like no API layer validation)
  const person = new Person(req.body)
  const validation = person.validateSync()
  if (validation) {
    return next(validation)
  }
  console.log('Attempting creation:', person.toJSON());
  person.save()
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
  // Skip parsing, just use the model (Don't fight the framework)
  Person.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, context: 'query' })
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
  console.error(error)
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'ValidationError', msg: "ID is invalid" })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: 'ValidationError', msg: error.message })
  } else if (error.name === 'MongoServerError') {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate', msg: `Duplicated field: ${JSON.stringify(error.keyValue)}` })
    } 
  }
  else if (error.error === 'NotFound') {
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
