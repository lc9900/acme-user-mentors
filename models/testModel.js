const db = require('../models');
const User = db.models.User;
const Award = db.models.Award;
const Sequelize = db.Sequelize;

db.syncAndSeed().then(() => {}).catch((err) => {
    throw err;
})
