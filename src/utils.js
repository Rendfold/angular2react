var utils = {
    getProp: function (obj, prop) {
        var parts = prop.split('.');
        var _ref = obj;
        for (var i = 0, part; part = parts[i]; i++) {
            if (i === parts.length - 1) {
                return _ref[part];
            } else {
                _ref = _ref[part] || {};
            }
        }
    },
    findOne: function (ar, query, fn) {
        for (var i = 0, a; a = ar[i]; i++) {
            var m = this.matchesQuery(a, query);
            if (m) {
                if (fn) fn(a, i);
                return a;
            }
        }

        if (fn) fn(null);
        return null;
    },
    setProp: function (obj, prop, value) {
        var parts = prop.split('.');
        var _ref = obj;
        for (var i = 0, part; part = parts[i]; i++) {
            if (i === parts.length - 1) {
                _ref[part] = value;
            } else {
                if (_ref[part]) {
                    _ref = _ref[part];
                }
                else {
                    _ref = (_ref[part] = {});
                }
            }
        }
    },
    isNull: function (x) {
        return x === null;
    },
    isUndefined: function (x) {
        return x === undefined;
    },
    isNullOrUndefined: function (x) {
        return this.isNull(x) || this.isUndefined(x);
    },
    focusWithoutScroll:function(element,selectorForFixScroll){
        selectorForFixScroll=selectorForFixScroll?selectorForFixScroll:".grid-block.scroll.vertical.hard";
        var node=element.closest(selectorForFixScroll);
        var scrollTop=node.scrollTop();
        //console.log(scrollTop);
        element.focus();
        node.scrollTop(scrollTop);
    },
    clearArray:function(arr,fields){
        arr.forEach(function(v){

            for (var prop in v) {
                if(v[prop] instanceof Array){
                    utils.clearArray(v[prop],fields);
                } else {
                    //debugger;
                    if (typeof v[prop] == "object"){

                        utils.clearArray([v[prop]],fields);
                    } else {
                        if (fields.indexOf(prop)!=-1){
                            delete v[prop];
                        }
                    }
                }
            }
        });
        return arr;
    },
    getSubStringPositions:function(str,subStr){
        var str = angular.copy(str);
        var position;
        var res=[];
        while((position = str.indexOf(subStr))!=-1){
            if (res.length){
                res.push(res[res.length-1] + 1 + position);
            } else {
                res.push(position);
            }
            str = str.substring(position + subStr.length,str.length);
        }
        return res;
    },
    generateGUID: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }, 
    round: function (num, step) {
        step=step?step:0;
        //return +this.toNumber(num).toFixed(step); Old codes
        var numb=Math.pow(10,step);
        return Math.round(this.toNumber(num)*numb)/numb;

    },
    dateToString:function (d) {
        var text = d.toJSON();
        text = text.split('T');
        var timeText = text[1].substring(0,5);
        text =text[0].split("-");
        var res=text[2]+"/"+text[1]+"/"+text[0]+" "+timeText;
        return res;
    },
    extend: function (a /*, bs.., exclInsts*/ ) {
        var args = arguments,
            exclInsts = [Array],
            bs;

        if (args[args.length - 1] instanceof Array) {
            bs = Array.prototype.slice.call(args, 1, args.length - 1);
            args[args.length - 1].forEach(function(exclInst) {
                if (exclInsts.indexOf(exclInst) === -1) {
                    exclInsts.push(exclInst);
                }
            });
        } else {
            bs = Array.prototype.slice.call(args, 1, args.length);
        }

        for (var i = 0, b; b = bs[i]; i++) {
            for (var prop in b) {
                if (b.hasOwnProperty(prop)) {
                    var isExclInst = false;
                    if (exclInsts) {
                        for (var j = 0; j < exclInsts.length; j++) {
                            if (b[prop] instanceof exclInsts[j]) {
                                isExclInst = true;
                            }
                        }
                    }

                    if (a[prop] instanceof Array && b[prop] instanceof Array) {
                        a[prop].splice.apply(a[prop], [0, a[prop].length].concat(b[prop]));
                    } else if (typeof b[prop] === 'object' && b[prop] !== null && !isExclInst) {
                        a[prop] = a[prop] !== undefined ? a[prop] : {};
                        this.extend(a[prop], b[prop], exclInsts);
                    } else {
                        a[prop] = b[prop];
                    }
                }
            }
        }
        return a;
    }
};

export default utils;