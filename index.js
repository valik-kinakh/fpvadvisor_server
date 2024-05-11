const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

require('dotenv').config();

const { mongoConnect } = require('./mongo');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

// Define a schema and model
const Schema = mongoose.Schema;
const DroneSchema = new Schema({
    name: String,
    purpose: String,
    type: {
        type: String,
        required: false
    },
    distance: Number,
    payload: Number,
    flightTime: Number,
    isNight: Boolean,
    price: Number,
    successRate: Number,
    speed: Number,
    imageUrl: String
});
const DroneModel = mongoose.model('drone', DroneSchema);

app.get('/', (req, res) => {
    return res.send('server works')
})

app.post('/drones/find', async (req, res) => {
    try {
        const { operationType, flightType,
            combatFlightDetails,
            intelligenceFlightDetails,
            whetherConditions,
        } = req.body;
        const { isNight } = whetherConditions;

        if (operationType === 'CombatFlight'){
            const { distance, payload } = combatFlightDetails || {};

            const result = await DroneModel.find({
                purpose: operationType,
                type: flightType,
                distance: { $gte: distance },
                payload: { $gte: payload },
                isNight
            })

            if (result?.length === 0) {
                const newResult = await DroneModel.find({
                    purpose: operationType,
                    type: flightType,
                    isNight
                }).limit(5);

                return res.json(newResult);
            }

            return res.json(result)

        }else if (operationType === 'Intelligence'){
            const { distance, duration } = intelligenceFlightDetails || {};

            const result = await DroneModel.find({
                purpose: operationType,
                distance: { $gte: distance },
                flightTime: { $gte: duration },
                isNight
            })

            if (result?.length === 0) {
                const newResult = await DroneModel.find({
                    purpose: operationType,
                    isNight
                }).limit(5);

                return res.json(newResult);
            }

            return res.json(result)
        }
    }catch (e) {
        return res.status(400).json({
            message: e?.message
        })
    }
})

const server = http.createServer(app);

async function startServer() {
    await mongoConnect();

    server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
}

startServer();