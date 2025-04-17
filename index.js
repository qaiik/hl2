(function() {
    const hacklibdata = {
        cachedMethods: {}
    }

    function isNative(fn) {
        return (/\{\s*\[native code\]\s*\}/).test(String(fn));
    }

    function getAllChildren(element) {
        let descendants = [];

        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];
            descendants.push(child);
            descendants = descendants.concat(getAllChildren(child));
        }

        return descendants;
    }

    function manualSelectById(e, id) {
        return getAllChildren(e).filter(e => e.id == id)[0]
    }

    function manualSelectAllById(e, id) {
        return getAllChildren(e).filter(e => e.id == id)[0]
    }

    function forceMakeIframe() {
        if (isNative(document.createElement)) {
            const i = document.createElement('iframe')
            i.style.visibility = "hidden"
            i.style.width = "0px"
            i.style.height = "0px"
            i.style.overflow = "hidden"
            document.head.appendChild(i)
            return i
        } else {
            customSelector = `hacklib-temporary-iframe-${crypto.randomUUID()}`
            document.head.innerHTML = `<iframe id="${customSelector}" style="width:0px;height:0px;visibility:hidden;overflow:hidden;"></iframe>` + document.head.innerHTML
            return isNative(document.querySelector) ? document.querySelector("#" + customSelector) : isNative(document.getElementById) ? document.getElementById(customSelector) : manualSelectById(document.head, customSelector)
        }
    }

    function _ifw() {
        const i = forceMakeIframe()
        const cw = i.contentWindow
        cw.removeParent = () => {
            i.remove()
        }
        return cw
    }

    function getMethodKeep(name) {
        const i = _ifw();
        const m = i[name]
        return m
    }

    function useSafe(fn) {
        const w = _ifw();
        fn(w)
        w.removeParent()
    }

    function callSafe(name, args) {
        const w = _ifw();
        w[name](...args)
        w.removeParent()
    }

    function safeAlert(...m) {
        if (isNative(alert)) return alert(...m);
        else if (hacklibdata.cachedMethods.alert) return hacklibdata.cachedMethods.alert(...m);
        else {
            hacklibdata.cachedMethods.alert = getMethodKeep('alert')
            return hacklibdata.cachedMethods.alert(...m)
        }
    }

    function copyOriginal(method) {
        return method
    }

    function detectUniqueVariables(){
        const w = _ifw();
        const pn = Object.getOwnPropertyNames(w)
        w.removeParent();
        return Object.getOwnPropertyNames(window).filter(name => !pn.includes(name))
    }
    


    window.hl = {
        isNative,
        alert: safeAlert,
        getHLData: () => hacklibdata,
        useSafe,
        callSafe,
        safeAlert,
        copyOriginal,
        detectUniqueVariables
    }
})();
