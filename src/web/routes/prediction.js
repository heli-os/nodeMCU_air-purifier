const express = require('express');
const router = express.Router();
const tf = require('@tensorflow/tfjs');

router.post('/api', async (req, res, next) => {
    const model = await tf.loadGraphModel('https://genie.jupiterflow.com/static/tf-model/model.json');

    // const input = tf.convert_to_tensor();

    const arr = [[]];

    arr[0].push(parseFloat(req.body.air_conditioner));
    arr[0].push(parseFloat(req.body.here_people));
    arr[0].push(parseFloat(req.body.all_people));


    const prediction = model.predict(
        tf.tensor(arr)).arraySync();

    console.log(prediction);


    return res.json(prediction);


});

module.exports = router;