# Edit Price Helper

> A small jQuery plugin to help edit prices with taxes.

The goal of this script is to give a real-time feedback of the taxes when you edit a price.

Say you have a no-tax price input and another one for the tax rate on a form: the script will add an all taxes included price input and the tax amount, keeping all values in sync. The added inputs are just here to help fill the original inputs, their values are not meant to be posted.

The styles provided are the bare minimum in order to be as unobstrusive as possible.

So for instance, the script turns this:
<div class="example">
<label for="example0">No-tax Price</label>
<input id="example0" name="a" type="number" value="" steps="0.01" min="0">
<label for="taxexample0">Tax rate</label>
<select id="taxexample0" name="tax">
<option value="">Default</option>
<option value="0">0%</option>
<option value="0.125">12.5%</option>
<option value="0.2">20%</option>
</select>
</div>

Into something like this:
<div class="example">
<div class="form-control">
<label for="price0" class="form-label">No-tax Price</label>
<div class="form-input">
<input id="price0" name="price0" type="number" value="10" step="0.01" min="0">
</div>
</div>

<div class="form-control">
<label for="tax0" class="form-label">Tax Rate</label>
<div class="form-input">
<select id="tax0" name="tax0">
<option value="">Default</option>
<option value="0">0%</option>
<option value="0.125">12.5%</option>
<option value="0.2">20%</option>
</select>
</div>
</div>
</div>

## Installation

* Via [npm](https://www.npmjs.org/) : ```npm install --save editpricehelper```
* Download manually on [Github](https://github.com/tcharlss/editpricehelper/releases/tag/v0.1.0-alpha.1)

The script is also hosted on CDNs like [unpkg](https://unpkg.com/editpricehelper) or [jsdelivr](https://www.jsdelivr.com/package/npm/editpricehelper?path=dist)

## Quick start

You need at least one input for the price and a tax rate. The price input can be either no-tax or all taxes included (in that case you need to indicate which type in the options).
The tax rate can be either editable with an existing input, or a fixed value given in the options.

```html
<!-- Load the super tiny stylesheet -->
<head>
    <link rel="stylesheet" href="path/to/editpricehelper.min.css">
</head>

<!-- Have a price input and eventually a tax input -->
<label for="price">No-tax Price</label>
<input id="price" name="price" type="number" value="10" steps="0.01" min="0">

<label for="tax">Tax</label>
<input id="tax" name="tax" type="number" value="0.2" steps="0.01" min="0" max="1">

<!-- Load jQuery and editpricehelper, call the function and indicate a tax rate input or a fixed value -->
<script src="path/to/jquery.min.js"></script>
<script src="path/to/jquery.editpricehelper.min.js"></script>
<script>
    $(function() {
        var priceHelper = $("#price").editpricehelper({
            taxRateInput: '#tax',
        });
    });
</script>
```

## Examples

### Fixed tax

If there's no input for the tax, you need to give a default one with the `taxRate` option.

<div class="example">
<div class="form-control">
<label for="price1">No-tax Price</label>
<input id="price1" name="price1" type="number" value="10" steps="0.01" min="0">
</div>
</div>

```javascript
$('#price').editpricehelper({
    taxRate: '0.33'
});
```

### Default tax fallback

Sometimes you can have a default tax rate applied if the input is empty. In that case use the `taxRateInput` *and* the`taxRate` options a the same time.

<div class="example">
<div class="form-control">
<label for="price2">No-tax Price</label>
<input id="price2" name="price2" type="number" value="10" steps="0.01" min="0">
</div>

<div class="form-control">
<label for="tax2" class="form-label">Tax Rate</label>
<div class="form-input">
<select id="tax2" name="tax2">
<option value="">Default</option>
<option value="0">0%</option>
<option value="0.125">12.5%</option>
<option value="0.2">20%</option>
</select>
</div>
</div>
</div>

```javascript
$('#price').editpricehelper({
    taxRateInput: '#tax',
    taxRate: '0.33'
});
```

### Labels and classes

All the labels can be changed, and the tax amount can be hidden:

<div class="example">
<div class="form-control">
<label for="price3">No-tax Price</label>
<input id="price3" name="price3" type="number" value="10" steps="0.01" min="0">
</div>
</div>

```javascript
$('#price').editpricehelper({
    taxRate: '0.33',
    mainLabel: 'My price',
    priceNoTaxLabel: 'Before tax',
    priceTaxLabel: 'With taxes',
    displayTaxAmount: false
});
```

## Options

Option       | Type | Default | Values
------------ | ----------- | -------- | ------
priceType        | `string` | 'notax' | Type of price of the main input: `notax` `tax`
otherPriceInput  | `string` | null  | Selector of an existing input containing the complementary price. Otherwise, it will be created.
taxRateInput     | `string` | null  | Selector of an existing input containing the tax rate. Otherwise, a default taxe rate is needed.
taxRate          | `float` | null  | Default tax rate to apply in case there's no input or no value is entered.
taxRateInPercent | `boolean` | false | Indicate weither the tax rate is in percent or not, eg. `20` instead of `0.2` for instance.
precision        | `float` | 2     | Precision of the displayed numbers.
urlCalculate     | `string` | null  | URL to a script calculating the prices. Otherwise, they will be calculated in-house.
displayTaxAmount | `boolean` | true  | Display the tax amount or not.

Option       | Default
------------ | --------
mainLabel       | Price
priceTaxLabel   | All taxes included
priceNoTaxLabel | Pre-tax
taxAmountLabel  | Tax
defaultLabel    | default

Option       | Default
------------ |  --------
priceTaxClass       | price price_tax
priceNoTaxClass     | price price_notax
taxAmountClass      | price price_tax-amount
taxRateClass        | price price_tax-rate
taxRateDisplayClass | price__tax-rate
labelClass          | price__label
inputClass          | price__input

Events        | Trigger
------------- | -------------
onInit | Called after the script has been initialized
onUpdate | Called after a price input has been updated


<script>
  $('#price0').editpricehelper({ taxRateInput: '#tax0' });
  $('#price1').editpricehelper({ taxRate: '0.33' });
  $('#price2').editpricehelper({
        taxRate: '0.33',
        mainLabel: 'My price',
        priceNoTaxLabel: 'Before tax',
        priceTaxLabel: 'With taxes',
        displayTaxAmount: false
    });
</script>
<style>
input[type=number],
input[type=text] {
    border: 1px solid #ddd;
    padding: 0.33em 0 0.33em 0.33em;
    border-radius: 0.2em;
    transition: all 0.2s;
}
input:focus { border-color: #3e31f8; }
.form-control {
    display: flex;
    width: 100%;
    margin-bottom: 2em;
}
.form-label { flex: 0 0 6em; }
.form-input { flex: 1 0 auto; }
.price {
    display: flex;
    align-items: center;
    margin-bottom: 0.5em;
}
.price__label {
    flex: 0 0 9em;
    color: #8727b3;
    font-size: 0.9em;
}
.price__input { flex: 1 1 auto; }
.example { padding-left: 1em; border-left: 2px solid #8727b3 }
</style>