const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const R = require('ramda')
const Goals = require('./models/Goals')
const Meal = require('./models/Meals')
dotenv.config()
const app = express()
const port = 3000
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/Nutritraque', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected')
}).catch(err => {
  console.error('MongoDB connection error:', err)
})
app.use(cors());

app.get('/', (req, res) => {
    
})

app.get('/goals', async (req, res) => {
  try {
    const goals = await Goals.find()
    res.json(goals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
app.get('/meals', async (req, res) => {
  try {
    const meals = await Meal.find()
    res.json(meals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/goals', async (req, res) => {
  try {
    const existingGoals = await Goals.find()
    
    if (existingGoals.length > 0) {
      const updatedGoals = await Goals.findByIdAndUpdate(
        existingGoals[0]._id,
        {
          calories: req.body.calories,
          proteines: req.body.proteines,
          lipides: req.body.lipides,
          glucides: req.body.glucides
        },
        { new: true }
      )
      res.json(updatedGoals)
    } else {
      const goals = new Goals({
        calories: req.body.calories,
        proteines: req.body.proteines,
        lipides: req.body.lipides,
        glucides: req.body.glucides
      })
      const newGoals = await goals.save()
      res.status(201).json(newGoals)
    }
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

app.put('/goals/:id', async (req, res) => {
  try {
    const goals = await Goals.findById(req.params.id)
    if (!goals) return res.status(404).json({ message: 'Objectifs non trouvés' })
    
    goals.calories = req.body.calories
    goals.proteines = req.body.proteines
    goals.lipides = req.body.lipides
    goals.glucides = req.body.glucides
    
    const updatedGoals = await goals.save()
    res.json(updatedGoals)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

app.post('/meals', async (req, res) => {
  const meals = new Meal({
    plat: req.body.plat,
    calories: req.body.calories,
    proteines: req.body.proteines,
    lipides: req.body.lipides,
    glucides: req.body.glucides
  })
  try {
    const newMeals = await meals.save()
    res.status(201).json(newMeals)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

app.delete('/goals/:id', async (req, res) => {
  try {
    const goals = await Goals.findById(req.params.id)
    if (!goals) return res.status(404).send('Goals not found')
    await goals.remove()
    res.json({ message: 'Goals deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
app.delete('/meals/:id', async (req, res) => {
  try {
    const meals = await Meals.findById(req.params.id)
    if (!meals) return res.status(404).send('Meals not found')
    await meals.remove()
    res.json({ message: 'Meals deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})