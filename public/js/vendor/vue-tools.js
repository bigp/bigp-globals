/**
 * Created by Chamberlain on 2/6/2018.
 */
var isRoutesUsed = false;

export default {
	init(components, routesObj) {
		_.keys(components).forEach(compName => {
			const comp = components[compName];
			comp.template = `<div class="${compName}">${comp.template}</div>`;
			Vue.component(compName, comp);
		});

		const router = this.createRoutes(routesObj);

		$$$.vue = new Vue({el: '#app', router: router, template: '<app />'});
	},

	createRoutes(routesObj, opts) {
		if(!isRoutesUsed) {
			isRoutesUsed = true;
			Vue.use(VueRouter);
		}

		const routes = [];
		_.keys(routesObj).forEach(path => {
			routes.push(_.extend({path: path}, routesObj[path]));
		});

		return new VueRouter(_.extend({routes: routes}, opts));
	}
}
