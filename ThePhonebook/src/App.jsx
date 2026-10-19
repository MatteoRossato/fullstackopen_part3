import {useState, useEffect} from 'react'
import PersonForm from './components/PersonForm'
import Filter from './components/Filter'
import Persons from './components/Persons'
import personService from './services/persons'
import Notification from './components/Notification'


const App = () => {
  const [persons, setPersons] = useState([])

  useEffect(() => {
    personService
      .getAll()
      .then(initialPerson => {setPersons(initialPerson)})
  }, [])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)

  const notify = (text, type='success') => {
    setMessage({text, type})
    setTimeout(() => setMessage(null), 5000)
  }

  const addPerson = (event) => {
    event.preventDefault()
    
    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      const ok = window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)

      if(!ok) {
        return
      }
      const changedPerson = {...existingPerson, number : newNumber}
      personService
        .update(existingPerson.id, changedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson))
          notify(`Changed ${returnedPerson.name}`)
          setNewName('')
          setNewNumber('')
        })
        .catch(() => {
          notify(`Information of ${existingPerson.name} has already been deleted from server`, 'error')
          setPersons(persons.filter(p => p.id !== existingPerson.id))
        })

      return
    }

    const personObject = {
      name: newName,
      number: newNumber
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        notify(`Added ${returnedPerson.name}`)
        setNewName('')
        setNewNumber('')
      })
  }

  const deletePerson = (id) => {
    const person = persons.find(p => p.id === id)

    if (!window.confirm(`Delete ${person.name} ?`)) {
      return
    }

    personService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== id))
      })
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const personToShow = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <h2>PhoneBook</h2>
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      <Notification message={message}/>

      <h3>Add a New Name</h3>
      <PersonForm 
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h3>Contacts</h3>

      <Persons persons={personToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App