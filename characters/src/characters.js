var db = require('./data');

function CharacterController(sequelizeClient) {
	
}

function ReadCharacter(name) {
	
}

CharacterController.prototype.read = ReadCharacter;

module.exports = CharacterController;