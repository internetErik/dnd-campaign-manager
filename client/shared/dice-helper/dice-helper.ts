import {Component}       from '@angular/core';
import {simpleRoll}      from '../../../lib/dice';
import {Rolls}           from '../../../lib/collections/rolls';
import {InjectUser}      from 'angular2-meteor-accounts-ui';
import {MeteorComponent} from 'angular2-meteor';
import {CommandPaletteService} from '../../services/command-palette-service';
@Component({
  selector: 'dice-helper',
	template: `
	<div class="dice-helper p20 posf b0 l0 bgc-white add-shadow max-width" 
		[class.hide-dice]="diceHidden">
		<button class="p10-0 pl20 pr20" (click)="toggleDiceHelper()">
			<span *ngIf="diceHidden">Show</span>
			<span *ngIf="!diceHidden">Hide</span>
		</button>
		<button class="p10-0 pl20 pr20" 
			[disabled]="!campaign"
			(click)="clearRolls()">Clear</button>
		<button *ngFor="let die of dice"
			class="p10-0 pl20 pr20 mr5"
			[disabled]="disabled"
			(click)="roll(die)">
			d{{die}}
		</button>
		Bonus: <input type="number" [(ngModel)]="rollBonus" value="0" >
		<div class="p10-0">
		Current Roll: {{currentRoll}} 
		</div>
		<div *ngIf="currentUser && campaign">
			<div class="p10-0" *ngIf="rollPublic">
				Last 5 Rolls: 
				<span *ngFor="let roll of lastRolls;let last = last" 
					[class.critical-roll]="roll.result === roll.sides">
					{{roll.result + roll.bonus}} (d{{roll.sides}} + {{roll.bonus}})<span *ngIf="!last">,</span> 
				</span>
			</div>
			<div class="p20-0">
				<button class="p10-0 pl20 pr20" 
					[disabled]="!campaign"
					(click)="togglePublicRolls()">
					<span *ngIf="rollPublic">Private</span>
					<span *ngIf="!rollPublic">Public</span>
				</button>
			</div>
		</div>
	</div>
	`
})
@InjectUser('currentUser')
export class DiceHelper extends MeteorComponent {
	currentRoll: string = '';
	lastRolls: any;

	rollBonus: number = 0;
	//are the buttons disabled because we are rolling?
	disabled: boolean = false;
	//should these rolls be public or private?
	rollPublic: boolean = true;
	//are the dice visible?
	diceHidden: boolean = true;
	dice: number[] = [2, 4, 6, 8, 10, 12, 20, 100];
	
	//the current user
	currentUser: any;
	//current campaign
	campaign: any;
	//current character
	character: any;

	constructor() {
		super();
		this.autorun(() => {
			this.campaign = Session.get('campaign');
			if(this.campaign)
				this.subscribeRolls()
		}, true);
		//register actions that can be taken from the command palette
		this.dice.map((sides) => {
			CommandPaletteService.registerAction(`dice-roll-1d${sides}`, () => {
				if(this.diceHidden) this.toggleDiceHelper();
				this.roll(sides);
			})
		});
		CommandPaletteService.registerAction('dice-toggle', () => this.toggleDiceHelper() );
		CommandPaletteService.registerAction('dice-clear-rolls', () => this.clearRolls() );
	}

	toggleDiceHelper() {
		this.diceHidden = !this.diceHidden;
	}

	togglePublicRolls() {
		this.rollPublic = !this.rollPublic;
	}

  subscribeRolls() {
    this.subscribe('rolls', this.campaign._id, () => {
        this.lastRolls = Rolls.find({}, { sort: { createDate: -1 } });
    }, true);
	}

	roll(sides) {
		this.disabled = true;
		this.currentRoll = '. . . ROLLING! . . .';
		setTimeout(() => {
			let result = simpleRoll(sides);
			this.currentRoll = `${result + this.rollBonus} (d${sides} + ${this.rollBonus})`;
			this.disabled = false;
			if(this.rollPublic && this.currentUser && this.campaign)
				this.insertRoll(this.campaign, result, sides, this.rollBonus);
		}, 250);
	}

	clearRolls() {
		if(this.campaign) {
			Meteor.call('clearRolls', this.campaign._id);
      this.subscribeRolls();
		}
	}

	insertRoll(campaign, result, sides, bonus) {
		var roll = { 
			campaignId: campaign._id,
			result: result, 
			sides: sides, 
			bonus: bonus
		};

		Meteor.call('insertRoll', roll);
	}
}