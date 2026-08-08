package processing_template;

class Genes {
  static final String[] VALUES = new String[] {
      "x",
      "y",
      "rndm",
      "rndm3"
  };
  static final float[] VALUES_RATE = new float[] { 1, 1, 0.5f, 0.5f };

  static final String[] BASIC_MATH = new String[] { "add", "sub", "mult", "div" };
  static final float[] BASIC_MATH_RATE = new float[] { 1, 1, 1, 1 };

  static final String[] EXPONENTIAL = new String[] { "pow2", "sqrt", "powOf", "logOf", "2pow", "2log" };
  static final float[] EXPONENTIAL_RATE = new float[] { 1, 1, 0.3f, 0.3f, 0.3f, 0.3f };

  static final String[] ROUND = new String[] { "mod", "fract", "floor", "ceil", "round" };
  static final float[] ROUND_RATE = new float[] { 0.5f, 1, 1, 1, 1, 1 };

  static final String[] TRIG = new String[] { "sin", "cos", "tan", "asin", "acos", "atan" };
  static final float[] TRIG_RATE = new float[] { 1, 1, 0.1f, 0.1f, 0.1f, 0.5f };

  static final String[] CONSTRAIN = new String[] { "min", "max", "clamp", "abs" };
  static final float[] CONSTRAIN_RATE = new float[] { 1, 1, 0.5f, 1 };

  static final String[] MIX = new String[] { "mix" };
  static final float[] MIX_RATE = new float[] { 1 };

  static final String[] LOGIC = new String[] { "if", "and", "or", "xor" };
  static final float[] LOGIC_RATE = new float[] { 1, 1, 1, 1 };

  static final String[] ELSE = new String[] { "hsb2rgb", "combine", "setH", "setS", "setV" };
  static final float[] ELSE_RATE = new float[] { 1, 1, 1, 1, 1, 1, 1 };

  static final String[][] METHODS = new String[][] {
      BASIC_MATH, EXPONENTIAL, ROUND, TRIG, CONSTRAIN, MIX, LOGIC, ELSE
  };

  static final float[] METHODS_GROUP_RATE = new float[] { 1.5f, 0.01f, 0.01f, 0.1f, 0.1f, 0.1f, 0.1f, 0.1f };

  static final float[][] METHODS_RATE = new float[][] {
      BASIC_MATH_RATE, EXPONENTIAL_RATE, ROUND_RATE, TRIG_RATE, CONSTRAIN_RATE, MIX_RATE, LOGIC_RATE, ELSE_RATE
  };

  static String methodGroupName(int n) {
    switch (n) {
      case 0: return "Basic Math";
      case 1: return "Exponential";
      case 2: return "Round";
      case 3: return "Trigonometry";
      case 4: return "Constrain";
      case 5: return "Mix";
      case 6: return "Logic";
      case 7: return "Else";
      default: return "Oops";
    }
  }

  private Genes() {
  }
}
