import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, SuperDoistSettings, SuperDoistSettingsTab } from './settings';

// Remember to rename these classes and interfaces!



export default class SuperDoist extends Plugin {
	settings: SuperDoistSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SuperDoistSettingsTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
