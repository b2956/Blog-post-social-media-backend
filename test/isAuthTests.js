const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
 
const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function() {
    it('should throw an error if no authorizations header is present', function() {
        const req = {
            get: function() {
                return null;
            }
        };
        expect(() => authMiddleware(req, {}, () => {})).to.throw('User is not authenticated'); 
    });
    
    it('should throw an error if the authorization header is only one string', function() {
        const req = {
            get: function(headerName) {
                return 'xyz';
            }
        };
        expect(() => authMiddleware(req, {}, () => {})).to.throw();
    });

    it('should throw an error if the token cannot be verified', function() {
        const req = {
            get: function(headerName) {
                return 'Bearer xyz';
            }
        }
        expect(() => authMiddleware(req, {}, () => {})).to.throw();
    });

    it('should have a userId after decoding the token', function() {
        const req = {
            get: function(headerName) {
                return 'Bearer xyzfssgdf5ty3334';
            }
        }
        // jwt.verify = function(){
        //     return {
        //         userId: 'abc'
        //     }
        // }
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({userId: 'abc'});
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore()
    });
    
});