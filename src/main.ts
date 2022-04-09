import { Plugin } from 'obsidian';
import { Parser } from './parser';
import { DEFAULT_SETTINGS, SuperDoistSettings, SuperDoistSettingsTab } from './settings';


export default class SuperDoist extends Plugin {

	settings: SuperDoistSettings;
	parser: Parser

	async onload() {
		await this.loadSettings();
		this.addCommands()
		this.app.workspace.onLayoutReady(() => this.initPlugin());
	}
	
	initPlugin() {
		this.parser = new Parser(this)
		this.addSettingTab(new SuperDoistSettingsTab(this.app, this));
	}

	addCommands() {
		this.addCommand({
			id: "sync-todoist",
			name: "Sync with Todoist",
			callback: () => this.syncAll()
		})
	}

	syncAll() {
		this.parser.scan()
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
