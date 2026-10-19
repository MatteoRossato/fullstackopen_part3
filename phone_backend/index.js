//importa libreria per creare server
const express = require('express') 
//importa middleware per richieste HTTP
const morgan = require('morgan')
//middleware per richieste da altre origin
const cors = require('cors')


//crea applicazione Express
const app = express()

//Registra nuovo TOKEN -> si può usare :body
morgan.token('body', (request) => {
    return JSON.stringify(request.body)
})

//da il timbro CORS, deve essere messo prima in modo che richieste siano valide
app.use(cors())
//middleware per leggere corpo delle richieste che altrimenti sarebbero undefined
app.use(express.json())
//modalità tiny prende informazione delle richieste (c'era tiny poi cambiato e aggiunto anche :body)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//funzione generica per generare ID
const generateId = () => {
    return String(Math.floor(Math.random() * 1000000))
}
//non abbiamo server al momento passiamo noi i dati
let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]
//GET per avere tutte le informazioni
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

//GET per avere una persona con ID specifico
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

//GET ma ha risposta con HTML 
app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`
        <p>Phonebook has info for ${persons.length}</p>
        <p>${date}</p>
        `)
})

//DELETE per eliminare persona con ID specifico
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    
    response.status(204).end()
})

//POST va a creare una persona sul server
app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    if(persons.some(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id : generateId(),
        name : body.name,
        number : body.number
    }

    persons = persons.concat(person)
    response.json(person)

})

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`)
})

