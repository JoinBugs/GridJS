/*		---- Module util ------
	*	defined all methods coumnes, for examnples, convert objectes likes
	*	array to right array, get right type of a type defined as primitive
	*	in javasscript.
	* methods :
*/
(function () {
    var util = {};
    window.util = util;

    //append method remove for dom.
    (function () {
        var typesToPatch = ['DocumentType', 'Element', 'CharacterData'],
            remove = function () {
                // The check here seems pointless, since we're not adding this
                // method to the prototypes of any any elements that CAN be the
                // root of the DOM. However, it's required by spec (see point 1 of
                // https://dom.spec.whatwg.org/#dom-childnode-remove) and would
                // theoretically make a difference if somebody .apply()ed this
                // method to the DOM's root node, so let's roll with it.
                if (this.parentNode != null) {
                    this.parentNode.removeChild(this);
                }
            };

        for (var i = 0; i < typesToPatch.length; i++) {
            var type = typesToPatch[i];
            if (window[type] && !window[type].prototype.remove) {
                window[type].prototype.remove = remove;
            }
        }
    })();

    //shiem addEventListener
    (function (w, d) {
        var
            nc = "", nu = "", nr = "", t,
            a = "addEventListener",
            n = a in w,
            c = (nc = "Event") + (n ? (nc += "", "Listener") : (nc += "Listener", "")),
            u = n ? (nu = "attach", "add") : (nu = "add", "attach"),
            r = n ? (nr = "detach", "remove") : (nr = "remove", "detach")
        /*
         * the evtf function, when invoked, return "attach" or "detach" "Event" functions if we are on a new browser, otherwise add "add" or "remove" "EventListener"
         */
        function evtf(whoe) { return function (evnt, func, capt) { return this[whoe]((n ? ((t = evnt.split("on"))[1] || t[0]) : ("on" + evnt)), func, (!n && capt ? (whoe.indexOf("detach") < 0 ? this.setCapture() : this.removeCapture()) : capt)) } }
        w[nu + nc] = Element.prototype[nu + nc] = document[nu + nc] = evtf(u + c) // (add | attach)Event[Listener]
        w[nr + nc] = Element.prototype[nr + nc] = document[nr + nc] = evtf(r + c) // (remove | detach)Event[Listener]

    })(window, document);

    (function () {
        this.getValidProp = function (prop) {
            prop = util.toCapitalize(prop);

            var prefCurrent = 'webkit o moz ms'
										.split(' ')
											.filter(function (pref) {
											    return window.hasOwnProperty(pref + prop);
											});
            window[prop] = window[prefCurrent + prop];
        };

        this.appendToObj = function () {
            var newObj = {},
				append = function (obj, objAppend) {
				    for (var key in objAppend)
				        obj[key] = objAppend[key];
				    return obj;
				};
            for (var i = arguments.length; i;)
                append(newObj, arguments[--i]);
            return newObj;
        };

        this.toCapitalize = function (str) {
            if (util.toType(str) === 'string')
                return str[0].toUpperCase() + str.substring(1, str.length);
        };

        this.toArray = function (obj) {
            return Array.prototype.slice.call(obj);
        };

        this.toType = function (obj) {
            var typeRAW = Object.prototype.toString.call(obj),
				type = typeRAW.replace(/^.+\s/, '');

            return type.substring(0, type.length - 1).toLowerCase();
        };

        this.isSameObjects = function (obj1, obj2) {
            var type1 = util.toType(obj1),
				type2 = util.toType(obj2),
				equal = false;

            if (type1 === type2)
                if (type1 === 'object' || type1 === 'array') {
                    for (var key in obj1)
                        if (obj1[key] !== obj2[key])
                            return false;
                    equal = true;
                }
            return equal;
        };

        this.keysObject = function (obj) {
            var keys = [];
            for (var key in obj)
                keys.push(key);
            return keys;
        };

        this.emptyNode = function (node) {
            _.forEach( util.toArray(node.childNodes), function (childNode) {
                node.removeChild(childNode);
            });
        };

        /* Defined everythings functions posibles isType,
		 where type is any type native of javascript */
        (function () {
            var self = this,
			    types = _.forEach( [{}, [], new RegExp(), function () { }, 1, true, '', undefined, null],
							function (typeObj) {
							    var type = util.toType(typeObj),
								    nameMethod = 'is' + util.toCapitalize(type);
							    self[nameMethod] = function (obj) {
							        return util.toType(obj) === type;
							    };
							});
        })
		.apply(this);
    })
	.apply(util);
})
  .apply(this);