const expect = require('chai').expect;
const db = require('../models');
const User = db.models.User;
const Award = db.models.Award;
const Sequelize = db.Sequelize;

// console.log(typeof User.findUsersViewModel);

describe('User model', function(){
    describe('Class methods', function(){
        beforeEach(function(){
            return db.syncAndSeed().then(() => {
                // done();
            }).catch(err => {
                console.log(err);
                throw err; })
                // return db.syncAndSeed(); // didn't work
        });

        describe('findUsersViewModel', function(){
            it('should be a class method', function(){
                // console.log(typeof User.findUsersViewModel);
                expect(typeof User.findUsersViewModel).to.equal('function');
            });

        });
        describe('destroyById', function(){
            // beforeEach(function(){
            //     return db.syncAndSeed().catch(err => { console.log(err); })
            // });

            it('should delete record by ID', function(){
                User.destroyById(3)
                    .then(() => {
                        return User.findOne({
                            where: {
                                id: 3
                            }
                        }).then((user) => {
                            // console.log(user.name)
                            expect(user).be.null;
                            // done();
                        })
                    })
            });
        });

        describe('generateAward', function(){
            // beforeEach(function(){
            //     return db.syncAndSeed().then(() => {
            //         // done();
            //     }).catch(err => { throw err; })
            //         // return db.syncAndSeed(); // didn't work
            // });

            it('should generate an award for the user id', function(){
                return User.generateAward(3)
                    .then(() => {
                        return User.findOne({
                            where: {
                                id: 3
                            },
                            include: [{
                                model: Award
                            }]
                        })
                    }).then(user => {
                        // console.log(user);
                        // Note: user.awards is array of sequelize objects.
                        // It contains more value than JSON outputs in the FE.
                        // Why is that? The viewmodel.users still has all the
                        // extra keys, but FE doesn't see it.
                        // res.json got rid of it?
                        // Answer is yes.
                        expect(user.awards.length).to.equal(1);
                        // done();
                    })
            });
        });

        describe('removeAward', function(){
            it('should remove an award from user', function(){
                return User.removeAward(1, 1)
                            .then(() => {
                                Award.findAll({
                                    include:[{
                                        model: User,
                                        where: {
                                            id: 1
                                        }
                                    }]
                                }).then(result => {
                                    // console.log(result);
                                    expect(result.length).to.equal(1);
                                })
                            })
            })

        })

        describe('updateUserFromRequestBody', function(){
            // beforeEach(function(){
            //     return db.syncAndSeed().then(() => {
            //         // done();
            //     }).catch(err => { throw err; })
            //         // return db.syncAndSeed(); // didn't work
            // });

            it('should remove mentor if mentor exists', function(){
                return User.updateUserFromRequestBody(3)
                    .then(() => {
                        User.findOne({
                            where: {
                                id: 3
                            }
                        }).then(user => {
                            // console.log(user.mentorId)
                            expect(user.mentorId).be.null;
                            // done();
                        })
                    })
            });

            it('should add mentor if mentor does NOT exist', function(){
                return User.updateUserFromRequestBody(2, {mentorId: 1})
                    .then(() => {
                        User.findOne({
                            where: {
                                id: 2
                            }
                        }).then(user => {
                            // console.log(user.mentorId)
                            expect(user.mentorId).to.equal(1);
                            // done();
                        })
                    })
            })
        })

    })
})
