const Sequelize = require('sequelize');
const dbUrl = process.env.DATABASEURL || 'postgres://localhost/acmeusermentordb';
const db = new Sequelize(dbUrl);
const faker = require('faker');
const utils = require('../utils');

//////////////////////////////////////////////////
// User Model

const User = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

User.belongsTo(User, {as: 'mentor'} );

// Tested
// The resulting viewModel will have two properties
// viewModel.users -- containing an array of all users and related info, including mentor, and award
// viewModel.mentors -- an array of users that has at least two awards
User.findUsersViewModel = function(){
    var mentors = [],
        viewModel = {};
    return User.findAll({
            include: [Award, {model: User, as: 'mentor'}]
        }).then((users) => {
          users.forEach(function(user){
            if(user.awards.length >= 2) {
                mentors.push(user);
            }
          });
          viewModel.users = users;
          viewModel.mentors = mentors;
          return viewModel;
        })
}

// Tested
User.destroyById = function(id){
    return User.findOne({
        where: {
            id: parseInt(id)
        }
    }).then((user) => {
        return user.destroy();
    })
}

// Tested
User.generateAward = function(id){
    return Promise.all([
                            Award.create({name: faker.company.catchPhrase()}),
                            User.findOne({
                                where: {
                                    id: id
                                }
                            })
                       ]).then((results) => {
                            var award = results[0];
                            var user = results[1];
                            return user.addAward(award);
                       })

}

// Tested
User.removeAward = function(userId, awardId) {
    // return Promise.all([
    //                         Award.findOne({where: { id: awardId}}),
    //                         User.findOne({where: {id: userId}})
    //                    ]).then((results) => {
    //                         var award = results[0];
    //                         var user = results[1];
    //                         user.removeAward(award); // This is not the class methods
    //                    })

    return User.findOne({where: {id: parseInt(userId)}})
                .then((user) => {
                    user.removeAward(parseInt(awardId))
                        .catch((err) => {throw err});

                    return user;
                }).then((user) => {
                        // If the user award count is below 2
                        // then remove all mentorship
                        utils.inform(`Removing Award for user ${user.name}`);
                        return Award.findAndCountAll({
                            // where: {
                            //     userId: user.id
                            // },
                            include: [{
                                model: User,
                                where: {
                                    id: user.id
                                }
                            }]
                        }).then(result => {
                            // utils.inform(result.count);
                            // utils.inform(result.rows);
                            // utils.inform(result.rows.length);
                            if(result.rows.length < 2) {
                                // utils.inform("In the if")
                                utils.inform(result.rows.length);

                                // Now remove all users' mentorId who has this particular user as mentor
                                return User.findAll().then(() => {
                                    return User.update(
                                                { mentorId: null }, // Setting mentorId to null
                                                { where: { mentorId: user.id }} /* where criteria */
                                              );
                                })
                            }

                            // utils.inform(user);
                        })
                }).catch((err) => { throw err; });
}

// This is to removing a mentor and adding mentor
// req.body will have mentorId.
// Tested
User.updateUserFromRequestBody = function(userId, reqBody){
    return User.findOne({where: {id: userId}})
                .then((user) => {
                    // utils.inform(user.name);
                    // utils.inform(user.mentorId);
                    if (!user.mentorId) {
                        user.mentorId = parseInt(reqBody.mentorId);
                        utils.inform("Mentor Added");
                        return user.save();
                    }
                    // user.setMentor(parseInt(reqBody.mentorId));
                    else {
                        // utils.inform("Mentor removed");
                        return user.setMentor(null);
                    }
                })
}

//////////////////////////////////////////////////
// Award Model

const Award = db.define('award', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

//////////////////////////////////////////////////
// UserAwardMap Model
User.belongsToMany(Award, {through: 'userawardmap'});
Award.belongsToMany(User, {through: 'userawardmap'})


const syncAndSeed = function(){
    return db.sync({force: true})
        .then(() => {
            utils.inform("Database synced");
            return Promise.all([
                                   User.create({name: 'Michael Jordan'}),
                                   User.create({name: 'Lebron James'}),
                                   User.create({name: 'Kobe Bryant', mentorId: 1}),
                                   Award.create({name: faker.company.catchPhrase()}),
                                   Award.create({name: faker.company.catchPhrase()})
                               ]).then(() => {
                                    // Seeding mentor and award
                                    return Promise.all([User.findOne({
                                                            where: {
                                                                name: 'Michael Jordan'
                                                            }
                                                        }),
                                                        Award.findAll()
                                    ])
                               }).then((results) => {
                                    var awards = results[1];
                                    var user = results[0];
                                    awards.forEach(function(award){
                                        award.addUser(user);
                                    })
                               }).catch((err) => {
                                    throw err;
                               });
        }).then(() => {
            utils.inform("Database seeded");
        }).catch((err) => {
            throw err;
        });

}

module.exports = {
    syncAndSeed,
    models: {
        User, Award
    }
};


// Test Code
// db.authenticate()
//     .then(() => {
//         return utils.inform("Database is good");
//     }).catch((err) => {
//         return utils.alert(err);
//     })

// console.log(faker.company.catchPhrase())

// syncAndSeed().then(() => {
    // return User.destroyById(1).then(() => {
    //     utils.inform("User destroyed")
    // })

    // return User.generateAward(1).then(()=> {
    //     utils.inform("Award generated");
    // })

    // return User.removeAward(1, 2).then(()=> {
    //     utils.inform("Award removed");
    // })

    // return User.updateUserFromRequestBody(2, {mentorId: '1'}).then((user)=> {
    //     return user.getMentor()
    // }).then((result)=>{
    //     utils.inform(result.name); // getMentor gets the whole user object.
    // })

    // return User.updateUserFromRequestBody(3, {mentorId: '1'}).then((user)=> {
    // })

    // return Award.findAndCountAll({
    //                     include:[{
    //                         model: User,
    //                         through: {
    //                             userId: 1
    //                         }
    //                     }]
    //                 }).then(result => {
    //                     utils.inform(result.count);
    //                     utils.inform(result.rows);
    //                 });




// }).then(() => {
    // return User.updateUserFromRequestBody(3, {mentorId: '1'}).then((user)=> {
    //     return user.getMentor()
    // }).then((result)=>{
    //     utils.inform(result.name); // getMentor gets the whole user object.
    // })
// }).catch((err) => {
//     throw err;
// })

// Award.findAndCountAll({
//                         // where: {
//                         //     userId: user.id
//                         // },
//                         include: [{
//                             model: User,
//                             where: {
//                                 id: 2
//                             }
//                         }]
//                     }).then(result => {
//                         // utils.inform(result.count);
//                         // utils.inform(result.rows);
//                         utils.inform('In test');
//                         utils.inform(result.rows.length);
//                     })
