exports.isArray = function(value){
    return value.constructor.toString().indexOf("Array") > -1;
}