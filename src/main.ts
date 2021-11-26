import { addIcon, Plugin, TFile } from 'obsidian';
import { CalibrePluginSettings, CalibreSettingTab, DEFAULT_SETTINGS } from './settings';
import { calibreContainer, CALIBRE_ICON_ID, CALIBRE_ICON_SVG } from './tools';

const CALIBRE_CONTAINER_FILE_NAME = 'CALIBRE';
const CALIBRE_CONTAINER_FILE_PATH = `${CALIBRE_CONTAINER_FILE_NAME}.md`;

export default class CalibrePlugin extends Plugin {
	settings: CalibrePluginSettings;

	async onload() {
		try {
			await this.loadSettings();
			this.addSettingTab(new CalibreSettingTab(this.app, this));
			addIcon(CALIBRE_ICON_ID, CALIBRE_ICON_SVG);

			this.addRibbonIcon(CALIBRE_ICON_ID, 'Calibre', (event: MouseEvent) => {
				const calibre = this.app.vault.getAbstractFileByPath(CALIBRE_CONTAINER_FILE_PATH);
				this.app.workspace.getLeaf(true).setViewState({
					type: 'markdown',
					state: { file: calibre.path, mode: 'preview' }
				});
			});

			this.app.workspace.onLayoutReady(() => {
				this.app.workspace.getLeavesOfType('markdown')
					.filter((leaf) => leaf.getViewState().state?.file == CALIBRE_CONTAINER_FILE_PATH)
					.forEach((leaf) => {
						const state = leaf.getViewState();
						state.state.mode = 'preview';
						leaf.setViewState(state);
					});
			});
			
			this.registerEvent(this.app.metadataCache.on('resolved', () => {
				this.createCalibreContainerFile();
			}));
		} catch (error) {
			console.log(`Load error. ${error}`);
		}
	}
	
	async createCalibreContainerFile(): Promise<TFile> {
		if (await this.app.vault.adapter.exists(CALIBRE_CONTAINER_FILE_PATH)) {
			return this.app.vault.getAbstractFileByPath(CALIBRE_CONTAINER_FILE_PATH) as TFile;
		}
		return this.app.vault.create(CALIBRE_CONTAINER_FILE_PATH, calibreContainer(this.settings.address));
	}

	async loadSettings() {
		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}