//carica le variabili del file .env (va messo per primo)
require('dotenv').config()
//importa libreria per creare server
const express = require('express') 
//importa middleware per richieste HTTP
const morgan = require('morgan')
//middleware per richieste da altre origin
const cors = require('cors')
//modello Person collegato al database (models/person.js)
const Person = require('./models/person')
const person = require('./models/person')


//crea applicazione Express
const app = express()

//Registra nuovo TOKEN -> si può usare :body
morgan.token('body', (request) => {
    return JSON.stringify(request.body)
})

//da il timbro CORS, deve essere messo prima in modo che richieste siano valide
app.use(cors())
app.use(express.static('dist'))
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
app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})

//GET per avere una persona con ID specifico
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
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
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

//POST va a creare una persona sul server
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    
    const person = new Person({
        name : body.name,
        number : body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body
    Person.findById(
        request.params.id,
        {name, number},
        {new: true, runValidation: true, context: 'query'})
        .then(person => {
            if (!person) {
                return response.status(404).end()
            }
        })
        
        person.name = name
        person.number = number

        return person.save().then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})



const unknownEndpoint = (request, response) => {
    response.status(404).send({error : 'unknown Endpoin'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({error : 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({error : error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`)
})

