let baseUrl = 'https://raw.githubusercontent.com/TheDroidYourLookingFor/BitBurner-Scripts/main/';
let json_filename = 'install_files_json.txt';
const usrDirectory = "/TheDroid/";

/** @param {NS} ns */
export async function main(ns) {
	let { welcomeLabel, filesToDownload } = await fetchConfig(ns)

	ns.tprintf("%s", welcomeLabel)

	let hostname = ns.getHostname()

	if (hostname !== 'home') {
		throw 'Run the script from home'
	}

	await clean(ns, filesToDownload);

	let count = 0;
	for (let filename of filesToDownload) {
		const path = baseUrl + filename
		const save_filename = (!filename.startsWith('/') && filename.includes('/')) ? usrDirectory + filename : usrDirectory + filename;

		try {
			ns.scriptKill(save_filename, 'home')
			ns.rm(save_filename)
			await ns.sleep(20)
			await ns.wget(path + '?ts=' + new Date().getTime(), save_filename)

			if (++count % 5 == 0) {
				ns.tprintf(`Installing... [${(count + '').padStart(2)}/${filesToDownload.length}]`);
			}
		} catch (e) {
			ns.tprint(`ERROR (tried to download  ${path})`)
			throw e;
		}
	}

	terminalCommand('alias -g Droid="run /TheDroid/Manager-Startup.js"')

	ns.tprintf("Install complete! To start, type: Droid")
}

async function clean(ns, filesToDownload) {
	let filesRaw = filesToDownload.map(file => file.substr(file.lastIndexOf('/') + 1))
	let allFiles = ns.ls("home");
	let toDelete = [];
	allFiles.forEach(_file => {
		let file = (_file.startsWith('/')) ? _file.substr(1) : _file;

		if (file.startsWith('TheDroid/')) {
			let file_raw = file.substr(file.lastIndexOf('/') + 1);
			if (filesRaw.includes(file_raw)) {
				if (!filesToDownload.includes(file)) {
					toDelete.push(_file);
				}
			} else {
				console.log("Install-clean: unidentified file", file);
			}
		}
	})

	if (toDelete.length) {
		if (await ns.prompt("Files have moved. Installer will clean old files. Confirm? [recommended] " + toDelete.join(", "))) {
			toDelete.forEach(file => ns.rm(file));
		}
	}
}

async function fetchConfig(ns) {
	try {
		let local_filename = '/TheDroid/' + json_filename;
		await ns.rm(local_filename)
		await ns.wget(baseUrl + json_filename + '?ts=' + new Date().getTime(), local_filename)
		return JSON.parse(ns.read(local_filename));
	} catch (e) {
		ns.tprint(`ERROR: Downloading and reading config file failed ${json_filename}`);
		throw e;
	}
}

function terminalCommand(message) {
	const docs = globalThis['document']
	const terminalInput = /** @type {HTMLInputElement} */ (docs.getElementById("terminal-input"));
	terminalInput.value = message;
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({ target: terminalInput });
	terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
}
