export function customExtends(obj) {
	var length = arguments.length;
	if (length < 2 || obj == null) return obj;
	for (var index = length-1; index > 0; index--) {
		var source = arguments[index];
		var proto = Object.getPrototypeOf(source);
		var keys = Object.getOwnPropertyNames(proto);
		for (var key in keys) {
		  var methodName = keys[key];
		  if (obj[methodName] === void 0) obj[methodName] = proto[methodName];
		}
	}
	return obj;
}