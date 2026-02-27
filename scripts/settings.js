const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { RESULT_KEYS } from './main.js';

const moduleName = 'omniscient-die';

export class OmniscientSettingsApp extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        id: "omniscient-settings-app",
        tag: "form",
        window: { 
            title: "Omniscient Die - Advanced Settings", 
            resizable: true 
        },
        position: { width: 550, height: 650 }
    };

    static PARTS = {
        content: { template: `modules/omniscient-die/templates/settings-menu.hbs` }
    };

    async _prepareContext(_options) {
        const faces = Object.entries(RESULT_KEYS).map(([face, key]) => {
            return {
                face: face,
                key: key,
                imageNamePath: `omniscient-die.settings.customImage_${key}.name`,
                imageHintPath: `omniscient-die.settings.customImage_${key}.hint`,
                soundNamePath: `omniscient-die.settings.soundFace_${key}.name`,
                soundHintPath: `omniscient-die.settings.soundFace_${key}.hint`,
                customImage: game.settings.get(moduleName, `customImage_${key}`),
                sound: game.settings.get(moduleName, `sound_${key}`)
            };
        });

        return {
            chatImageMode: game.settings.get(moduleName, 'chatImage'),
            soundMode: game.settings.get(moduleName, 'soundMode'),
            soundVolume: game.settings.get(moduleName, 'soundVolume'),
            soundSingle: game.settings.get(moduleName, 'soundSingle'),
            faces: faces
        };
    }

    _onRender(context, options) {
        const html = this.element;

        // --- TAB SWITCHING LOGIC ---
        const navItems = html.querySelectorAll('.omniscient-nav .item');
        const tabItems = html.querySelectorAll('.tab-content .tab');

        navItems.forEach(nav => {
            nav.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = nav.dataset.tab;
                navItems.forEach(n => n.classList.toggle('active', n.dataset.tab === targetTab));
                tabItems.forEach(t => t.classList.toggle('active', t.dataset.tab === targetTab));
            });
        });

        // --- FILE PICKERS LOGIC ---
        html.querySelectorAll('button.file-picker').forEach(btn => {
            btn.addEventListener('click', event => {
                event.preventDefault();
                const target = event.currentTarget.dataset.target;
                const type = event.currentTarget.dataset.type || "image";
                const input = html.querySelector(`input[name="${target}"]`);
                new foundry.applications.apps.FilePicker.implementation({
                    type: type,
                    current: input.value,
                    callback: path => { input.value = path; }
                }).render(true);
            });
        });

        // --- RANGE SLIDER LOGIC ---
        const volInput = html.querySelector('input[name="soundVolume"]');
        const volDisplay = html.querySelector('.volume-display');
        if (volInput && volDisplay) {
            volInput.addEventListener('input', (e) => {
                volDisplay.textContent = e.target.value;
            });
        }

        // --- CHAT IMAGE MODE TOGGLE ---
        const chatImageSelect = html.querySelector('select[name="chatImageMode"]');
        const customImagesDiv = html.querySelector('.custom-images-group');

        if (chatImageSelect) {
            const updateImageVisibility = () => {
                customImagesDiv.style.display = chatImageSelect.value === 'custom' ? 'block' : 'none';
            };
            chatImageSelect.addEventListener('change', updateImageVisibility);
            updateImageVisibility();
        }

        // --- SOUND MODE TOGGLE ---
        const soundModeSelect = html.querySelector('select[name="soundMode"]');
        const soundSingleDiv = html.querySelector('.sound-single-group');
        const soundFacesDiv = html.querySelector('.sound-faces-group');
        
        if (soundModeSelect) {
            const updateSoundVisibility = () => {
                const val = soundModeSelect.value;
                soundSingleDiv.style.display = val === 'single' ? 'block' : 'none';
                soundFacesDiv.style.display = val === 'perface' ? 'block' : 'none';
            };
            soundModeSelect.addEventListener('change', updateSoundVisibility);
            updateSoundVisibility();
        }

        // --- SUBMIT LOGIC ---
        html.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            await game.settings.set(moduleName, 'chatImage', formData.get('chatImageMode'));
            await game.settings.set(moduleName, 'soundMode', formData.get('soundMode'));
            await game.settings.set(moduleName, 'soundVolume', parseFloat(formData.get('soundVolume')));
            await game.settings.set(moduleName, 'soundSingle', formData.get('soundSingle'));

            for (const [face, key] of Object.entries(RESULT_KEYS)) {
                await game.settings.set(moduleName, `customImage_${key}`, formData.get(`customImage_${key}`));
                await game.settings.set(moduleName, `sound_${key}`, formData.get(`sound_${key}`));
            }

            this.close();
            ui.notifications.info("Omniscient Die: Settings saved.");
        });
    }
}