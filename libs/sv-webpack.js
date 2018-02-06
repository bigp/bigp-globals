/**
 * Created by Chamberlain on 2/6/2018.
 */
const fs = require('fs-extra');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

const SELF = module.exports = {
	init($$$) {
		const cfg = SELF.config = webpackConfig($$$);
		const output = cfg.output;
		const compiler = webpack(SELF.config);

		$$$.webpack = compiler;

		SELF.$$$ = $$$;
		SELF.compiler = compiler;
		SELF.outputFilename = output.path.mustEndWith('/').fixSlash() + output.filename;

		compiler.inputFileSystem = fs;
		compiler.outputFileSystem = $$$.memFS;
		//compiler.resolvers.normal.fileSystem = $$$.memFS;

		this.run();
	},

	run(cbWarnings) {
		return new Promise((_then, _catch) => {
			SELF.compiler.run(function(err, stats) {
				if(err) return _catch(err);

				const ret = stats.toJson();

				if(ret.errors.length > 0) return _catch(ret.errors);
				if(ret.warnings.length > 0) cbWarnings && cbWarnings(ret.warnings);

				const asset = ret.assets[0];
				const size = (asset.size/1024).toFixed(2);
				trace([" WEBPACK OK ".bgGreen.white, ` ${size}kb `.bgMagenta.white, asset.name].join(' '));

				SELF.$$$.io.emit('file-changed', SELF.outputFilename);

				_then(stats);
			});
		});
	}
};


