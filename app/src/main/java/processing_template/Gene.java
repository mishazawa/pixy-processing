package processing_template;

import java.util.ArrayList;
import processing.core.PVector;

class Gene {
  DNA p;
  String type;

  ArrayList<Integer> adress = new ArrayList<>();
  int depth;
  int nodes = 0;

  int argsBinder;

  Gene(DNA p_, String type_) {
    p = p_;
    type = type_;

    switch (type) {
      case "x": case "y": nodes = 0; break;
      case "add": case "sub": case "mult": case "div": nodes = 2; break;
      case "pow2": case "sqrt": nodes = 1; break;
      case "powOf": case "logOf": nodes = 2; break;
      case "2pow": case "2log": nodes = 1; break;
      case "mod": nodes = 2; break;
      case "fract": case "floor": case "ceil": case "round": nodes = 1; break;
      case "min": case "max": nodes = 2; break;
      case "clamp": nodes = 3; break;
      case "abs": nodes = 1; break;
      case "sin": case "cos": case "tan": case "asin": case "acos": nodes = 1; break;
      case "atan": nodes = 2; break;
      case "mix": nodes = 3; break;
      case "if": nodes = 4; break;
      case "and": case "or": case "xor": nodes = 6; break;
      case "hsb2rgb": nodes = 1; break;
      case "combine": nodes = 3; break;
      case "setH": case "setS": case "setV": case "noise2": nodes = 2; break;
      case "rndm": {
        nodes = 0;
        if (p.args.size() >= 511) {
          argsBinder = 511;
        } else {
          argsBinder = p.args.size();
          float temp = Rnd.random(1);
          p.args.add(new PVector(temp, temp, temp));
        }
        break;
      }
      case "rndm3": {
        nodes = 0;
        if (p.args.size() >= 511) {
          argsBinder = 511;
        } else {
          argsBinder = p.args.size();
          float temp = Rnd.random(1);
          p.args.add(new PVector(
              temp + Rnd.randomGaussian() * 0.2f,
              temp + Rnd.randomGaussian() * 0.2f,
              temp + Rnd.randomGaussian() * 0.2f));
        }
        break;
      }
      default: break;
    }
  }

  String get() {
    String temp;

    if (type.equals("rndm") || type.equals("rndm3")) {
      temp = "g_arg(" + argsBinder;
    } else {
      temp = "g_" + type + "(";
      if (nodes > 0) {
        ArrayList<Gene> children = getChildren();
        for (int i = 0; i < children.size(); i++) {
          if (i > 0) temp += ",";
          temp += children.get(i).get();
        }
      }
    }
    temp += ")";

    return temp;
  }

  Gene copy(DNA p_) {
    Gene temp = new Gene(p_, type);
    temp.adress = new ArrayList<>(adress);
    temp.depth = depth;
    temp.nodes = nodes;
    temp.argsBinder = argsBinder;
    return temp;
  }

  void setAdress(ArrayList<Integer> a) {
    adress = a;
    depth = a.size();
  }

  ArrayList<Gene> getChildren() {
    ArrayList<Gene> children = new ArrayList<>();
    for (int i = 0; i < nodes; i++) {
      ArrayList<Integer> con = new ArrayList<>(adress);
      con.add(i);
      Gene child = p.getGeneByAdress(con);
      children.add(child);
    }
    return children;
  }
}
