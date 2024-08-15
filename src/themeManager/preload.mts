import {ipcRenderer, contextBridge} from "electron";
import {ThemeManifest} from "../types/themeManifest.d.js";
contextBridge.exposeInMainWorld("themes", {
    install: async (url: string) => ipcRenderer.invoke("installBDTheme", url) as Promise<null>,
    uninstall: (id: string) => ipcRenderer.send("uninstallTheme", id),
    edit: (id: string) => ipcRenderer.send("editTheme", id)
});
ipcRenderer.on("themeManifest", (_event, id: string, json: string) => {
    const manifest = JSON.parse(json) as ThemeManifest;
    console.log(manifest);
    const e = document.getElementById("cardBox");
    e?.insertAdjacentHTML(
        "beforeend",
        `
        <div class="card">
            <div class="flex-box">
                <h3 id="${`${id}header`}">${manifest.name}</h3>
                <input id="${id}" class="tgl tgl-light left" type="checkbox" />
                <label class="tgl-btn left" for="${id}"></label>
            </div>
            <p>${manifest.description}</p>
        </div>
        `
    );
    (document.getElementById(id) as HTMLInputElement).checked = manifest.enabled;
    document.getElementById(`${id}header`)!.addEventListener("click", () => {
        document.getElementById("themeInfoModal")!.style.display = "block";
        document.getElementById("themeInfoName")!.textContent = `${manifest.name} by ${manifest.author}`;
        document.getElementById("themeInfoDesc")!.textContent = `${manifest.description}\n\n${manifest.version}`;
        if (manifest.supportsArmCordTitlebar !== undefined) {
            document.getElementById("themeInfoButtons")!.innerHTML +=
                `<img class="themeInfoIcon" id="removeTheme" onclick="themes.uninstall('${id}')" title="Remove the theme" src="https://raw.githubusercontent.com/ArmCord/BrandingStuff/main/Trash.png"></img>
                           <img class="themeInfoIcon" id="updateTheme" onclick="themes.install('${manifest.updateSrc}')" title="Update your theme" src="https://raw.githubusercontent.com/ArmCord/BrandingStuff/main/UpgradeArrow.png"></img>
                           <img class="themeInfoIcon" id="editTheme" onclick="themes.edit('${id}')" title="Edit your theme" src="https://raw.githubusercontent.com/ArmCord/BrandingStuff/main/Edit.png"></img>
                           <img class="themeInfoIcon" id="compatibility" title="Supports ArmCord Titlebar" src=""></img>`;
            console.log("e");
            if (manifest.supportsArmCordTitlebar == true) {
                (document.getElementById(`compatibility`) as HTMLImageElement).src =
                    "https://raw.githubusercontent.com/ArmCord/BrandingStuff/main/Window.png";
            } else {
                (document.getElementById(`compatibility`) as HTMLImageElement).src =
                    "https://raw.githubusercontent.com/ArmCord/BrandingStuff/main/WindowUnsupported.png";
            }
        }
        if (manifest.source != undefined)
            document.getElementById("themeInfoButtons")!.innerHTML +=
                `<a href="${manifest.source}" class="button">Source code</a>`;
        if (manifest.website != undefined)
            document.getElementById("themeInfoButtons")!.innerHTML +=
                `<a href="${manifest.website}" class="button">Website</a>`;
        if (manifest.invite != undefined)
            document.getElementById("themeInfoButtons")!.innerHTML +=
                `<a href="${`https://discord.gg/${manifest.invite}`}" class="button">Support Discord</a>`;
    });
    (document.getElementById(id) as HTMLInputElement).addEventListener("input", function () {
        ipcRenderer.send("setThemeEnabled", id, this.checked);
    });
});
document.addEventListener("DOMContentLoaded", () => {
    document.getElementsByClassName("close")[0].addEventListener("click", () => {
        document.getElementById("themeInfoModal")!.style.display = "none";
        document.getElementById("themeInfoButtons")!.innerHTML = "";
    });
    document.getElementById("download")!.addEventListener("click", () => {
        void ipcRenderer.invoke("installBDTheme", (document.getElementById("themeLink") as HTMLInputElement).value);
    });
    // drag and drop
    const holder = document.getElementById("dropArea");

    holder!.ondragover = () => {
        return false;
    };

    holder!.ondragleave = () => {
        return false;
    };

    holder!.ondragend = () => {
        return false;
    };

    holder!.ondrop = async (e) => {
        e.preventDefault();

        for (const f of e.dataTransfer!.files) {
            console.log("File you dragged here: ", f.path);
            await ipcRenderer.invoke("installBDTheme", f.path);
        }

        return false;
    };
});
