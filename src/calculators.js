module.exports = {
    calculate
}

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