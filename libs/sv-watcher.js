/**
 * Created by Chamberlain on 10/27/2017.
 */

const chokidar = require('chokidar');
const anymatch = require('anymatch');
const hasPublic = p => p.has('/public');
const watchHandlers = [];
const config = {
	ignored: [/node_modules/, /package\.json/, /\.(git|idea|private|gitignore|lock)/] // /(^|[\/\\])\../,
};

const SELF = module.exports = {
	init($$$) {
		const opts = $$$.opts.watcher || {};
		if(!opts.dir) opts.dir = $$$.paths.dir || '.';

		SELF.watcher = chokidar.watch(opts.dir, config);
		SELF.watcher.on('all', (event, path) => {
			path = path.fixSlash();

			watchHandlers.forEach(w => {
				const isEventOK = w.event==='*' || w.event===event;
				if(!isEventOK || !w.matcher(path)) return;
				w.cb(path, event);
			});
		});

		const timeStart = new Date().getTime();

		SELF.add(/\./, '*', (path, event) => {
			const timeNow = new Date().getTime();
			const timeDiff = timeNow - timeStart;

			if(event==='addDir' || path.has('_tmp_') || (event==='add' && timeDiff < 5000)) return;

			if(event==='change' && hasPublic(path)) {
				if(path.endsWith('.js')) {
					$$$.mods.svWebpack.run();
				} else {
					$$$.io.emit('file-changed', path);
				}
			} else {
				trace(path);
				process.kill(process.pid);
			}
		});
	},

	add(pattern, event, cb) {
		if (arguments.length === 2) {
			cb = event;
			event = 'change'
		}

		watchHandlers.push({matcher: anymatch(pattern), event: event, cb: cb})
	}
};
