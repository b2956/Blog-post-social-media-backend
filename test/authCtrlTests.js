const { expect } = require('chai');
const sinon = require('sinon');

const User = require('../models/user');
const AuthController = require('../controllers/authCtrl');

describe('Auth Controller - Login', function() {
    it('should throw an error with code 500 if accessing the database fails', function(done) {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'hello'
            }
        }
        AuthController.userLogin(req, {}, () => {})
        .then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done();
        });

        User.findOne.restore();
    });
});