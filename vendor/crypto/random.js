/* jshint ignore:start */
/*
 * Random Number generation
 */

Random = {};

Random.getRandomInteger = function(max) {
  var bit_length = max.bitLength();
  var random;
  random = sjcl.random.randomWords(bit_length / 32, 0);
  // we get a bit array instead of a BigInteger in this case
  var rand_bi = new BigInt(sjcl.codec.hex.fromBits(random), 16);
  return rand_bi.mod(max);
};

/* jshint ignore:end */