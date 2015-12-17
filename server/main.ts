import {initCharacters} from 'server/initCharacters';
import {initSpells} from 'server/initSpells';
import {initSkills} from 'server/initSkills';
import {initFeats} from 'server/initFeats';

import {Characters} from 'collections/characters';
import {Campaigns} from 'collections/campaigns';
import {Rolls} from 'collections/rolls';
import {Spells} from 'collections/spells';
import {Skills} from 'collections/skills';
import {Feats} from 'collections/feats';
import {Monsters} from 'collections/monsters';
import {Battles} from 'collections/battles';

Meteor.startup(function() { 
	//for some reason if we don't do something with the DBS on start, 
	//they won't show on the front end
	initCharacters();
	initSpells();
	initSkills();
	initFeats();
	
	Campaigns.find().count();
	Rolls.find().count();
	Monsters.find().count();
	Battles.find().count();
});

Meteor.publish('battles', function() {
	return Battles.find();
});

Meteor.publish('campaigns', function() {
	return Campaigns.find({});
});

Meteor.publish('characters', function() {
	return Characters.find({});
});

Meteor.publish('feats', function() {
	return Feats.find({});
});

Meteor.publish('monsters', function() {
	return Monsters.find({});
});

Meteor.publish('rolls', function() {
	return Rolls.find({});
});

Meteor.publish('skills', function() {
	return Skills.find({});
});

Meteor.publish('spells', function() {
	return Spells.find({});
});