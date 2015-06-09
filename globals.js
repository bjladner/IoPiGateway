// ****************************************************************************
//      HELPER FUNCTIONS
// ****************************************************************************

module.exports = {
    timeoutOffset: timeoutOffset,
    determineValue: determineValue,
    isNumeric: isNumeric
}

// http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric/1830844#1830844
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

// extracts the value of a given metric based on the regular expression and any
// valuation function defined for that metric
function determineValue(matchingMetric, matchingToken) {
    var actualValueToProcess = matchingToken[1] || matchingToken[0];
    var result;
    if (matchingMetric.valuation != undefined)
        result = matchingMetric.valuation(actualValueToProcess);
    else 
        result = matchingMetric.value || actualValueToProcess;
    if (isNumeric(result))
        return Number(result);
    else 
        return result;
};

// calculates the milliseconds timeout remaining until a given time of the day
// (if it's 8AM now and time given was 3AM, it will calculate to the next day
// 3AM) offset can be used to add more time to the calculated timeout, for
// instance to delay by one day: pass offset=86400000
function timeoutOffset(hour, minute, second, millisecond, offset) {
    var result = new Date().setHours(hour,minute,second || 0, millisecond || 0);
    result = result < new Date().getTime() ? (result + 86400000) : result;
    result -= new Date().getTime();
    if (isNumeric(offset)) 
        result += offset;
    return result;
};

