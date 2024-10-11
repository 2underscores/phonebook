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

// Middlewares
app.use(cors({origin: 'http://localhost:5173',}))
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
  if (personsData.find(p2=>p2.name===p.name)) {return {status: 'bad', msg: 'Name already exists'}}
  return resp = {status: 'ok', person: p}
}

app.post('/api/persons', (req, res)=>{
  console.log(req.body)
  const id = generateId();
  const parse = parsePerson(req.body)
  if (parse.status === 'bad') {
    console.log(parse)
    res.status(400).json(parse)
    return
  }
  const person = {...parse.person, id:id}
  personsData = personsData.concat(person) // TODO: Save to DB
  res.json(person)
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

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
