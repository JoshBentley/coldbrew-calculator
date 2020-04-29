<script>
  import calculator from "../calculators.js";

  let coffee = "";
  let water = "";
  let newWater;
  let newCoffee;
  let selectedWater;
  let selectedCoffee;

  function waterChange() {
    coffee = calculator
      .calculate(selectedWater, selectedCoffee)(water)
      .toFixed(2);
  }

  function coffeeChange() {
    water = calculator
      .calculate(selectedCoffee, selectedWater)(coffee)
      .toFixed(2);
  }

  function clear() {
    coffee = "";
    water = "";
  }
</script>

<style>  
  .container {
    max-width: 600px;
    border: solid 1px lightgray;
    margin-top: 50px;
    padding: 100px;
    justify-content: center;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    background-color: 	 #ceddef;
  }

  .container .label {
    height: 39px;
    width: 45px;
  }

  .container .selector {
    width: 150px;
  }  

  .input-group{
    margin: 5px;
  }
  
</style>

<div class="container rounded">
  <div class="input-group">
    <div class="input-group-prepend">
      <span class="input-group-text label">💧</span>
    </div>
    <input
      class="waterInput"
      type="number"
      bind:value={water}
      on:input={waterChange} />
    <div class="input-group-append">
      <select
        name="water-selector"
        id="water"
        class="selector water-selector"
        bind:value={selectedWater}
        on:change={coffeeChange}>
        <option value="Gallons">Gallons</option>
        <option value="Liters">Liters</option>
        <option value="FluidOunces">Fluid Ounces</option>
        <option value="Cups">Cups</option>
        <option value="Millileters">Millileters</option>
        <option value="WatGrams">Grams</option>
      </select>
    </div>
  </div>

  <div class="input-group">
    <div class="input-group-prepend">
      <span class="input-group-text label">☕</span>
    </div>
    <input
      class="coffeeInput"
      type="number"
      bind:value={coffee}
      on:input={coffeeChange} />
    <div class="input-group-append">
      <select
        name="coffee-selector"
        id="coffee"
        class="selector coffee-selector"
        bind:value={selectedCoffee}
        on:change={waterChange}>
        <option value="Pounds">Pounds</option>
        <option value="DryOunces">Dry Ounces</option>
        <option value="CofGrams">Grams</option>
      </select>
    </div>
  </div>
</div>
