import { App, PluginSettingTab, Setting } from "obsidian";
import SuperDoist from "./main";

export interface SuperDoistSettings {
	rootProjectDir: string;
	todoistAuth: string;
}

export const DEFAULT_SETTINGS: SuperDoistSettings = {
	rootProjectDir: 'Projects',
	todoistAuth: "",
}

export class SuperDoistSettingsTab extends PluginSettingTab {

	plugin: SuperDoist;

	constructor(app: App, plugin: SuperDoist) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for SuperDoist'});

		new Setting(containerEl)
			.setName('Root project directory')
			.setDesc('Directory under which the plugin will start looking for projects and todoist tasks')
			.addText(text => text
				.setPlaceholder('e.g. Projects')
				.setValue(this.plugin.settings.rootProjectDir)
				.onChange(async (value) => {
					this.plugin.settings.rootProjectDir = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Todoist authorisation token')
			.addText(text => text
				.setValue(this.plugin.settings.todoistAuth)
				.onChange(async (value) => {
					this.plugin.settings.todoistAuth = value;
					await this.plugin.saveSettings();
				}));
	}
}
