import { ItemView, WorkspaceLeaf } from "obsidian";
import { CalibrePluginSettings } from "./settings";
import * as ip from "ip";

export const CALIBRE_VIEW_TYPE = "calibre-view";

export class CalibreView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private settings: CalibrePluginSettings) {
    super(leaf);
  }

  getViewType() {
    return CALIBRE_VIEW_TYPE;
  }

  getDisplayText() {
    return this.settings.displayText;
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    try {
      const res = await fetch(this.settings.replaceLocalIp
        ? this.settings.address.replace('localhost', ip.address())
        : this.settings.address, {
        method: 'GET',
        headers: {
          remember_token: "1|227fb89fe72afd0bf4b5d09989e4772ac04dabd936de2468b8158f00406c7e6fd974fddfa53c2e9e81d02169f4e871e48991bbf3915f9bafc37984b2e24f79db;"
        }
      });
      const blob = await res.blob();
      const urlObject = URL.createObjectURL(blob);

      const iframe = container.createEl('iframe');

      iframe.setAttribute('sandbox', 'allow-forms allow-presentation allow-same-origin allow-scripts allow-modals allow-downloads allow-popups');
      iframe.src = urlObject;
    } catch (e) {
      console.error(e);
      const error = container.createDiv({ text: e.toString() });
      error.style.color = 'var(--text-title-h1)';
    }
  }

  async onClose() {
    // Nothing to clean up.
  }
}
