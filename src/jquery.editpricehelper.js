(function ($) {
    'use strict';

    // Plugin identifier and default values
    var
        pluginName = 'editpricehelper',
        pluginIdentifier = 0,
        defaults = {
            priceType:           'notax', // Type of price of the main input: `tax` or `notax`.
            otherPriceInput:     null,    // Selector of an existing input containing the complementary price. Otherwise, it will be created.
            taxRateInput:        null,    // Selector of an existing input containing the tax rate. Otherwise, a default taxe rate is needed.
            taxRate:             null,    // Default tax rate to apply in case there's no input or no value is entered.
            taxRateInPercent:    false,   // Indicate weither the tax rate is in percent or not, eg. `20` instead of `0.2` for instance.
            precision:           2,       // Precision of the displayed numbers.
            urlCalculate:        null,    // URL to a script calculating the prices. Otherwise, they will be calculated in-house.
            displayTaxAmount:    true,    // Display the tax amount or not.
            // Text of labels
            mainLabel:           'Price',
            priceTaxLabel:       'All taxes included',
            priceNoTaxLabel:     'Pre-tax',
            taxAmountLabel:      'Tax',
            defaultLabel:        'default',
            // CSS classes
            priceTaxClass:       'price price_tax',
            priceNoTaxClass:     'price price_notax',
            taxAmountClass:      'price price_tax-amount',
            taxRateClass:        'price price_tax-rate',
            taxRateDisplayClass: 'price__tax-rate',
            labelClass:          'price__label',
            inputClass:          'price__input'
        };

    /**
     * Plugin
     * @param {String} element
     * @param {Object} options
     */
    function Plugin(element, options) {

        // Basics
        this.$element            = $(element);
        this.options             = $.extend({}, defaults, options, this.$element.data());
        this.identifier          = pluginName + '-' + (pluginIdentifier++);

        // Usefull stuff
        this.priceType           = this.options.priceType;
        this.otherPriceType      = this.getOtherPriceType(this.priceType);
        this.hasSinglePriceInput = ($(this.options.otherPriceInput).length === 0);
        this.hasTaxRateInput     = ($(this.options.taxRateInput).length > 0);

        // Will be added after init
        this.$inputs             = null; // 3 main inputs
        this.$taxRateDisplay     = null; // Tax rate display helper

        // Call the initialization
        this.init();
    }

    /**
     * Initialization
     * @return {Void}
     */
    Plugin.prototype.init = function () {
        var error = this.check();
        if (!error) {
            this.setup();
            this.addInteractions();

            // Event : onInit
            if (this.onInit && typeof this.onInit === 'function') {
                this.onInit();
            }
        } else {
            console.log('Edit Price Helper error: ' + error);
        }
    };

    /**
     * Check that we have everything we need
     * @return {Void}
     */
     Plugin.prototype.check = function () {
        var
            error = '',
            elementTag = this.$element.prop('tagName'),
            inputType = this.$element.attr('type');

        // Check that main input is text or number
        if (elementTag !== 'INPUT' || (inputType !== 'text' && inputType !== 'number')) {
            error = 'Main input type need to be `text` or `number`';
        }
        // Check that we have a taxe rate
        else if (!this.hasTaxRateInput && !this.options.taxRate) {
            error = 'No taxe rate provided, use `taxRateInput` or `taxRate`.';
        }

        return error;
    };

    /**
     * Set everything up : add elements to the DOM and such
     * @return {Void}
     */
     Plugin.prototype.setup = function () {

        var
            $this          = this,
            options        = this.options,
            $inputs        = {},
            id             = this.$element.attr('id'),
            $label         = $('label[for="' + id + '"]'),
            priceType      = this.priceType,
            otherPriceType = this.otherPriceType,
            labels,
            classes;

        // Labels & classes
        labels = {
            main:             options.mainLabel,
            notax:            options.priceNoTaxLabel,
            tax:              options.priceTaxLabel,
            taxAmount:        options.taxAmountLabel,
            defaultTaxAmount: options.defaultTaxAmountLabel,
        };
        classes = {
            notax:          options.priceNoTaxClass,
            tax:            options.priceTaxClass,
            taxAmount:      options.taxAmountClass,
            taxRate:        options.taxRateClass,
            taxRateDisplay: options.taxRateDisplayClass,
            input:          options.inputClass,
            label:          options.labelClass,
        };

        // Store main inputs globally :
        // main price, complementary price, tax rate & tax amount
        this.$inputs = $inputs;

        // Main price input
        $inputs[priceType] = this.$element.data('priceType', priceType);

        // Taxe rate input if present
        if (this.hasTaxRateInput) {
            $inputs.taxRate = $(options.taxRateInput);
        }

        // If there is a single price input,
        // add the complementary price input and the tax amount input,
        // then wrap them and add labels to distinguish them.
        if (this.hasSinglePriceInput) {

            // Add complementary price input
            $inputs[otherPriceType] = $inputs[priceType]
                .clone(false, false)
                .attr('value', '')
                .removeData()
                .removeAttr('name required') // this value is not meant to be posted
                .attr('id', id + '_helper')
                .data('priceType', otherPriceType)
                .insertAfter($inputs[priceType]);

            // Add tax amount input
            if (options.displayTaxAmount) {
                $inputs.taxAmount = $inputs[otherPriceType]
                    .clone(false, false)
                    .removeData()
                    .removeAttr('min max step')
                    .attr('type', 'text')
                    .attr({disabled:'',readonly:''})
                    .attr('id', id + '_tax_amount')
                    .insertAfter($inputs[otherPriceType]);
            }

            // Wrap inputs and add labels to distinguish them
            this.$taxRateDisplay = $('<span>')
                .addClass(classes.taxRateDisplay)
                .html(this.displayTaxRate());
            $.each($inputs, function (input) {
                var
                    id = $(this).attr('id'),
                    $label;

                // wrap in a span
                $(this)
                    .addClass(classes.input)
                    .wrap($('<span>')
                    .addClass(classes[input]));
                // Add a label
                if (labels[input]) {
                    $label = $('<label>')
                        .attr('for', id)
                        .addClass(classes.label)
                        .html(labels[input]);
                    if (input === 'taxAmount') {
                        $label.append($this.$taxRateDisplay);
                    }
                    $(this).before($label);
                }
            });

            // Change text of main label
            if (labels.main) {
                $label
                    .contents()
                    .filter(function () {
                        return this.nodeType === 3;
                    })
                    .first()
                    .replaceWith(labels.main);
            }

        // If there is a second input, just store it and set its price type.
        } else {
            $inputs[otherPriceType] = $(options.otherPriceInput).data('priceType', otherPriceType);
        }

        // Store values of inputs in order to make calculations without rounding
        $.each($inputs, function () {
            var value = Number.parseFloat($(this).val());
            if (Number.isNumeric(value)) {
                $(this).data('value', value);
            }
        });

        // Update the content of the second input
        this.syncInput($inputs[otherPriceType]);

    };

    /**
     * Add interactions: listen to changes on inputs
     * @return {Void}
     */
    Plugin.prototype.addInteractions = function () {
        var
            $this   = this,
            $inputs = this.$inputs,
            events  = 'keyup.' + this.identifier + ' change.' + this.identifier;

        $.each($inputs, function (input) {
            // prices
            if (input === 'tax' || input === 'notax') {
                $(this).bind(events, function () {
                    var
                        value          = Number.parseFloat($(this).val()) || null,
                        otherPriceType = $this.getOtherPriceType(input),
                        $otherInput    = $this.$inputs[otherPriceType];

                    $(this).data('value', value); // update this one
                    $this.syncInput($otherInput); // update the other one and the tax amount
                });
            // Tax rate
            } else if (input === 'taxRate') {
                $(this).bind(events, function () {
                    var value = Number.parseFloat($(this).val()) || null;

                    $(this).data('value', value);       // update tax rate
                    $this.syncInput($this.$inputs.tax); // update price with tax and the tax amount
                    $this.$taxRateDisplay.html($this.displayTaxRate(value)); // update tax rate display
                });
            }
        });
    };

    /**
     * Sync a price input with its counterpart, then update the tax amount.
     * Calculate the new value by checking the other input value and the tax rate.
     * @param {Object} $input - The input to synchronize
     * @return {Void}
     */
    Plugin.prototype.syncInput = function ($input) {

        var
            $this          = this,
            options        = this.options,
            priceType      = $input.data('priceType'),
            otherPriceType = this.getOtherPriceType(priceType),
            otherValue     = Number.parseFloat(this.$inputs[otherPriceType].data('value')) || null,
            taxRate        = this.getTaxRate(),
            newValue;

        if (Number.isNumeric(otherValue)) {
            // Weither we calculate ourself
            if (!options.urlCalculate) {
                newValue = this.calculatePrice(otherPriceType, otherValue);
                $this.updatePriceInput($input, newValue);
            // weither there is a script
            } else {
                $.ajax({
                    url: options.urlCalculate,
                    dataType: 'text',
                    data: {
                        price:     otherValue,
                        priceType: otherPriceType,
                        taxRate:   taxRate
                    },
                    custom: $this,
                    cache: false,
                    error: function (xhr, status, error) {
                        console.log(error);
                    }
                }).done(function (data) {
                    newValue = Number.parseFloat(data);
                    this.custom.updatePriceInput($input, newValue);
                });
            }
        } else {
            $this.updatePriceInput($input, null);
        }
    };

    /**
     * Update an input price with a given value
     * @param {Object} $input - The input to update
     * @param {float} value - The value
     * @return {Void}
     */
    Plugin.prototype.updatePriceInput = function ($input, value) {
        var
            options = this.options,
            valueDisplayed,
            taxAmount,
            taxAmountDisplayed;

        // Update price input
        valueDisplayed = Number.isNumeric(value) ? value.toFixed(options.precision) : value;
        $input
            .data('value', value)
            .val(valueDisplayed);
        this.highlight($input);

        // Update tax amount
        if (options.displayTaxAmount) {
            taxAmount          = this.getTaxAmount();
            taxAmountDisplayed = Number.isNumeric(taxAmount) ? taxAmount.toFixed(options.precision) : taxAmount;
            this.$inputs.taxAmount
                .data('value', taxAmount)
                .val(taxAmountDisplayed);
            this.highlight(this.$inputs.taxAmount);
        }

        // Event : onUpdate
        if (this.onUpdate && typeof this.onUpdate === 'function') {
            this.onUpdate($input, value);
        }

    };

    /**
     * Convert a price tax included to no-tax, or the other way
     * @param {string} priceType - The type of price inputed, `tax` or `notax`
     * @param {float} price - The price to convert
     * @return {float}
     */
    Plugin.prototype.calculatePrice = function (priceType, price) {
        var
            taxRate          = this.getTaxRate(),
            taxRateInPercent = this.options.taxRateInPercent,
            factor           = taxRateInPercent ? 100 : 1;

        if (Number.isNumeric(price) && Number.isNumeric(taxRate)) {
            switch (priceType) {
                case 'notax':
                    price = Number.parseFloat(price * factor * (factor + taxRate));
                    break;
                case 'tax':
                    price = Number.parseFloat(price * factor / (factor + taxRate));
                    break;
            }
        }

        return price;
    };

    /**
     * Get the complementary price type: `tax` or `notax`
     * @param {string} priceType
     * @return {string}
     */
    Plugin.prototype.getOtherPriceType = function (priceType) {
        return (priceType === 'notax' ? 'tax' : 'notax');
    };

    /**
     * Get the all no-tax price
     * @return {Number} float or NaN
     */
    Plugin.prototype.getPriceNoTax = function () {
        var priceNoTax = Number.parseFloat(this.$inputs.notax.data('value'));
        return priceNoTax;
    };

    /**
     * Get the all taxes included price
     * @return {Number} float or NaN
     */
    Plugin.prototype.getPriceTax = function () {
        var priceTax = Number.parseFloat(this.$inputs.tax.data('value'));
        return priceTax;
    };

    /**
     * Get the tax rate
     * @return {Number} float - Default = 0
     */
    Plugin.prototype.getTaxRate = function () {
        var
            taxRate,
            taxRateOptions = Number.parseFloat(this.options.taxRate) || 0;

        // Without input, we take the default tax
        if (!this.hasTaxRateInput) {
            taxRate = taxRateOptions;
        // Otherwise we take the input value
        } else {
            taxRate = Number.parseFloat(this.$inputs.taxRate.val()) || 0;
            // If the input is empty, there can be a default taxe rate
            if (!Number.isNumeric(this.$inputs.taxRate.val()) && this.options.taxRate) {
                taxRate = taxRateOptions;
            }
        }
        // taxRate = taxRate.toFixed(2);

        return taxRate;
    };

    /**
     * Get the tax amount
     * @return {Number|null} - Default = null
     */
    Plugin.prototype.getTaxAmount = function () {
        var
            taxAmount,
            priceNoTax = this.getPriceNoTax(),
            priceTax   = this.getPriceTax();

        if (Number.isNumeric(priceTax) && Number.isNumeric(priceNoTax)) {
            taxAmount = Math.max(priceTax - priceNoTax, 0);
        }

        return taxAmount;
    };

    /**
     * Display the tax rate in percentage
     * @param {Number} taxRate
     */
    Plugin.prototype.displayTaxRate = function (taxRate) {
        var
            taxRateInPercent = this.options.taxRateInPercent,
            isDefault = !Number.isNumeric(taxRate) && this.options.taxRate;

        if (!Number.isNumeric(taxRate)) {
            taxRate = this.getTaxRate();
        }
        if (taxRateInPercent === false) {
            taxRate *= 100;
        }
        taxRate = taxRate.toFixed(2);
        taxRate += '&#37;';

        // Add a mention if is the default tax rate
        if (isDefault) {
            taxRate += ' ('+this.options.defaultLabel+')';
        }

        return taxRate;
    };

    /**
     * Highlight an element
     * @param {Object} $element
     * @return {Void}
     */
    Plugin.prototype.highlight = function ($element) {
        $element.addClass('highlight');
        setTimeout(function() {
            $element.removeClass('highlight');
        }, 500);
    };

    // Polyfills
    Number.parseFloat = Number.parseFloat || function (value) {
        return parseFloat(value);
    };
    Number.isNumeric = Number.isNumeric || function (value) {
        return isFinite(value) && Number.parseFloat(value) == value;
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        // var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                data = $this.data('plugin_' + pluginName);

            if (!data) {
                $this.data('plugin_' + pluginName, (data = new Plugin(this, options)));
            }

            // Make it possible to access methods from public.
            // e.g `$element.editpricehelper('method');`
            // if (typeof options === 'string') {
            //     data[options].apply(data, args);
            // }
        });
    };

})(jQuery);
