const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');
const cities = require('./cities')
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'))
db.once('open', ()=>{
    console.log('Database Connected')
})

const sample = array => {
    return array[Math.floor(Math.random()*array.length)]
}

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i =0; i<300; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) +10
        const camp = new Campground({
            author: '61ba285c521dcb32bdfefa96',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry : { 
                type : "Point", 
                coordinates : [cities[random1000].longitude,cities[random1000].latitude] 
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/anuj999/image/upload/v1639835147/Yelpcamp/uxdfwqbo33c4vvzspiad.jpg',
                  filename: 'Yelpcamp/uxdfwqbo33c4vvzspiad',
                },
                {
                  url: 'https://res.cloudinary.com/anuj999/image/upload/v1639835147/Yelpcamp/qclen8d16g0tzfgjqu0r.jpg',
                  filename: 'Yelpcamp/qclen8d16g0tzfgjqu0r',
                }
              ],
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea nostrum culpa enim? Architecto repudiandae similique voluptate dicta, harum voluptatibus, provident maiores nesciunt nihil libero autem officia magni iure est aspernatur',
            price
        })
        await camp.save()
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
});
