const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { sequelize } = require('./database');

const userRoutes = require('./api/users');
const contactRoutes = require('./api/contacts');
const spamRoutes = require('./api/spam');
const searchRoutes = require('./api/search');
const app=express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/user',userRoutes);
app.use('/contact',contactRoutes);
app.use('/spam',spamRoutes);
app.use('/search',searchRoutes);

sequelize.sync({}).then(()=>{
    app.listen(3000);
    console.log("Server is running on port 3000")
})
// async function synchronizeModels() {
//     await sequelize.sync({});
//     console.log("All models were synchronized successfully.");
//     console.log(RegisteredUser === sequelize.models.RegisteredUser);
//     console.log(Contact === sequelize.models.Contact);
//     console.log(SpamNumber === sequelize.models.SpamNumber);
// }

// app.listen(3000);
// const app = express();
// app.listen(3000)

// async function authenticateDatabase() {
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// }

// authenticateDatabase();
