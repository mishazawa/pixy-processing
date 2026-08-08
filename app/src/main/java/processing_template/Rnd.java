package processing_template;

import java.util.Random;

class Rnd {
  private static final Random RANDOM = new Random();

  static float random(float high) {
    return RANDOM.nextFloat() * high;
  }

  static float random(float low, float high) {
    return low + RANDOM.nextFloat() * (high - low);
  }

  static float randomGaussian() {
    return (float) RANDOM.nextGaussian();
  }
}
