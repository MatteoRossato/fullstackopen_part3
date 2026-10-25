const mongoose = require('mongoose')

//Check della password
if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

//prende password e la usa nell'url in modo che non sia mai li presente
const password = process.argv[2]
const url = `mongodb+srv://matteorossato95_db_user:${password}@cluster0.mqc5uyp.mongodb.net/phonebookApp?retryWrites=true&w=majority`

//impostazione per connettersi al database
mongoose.set('strictQuery', false)
mongoose.connect(url, {family : 4})

//spieghi a mongo come è fatta la persona oggetto
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

//salverà le persoe nella cartella people, pluralizzato da solo
const Person = mongoose.model('Person', personSchema)

//se 3 elementi visualizza lista altrimenti aggiungi dato 
if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
} else {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({name, number})
    person.save().then(()=> {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}