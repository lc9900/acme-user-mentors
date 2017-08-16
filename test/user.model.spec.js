const expect = require('chai').expect;
const db = require('../models');
const User = db.models.User;
const Award = db.models.Award;
const Sequelize = db.Sequelize;

console.log(typeof User.findUsersViewModel);
describe('User model', function(done){
    beforeEach(function(done){
        db.syncAndSeed().then(() => {
            done();
        })
            // return db.syncAndSeed(); // didn't work
    });

    describe('User model definition', function(){

        xit('should contain name', function(){});
    });

    describe('Class methods', function(){
        describe('findUsersViewModel', function(){
            it('should be a class method', function(){
                console.log(typeof User.findUsersViewModel);
                expect(typeof User.findUsersViewModel).to.equal('function');
            });

        });
        describe('Class Method destroyById', function(){
            it('should delete record by ID', function(done){
                User.destroyById(3)
                    .then(() => {
                        return User.findOne({
                            where: {
                                id: 3
                            }
                        }).then((user) => {
                            // console.log(user.name)
                            expect(user).be.null;
                            done();
                        })
                    })
            });
        });

        describe('Class Method generateAward', function(){
            xit('should generate an award for the user id', function(done){
                User.generateAward(3)
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
                        done();
                    })
            });
        });

        describe('Class Method removeAward', function(){

        })

        describe('Class Method updateUserFromRequestBody', function(){
            it('should remove mentor if mentor exists', function(done){
                User.updateUserFromRequestBody(3)
                    .then(() => {
                        User.findOne({
                            where: {
                                id: 3
                            }
                        }).then(user => {
                            // console.log(user.mentorId)
                            expect(user.mentorId).be.null;
                            done();
                        })
                    })
            });

            it('should add mentor if mentor does NOT exist', function(done){
                User.updateUserFromRequestBody(2, {mentorId: 1})
                    .then(() => {
                        User.findOne({
                            where: {
                                id: 2
                            }
                        }).then(user => {
                            // console.log(user.mentorId)
                            expect(user.mentorId).to.equal(1);
                            done();
                        })
                    })
            })
        })

    })
})
