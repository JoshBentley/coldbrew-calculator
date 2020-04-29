
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    var calculators = {
        calculate
    };

    function calculate(first, second) {
        if (first == "Gallons" && second == "Pounds") {
            return gallonsToPounds;
        }
        else if (first == "Pounds" && second == "Gallons") {
            return poundsToGallons;
        }
        else if (first == "Gallons" && second == "DryOunces") {
            return gallonsToDryOunces;
        }
        else if (first == "DryOunces" && second == "Gallons") {
            return ouncesToGallons;
        }
        else if (first == "Gallons" && second == "CofGrams") {
            return gallonsToGrams;
        }
        else if (first == "CofGrams" && second == "Gallons") {
            return gramsToGallons;
        }
        else if (first == "Liters" && second == "Pounds") {
            return litersToPounds;
        }
        else if (first == "Pounds" && second == "Liters") {
            return poundsToLiters;
        }
        else if (first == "Liters" && second == "DryOunces") {
            return litersToDryOunces;
        }
        else if (first == "DryOunces" && second == "Liters") {
            return ouncesToLiters;
        }
        else if (first == "Liters" && second == "CofGrams") {
            return litersToGrams;
        }
        else if (first == "CofGrams" && second == "Liters") {
            return gramsToLiters;
        }
        else if (first == "FluidOunces" && second == "Pounds") {
            return fluidOuncesToPounds;
        }
        else if (first == "Pounds" && second == "FluidOunces") {
            return poundsToFluidOunces;
        }
        else if (first == "FluidOunces" && second == "DryOunces") {
            return fluidOuncesToDryOunces;
        }
        else if (first == "DryOunces" && second == "FluidOunces") {
            return dryOuncesToFluidOunces;
        }
        else if (first == "FluidOunces" && second == "CofGrams") {
            return fluidOuncesToGrams;
        }
        else if (first == "CofGrams" && second == "FluidOunces") {
            return gramsToFluidOunces;
        }
        else if (first == "Cups" && second == "Pounds") {
            return cupsToPounds;
        }
        else if (first == "Pounds" && second == "Cups") {
            return poundsToCups;
        }
        else if (first == "Cups" && second == "DryOunces") {
            return cupsToDryOunces;
        }
        else if (first == "DryOunces" && second == "Cups") {
            return dryOuncesToCups;
        }
        else if (first == "Cups" && second == "CofGrams") {
            return cupsToGrams;
        }
        else if (first == "CofGrams" && second == "Cups") {
            return gramsToCups;
        }
        else if (first == "Millileters" && second == "Pounds") {
            return milliletersToPounds;
        }
        else if (first == "Pounds" && second == "Millileters") {
            return poundsToMillileters;
        }
        else if (first == "Millileters" && second == "DryOunces") {
            return milliletersToDryOunces;
        }
        else if (first == "DryOunces" && second == "Millileters") {
            return dryOuncesToMillileters;
        }
        else if (first == "Millileters" && second == "CofGrams") {
            return milliletersToGrams;
        }
        else if (first == "CofGrams" && second == "Millileters") {
            return gramsToMillileters;
        }
        else if (first == "WatGrams" && second == "Pounds") {
            return gramsToPounds;
        }
        else if (first == "WatGrams" && second == "DryOunces") {
            return gramsToDryOunces;
        }
        else if (first == "DryOunces" && second == "WatGrams") {
            return dryOuncesToGrams;
        }
        else if(first == "WatGrams" && second == "CofGrams") {
            return watGramsToCofGrams
        }
        else if(first == "CofGrams" && second == "WatGrams") {
            return cofGramsToWatGrams
        }
    }

    function gallonsToPounds(gallons) {
        return gallons;
    }

    function poundsToGallons(pounds) {
        return pounds;
    }

    function gallonsToDryOunces(gallons) {
        return gallons * 16;
    }

    function ouncesToGallons(ounces) {
        return ounces / 16;
    }

    function gallonsToGrams(gallons) {
        return gallons * 453.592;
    }

    function gramsToGallons(grams) {
        return grams / 453.592;
    }

    function litersToPounds(liters) {
        return liters / 3.78541;
    }

    function poundsToLiters(pounds) {
        return pounds * 3.78541;
    }

    function litersToDryOunces(liters){
        return liters * 4.226754829727823;
    }

    function ouncesToLiters(ounces) {
        return ounces / 4.226754829727823;
    }

    function litersToGrams(liters) {
        return liters * 119.8263860453689;
    }

    function gramsToLiters(grams){
        return grams / 119.8263860453689;
    }

    function fluidOuncesToPounds(ounces){
        return ounces / 128;
    }

    function poundsToFluidOunces(pounds){
        return pounds * 128;
    }

    function fluidOuncesToDryOunces(ounces){
        return ounces * 0.125;
    }

    function dryOuncesToFluidOunces(ounces){
        return ounces / 0.125;
    }

    function fluidOuncesToGrams(ounces) {
        return ounces * 3.5436875;
    }

    function gramsToFluidOunces(grams){
        return grams / 3.5436875;
    }

    function cupsToPounds(cups){
        return cups / 16;
    }

    function poundsToCups(pounds){
        return pounds * 16;
    }

    function cupsToDryOunces(cups){
        return cups;
    }

    function dryOuncesToCups(ounces){
        return ounces;
    }

    function cupsToGrams(cups){
        return cups * 28.75840862260263;
    }

    function gramsToCups(grams){
        return grams / 28.75840862260263;
    }

    function milliletersToPounds(mill){
        return mill / 3785.41;
    }

    function poundsToMillileters(pounds){
        return pounds * 3785.41;
    }

    function milliletersToDryOunces(mill){
        return mill * 0.0042267548297278;
    }

    function dryOuncesToMillileters(ounces){
        return ounces / 0.0042267548297278;
    }

    function milliletersToGrams(mill) {
        return mill * 0.1198263860453689;
    }

    function gramsToMillileters(grams){
        return grams / 0.1198263860453689;
    }

    function gramsToPounds(grams){
        return grams * 0.00026417217;
    }

    function gramsToDryOunces(grams){
        return grams * 0.0042267548297278;
    }

    function dryOuncesToGrams(grams){
        return grams / 0.0042267548297278;
    }

    function watGramsToCofGrams(grams) {
        return grams * 0.1198263860453689;
    }

    function cofGramsToWatGrams(grams) {
        return grams / 0.1198263860453689;
    }

    /* src\components\calculator.svelte generated by Svelte v3.12.1 */

    const file = "src\\components\\calculator.svelte";

    function create_fragment(ctx) {
    	var div6, div2, div0, span0, t1, input0, input0_updating = false, t2, div1, select0, option0, option1, option2, option3, option4, option5, t9, div5, div3, span1, t11, input1, input1_updating = false, t12, div4, select1, option6, option7, option8, dispose;

    	function input0_input_handler() {
    		input0_updating = true;
    		ctx.input0_input_handler.call(input0);
    	}

    	function input1_input_handler() {
    		input1_updating = true;
    		ctx.input1_input_handler.call(input1);
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "💧";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Gallons";
    			option1 = element("option");
    			option1.textContent = "Liters";
    			option2 = element("option");
    			option2.textContent = "Fluid Ounces";
    			option3 = element("option");
    			option3.textContent = "Cups";
    			option4 = element("option");
    			option4.textContent = "Millileters";
    			option5 = element("option");
    			option5.textContent = "Grams";
    			t9 = space();
    			div5 = element("div");
    			div3 = element("div");
    			span1 = element("span");
    			span1.textContent = "☕";
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			div4 = element("div");
    			select1 = element("select");
    			option6 = element("option");
    			option6.textContent = "Pounds";
    			option7 = element("option");
    			option7.textContent = "Dry Ounces";
    			option8 = element("option");
    			option8.textContent = "Grams";
    			attr_dev(span0, "class", "input-group-text label svelte-4kh7n2");
    			add_location(span0, file, 57, 6, 1094);
    			attr_dev(div0, "class", "input-group-prepend svelte-4kh7n2");
    			add_location(div0, file, 56, 4, 1053);
    			attr_dev(input0, "class", "waterInput");
    			attr_dev(input0, "type", "number");
    			add_location(input0, file, 59, 4, 1158);
    			option0.__value = "Gallons";
    			option0.value = option0.__value;
    			add_location(option0, file, 71, 8, 1496);
    			option1.__value = "Liters";
    			option1.value = option1.__value;
    			add_location(option1, file, 72, 8, 1546);
    			option2.__value = "FluidOunces";
    			option2.value = option2.__value;
    			add_location(option2, file, 73, 8, 1594);
    			option3.__value = "Cups";
    			option3.value = option3.__value;
    			add_location(option3, file, 74, 8, 1653);
    			option4.__value = "Millileters";
    			option4.value = option4.__value;
    			add_location(option4, file, 75, 8, 1697);
    			option5.__value = "WatGrams";
    			option5.value = option5.__value;
    			add_location(option5, file, 76, 8, 1755);
    			if (ctx.selectedWater === void 0) add_render_callback(() => ctx.select0_change_handler.call(select0));
    			attr_dev(select0, "name", "water-selector");
    			attr_dev(select0, "id", "water");
    			attr_dev(select0, "class", "selector water-selector svelte-4kh7n2");
    			add_location(select0, file, 65, 6, 1316);
    			attr_dev(div1, "class", "input-group-append svelte-4kh7n2");
    			add_location(div1, file, 64, 4, 1276);
    			attr_dev(div2, "class", "input-group svelte-4kh7n2");
    			add_location(div2, file, 55, 2, 1022);
    			attr_dev(span1, "class", "input-group-text label svelte-4kh7n2");
    			add_location(span1, file, 83, 6, 1911);
    			attr_dev(div3, "class", "input-group-prepend svelte-4kh7n2");
    			add_location(div3, file, 82, 4, 1870);
    			attr_dev(input1, "class", "coffeeInput");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file, 85, 4, 1974);
    			option6.__value = "Pounds";
    			option6.value = option6.__value;
    			add_location(option6, file, 97, 8, 2318);
    			option7.__value = "DryOunces";
    			option7.value = option7.__value;
    			add_location(option7, file, 98, 8, 2366);
    			option8.__value = "CofGrams";
    			option8.value = option8.__value;
    			add_location(option8, file, 99, 8, 2421);
    			if (ctx.selectedCoffee === void 0) add_render_callback(() => ctx.select1_change_handler.call(select1));
    			attr_dev(select1, "name", "coffee-selector");
    			attr_dev(select1, "id", "coffee");
    			attr_dev(select1, "class", "selector coffee-selector svelte-4kh7n2");
    			add_location(select1, file, 91, 6, 2135);
    			attr_dev(div4, "class", "input-group-append svelte-4kh7n2");
    			add_location(div4, file, 90, 4, 2095);
    			attr_dev(div5, "class", "input-group svelte-4kh7n2");
    			add_location(div5, file, 81, 2, 1839);
    			attr_dev(div6, "class", "container rounded svelte-4kh7n2");
    			add_location(div6, file, 54, 0, 987);

    			dispose = [
    				listen_dev(input0, "input", input0_input_handler),
    				listen_dev(input0, "input", ctx.waterChange),
    				listen_dev(select0, "change", ctx.select0_change_handler),
    				listen_dev(select0, "change", ctx.coffeeChange),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input1, "input", ctx.coffeeChange),
    				listen_dev(select1, "change", ctx.select1_change_handler),
    				listen_dev(select1, "change", ctx.waterChange)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(div2, t1);
    			append_dev(div2, input0);

    			set_input_value(input0, ctx.water);

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			append_dev(select0, option4);
    			append_dev(select0, option5);

    			select_option(select0, ctx.selectedWater);

    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, span1);
    			append_dev(div5, t11);
    			append_dev(div5, input1);

    			set_input_value(input1, ctx.coffee);

    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div4, select1);
    			append_dev(select1, option6);
    			append_dev(select1, option7);
    			append_dev(select1, option8);

    			select_option(select1, ctx.selectedCoffee);
    		},

    		p: function update(changed, ctx) {
    			if (!input0_updating && changed.water) set_input_value(input0, ctx.water);
    			input0_updating = false;
    			if (changed.selectedWater) select_option(select0, ctx.selectedWater);
    			if (!input1_updating && changed.coffee) set_input_value(input1, ctx.coffee);
    			input1_updating = false;
    			if (changed.selectedCoffee) select_option(select1, ctx.selectedCoffee);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div6);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let coffee = "";
      let water = "";
      let newWater;
      let newCoffee;
      let selectedWater;
      let selectedCoffee;

      function waterChange() {
        $$invalidate('coffee', coffee = calculators
          .calculate(selectedWater, selectedCoffee)(water)
          .toFixed(2));
      }

      function coffeeChange() {
        $$invalidate('water', water = calculators
          .calculate(selectedCoffee, selectedWater)(coffee)
          .toFixed(2));
      }

    	function input0_input_handler() {
    		water = to_number(this.value);
    		$$invalidate('water', water);
    	}

    	function select0_change_handler() {
    		selectedWater = select_value(this);
    		$$invalidate('selectedWater', selectedWater);
    	}

    	function input1_input_handler() {
    		coffee = to_number(this.value);
    		$$invalidate('coffee', coffee);
    	}

    	function select1_change_handler() {
    		selectedCoffee = select_value(this);
    		$$invalidate('selectedCoffee', selectedCoffee);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('coffee' in $$props) $$invalidate('coffee', coffee = $$props.coffee);
    		if ('water' in $$props) $$invalidate('water', water = $$props.water);
    		if ('newWater' in $$props) newWater = $$props.newWater;
    		if ('newCoffee' in $$props) newCoffee = $$props.newCoffee;
    		if ('selectedWater' in $$props) $$invalidate('selectedWater', selectedWater = $$props.selectedWater);
    		if ('selectedCoffee' in $$props) $$invalidate('selectedCoffee', selectedCoffee = $$props.selectedCoffee);
    	};

    	return {
    		coffee,
    		water,
    		selectedWater,
    		selectedCoffee,
    		waterChange,
    		coffeeChange,
    		input0_input_handler,
    		select0_change_handler,
    		input1_input_handler,
    		select1_change_handler
    	};
    }

    class Calculator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Calculator", options, id: create_fragment.name });
    	}
    }

    /* src\App.svelte generated by Svelte v3.12.1 */

    const file$1 = "src\\App.svelte";

    function create_fragment$1(ctx) {
    	var div, current;

    	var calculator = new Calculator({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			calculator.$$.fragment.c();
    			add_location(div, file$1, 4, 0, 83);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(calculator, div, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(calculator.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(calculator.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(calculator);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$1.name });
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
