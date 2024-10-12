const express = require('express')
const crypto = require('crypto')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

let personsData = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": "1"
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": "2"
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": "3"
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": "4"
  },
  {
    "name": "Jeremy S",
    "number": "0424111111",
    "id": "5"
  },
  {
    "name": "Clare A",
    "number": "123",
    "id": "1997"
  },
  {
    "name": "Jeremy2",
    "number": "000",
    "id": "2119"
  }
]

// Middleware
// app.use(cors({origin: 'http://localhost:5173',}))
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
morgan.token('body', (req, res) => {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Endpoints
app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${personsData.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
  res.json(personsData)
})

app.get('/api/persons/:id', (req, res)=>{
  const id = req.params.id;
  const person = personsData.find(p=>p.id===id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

const generateId = () => {
  return crypto.randomBytes(2).toString('hex');
}

const parsePerson = (p) => {
  if (!p.name) {return {status: 'bad', msg: 'Must contain name'}}
  if (!p.number) {return {status: 'bad', msg: 'Must contain number'}}
  return resp = {status: 'ok', person: p}
}

app.post('/api/persons', (req, res)=>{
  const parsed = parsePerson(req.body)
  if (parsed.status === 'bad') {
    console.log(parsed)
    res.status(400).json(parsed)
    return
  }
  const personObj = {...parsed.person, ...{id: generateId()}}
  if (personsData.find(p2=>p2.name===personObj.name || p2.id===personObj.id)) {
    const result = {status: 'bad', msg: 'Name or ID already exists'}
    console.log(personObj)
    console.log(result)
    res.status(400).json(result)
    return
  }
  personsData = personsData.concat(personObj) // TODO: Save to DB
  console.log('Created:', personObj)
  res.json(personObj)
})

app.put('/api/persons/:id', (req, res)=>{
  const parsed = parsePerson(req.body)
  if (parsed.status === 'bad') {
    console.log(parsed)
    res.status(400).json(parsed)
    return
  }
  const personObj = {...parsed.person, ...{id: req.params.id}}
  personsData = personsData.map(p=>p.id===personObj.id ? personObj : p) // TODO: Delete DB
  console.log('Updated:', personObj)
  res.json(personObj)
})

app.delete('/api/persons/:id', (req, res)=>{
  const id = req.params.id;
  const person = personsData.find(p=>p.id===id)
  personsData = personsData.filter(p=>p.id!==id) // TODO: Delete DB
  res.status(person ? 204 : 404).end()
})

app.use((req, res, next)=> {
  res.status(404).json({error: 'Does not exist'})
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
