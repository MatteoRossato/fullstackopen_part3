const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

// l'indirizzo del database arriva dal file .env, non è scritto qui
const url = process.env.MONGODB_URI

console.log('connecting to MongoDB')

mongoose.connect(url, { family: 4 })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

// com'è fatta una persona
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    required: true
  },
})

// quando una persona viene trasformata in JSON (per mandarla al frontend):
// _id diventa id (come stringa) e spariscono _id e __v
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
