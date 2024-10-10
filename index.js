const express = require('express')

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

app.get('/info', (req, res) => {
  console.log(`${req.method} ${req.path}`)
  res.send(`<p>Phonebook has info for ${personsData.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
  console.log(`${req.method} ${req.path}`)
  res.json(personsData)
})

app.get('/api/persons/:id', (req, res)=>{
  console.log(`${req.method} ${req.path}`)
  const id = req.params.id;
  const person = personsData.find(p=>p.id===id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res)=>{
  console.log(`${req.method} ${req.path}`)
  const id = req.params.id;
  const person = personsData.find(p=>p.id===id)
  // TODO: Delete
  res.status(person ? 204 : 404).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
